"""
FastAPI application for Lebanese Gazette search
"""
from fastapi import FastAPI, HTTPException, Query, Path, Depends
from fastapi.middleware.cors import CORSMiddleware
from uuid import UUID
import logging

import sys
import pathlib
sys.path.append(str(pathlib.Path(__file__).parent))


from typing import List
from models import (
    SearchRequest, SearchResponse, LegalUnitDetail, 
    IssueListResponse, HealthResponse, StatsResponse,
    HeatmapItem, KeywordItem, EntityItem,
    TreemapItem, MapItem, TimelineItem, TrendItem
)
from search_service import SearchService
from entity_service import EntityExtractionService
from bookmarks_service import BookmarkService, FolderSchema, BookmarkSchema
from auth import get_current_user_id

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Lebanese Gazette Search API",
    description="Semantic search API for Lebanese Official Gazette legal units",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize search service
try:
    search_service = SearchService()
    logger.info("✅ Search service initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize search service: {e}")
    search_service = None

# Initialize entity service (lazy)
try:
    entity_service = EntityExtractionService()
    logger.info("✅ Entity service initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize entity service: {e}")
    entity_service = None

# Initialize bookmark service
try:
    bookmark_service = BookmarkService()
    logger.info("✅ Bookmark service initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize bookmark service: {e}")
    bookmark_service = None


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Lebanese Gazette Search API",
        "version": "1.0.0",
        "endpoints": {
            "search": "POST /search",
            "issues": "GET /issues/{year}",
            "legal_unit": "GET /legal-units/{id}",
            "health": "GET /health"
        }
    }


@app.get("/debug-env", tags=["Health"])
async def debug_env():
    import os
    import traceback
    import importlib.metadata
    
    init_error = None
    try:
        from search_service import SearchService
        s = SearchService()
        init_status = "success"
    except Exception as e:
        init_status = "failed"
        init_error = f"{type(e).__name__}: {str(e)}\n{traceback.format_exc()}"
        
    versions = {}
    for pkg in ["httpx", "supabase", "gotrue", "postgrest", "fastapi"]:
        try:
            versions[pkg] = importlib.metadata.version(pkg)
        except Exception:
            versions[pkg] = "not found"
            
    return {
        "supabase_url_exists": os.getenv("SUPABASE_URL") is not None and len(os.getenv("SUPABASE_URL").strip()) > 0,
        "supabase_service_key_exists": os.getenv("SUPABASE_SERVICE_KEY") is not None and len(os.getenv("SUPABASE_SERVICE_KEY").strip()) > 0,
        "cohere_api_key_exists": os.getenv("COHERE_API_KEY") is not None and len(os.getenv("COHERE_API_KEY").strip()) > 0,
        "next_public_supabase_url_exists": os.getenv("NEXT_PUBLIC_SUPABASE_URL") is not None and len(os.getenv("NEXT_PUBLIC_SUPABASE_URL").strip()) > 0,
        "next_public_supabase_anon_key_exists": os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") is not None and len(os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY").strip()) > 0,
        "search_service_init_status": init_status,
        "search_service_init_error": init_error,
        "package_versions": versions
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint"""
    if search_service is None:
        raise HTTPException(status_code=503, detail="Search service not initialized")
    
    try:
        # Test database connection
        search_service.supabase.table('issues').select('id').limit(1).execute()
        db_status = "connected"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "disconnected"
    
    return HealthResponse(
        status="healthy" if db_status == "connected" else "unhealthy",
        database=db_status,
        version="1.0.0"
    )


@app.post("/search", response_model=SearchResponse, tags=["Search"])
async def search(request: SearchRequest):
    """
    Semantic search for legal units
    
    Performs vector similarity search using Cohere embeddings to find
    the most relevant legal units for a given query.
    """
    if search_service is None:
        raise HTTPException(status_code=503, detail="Search service not initialized")
    
    try:
        logger.info(f"Search query: {request.query[:50]}... (limit={request.limit})")
        
        results, query_time_ms = search_service.semantic_search(
            query=request.query,
            limit=request.limit,
            filters=request.filters
        )
        
        logger.info(f"Found {len(results)} results in {query_time_ms:.2f}ms")
        
        return SearchResponse(
            results=results,
            total=len(results),
            query_time_ms=query_time_ms
        )
    
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@app.get("/legal-units/{unit_id}", response_model=LegalUnitDetail, tags=["Legal Units"])
async def get_legal_unit(unit_id: UUID):
    """
    Get full details of a specific legal unit
    
    Returns the complete legal unit including full content, metadata,
    and source information.
    """
    if search_service is None:
        raise HTTPException(status_code=503, detail="Search service not initialized")
    
    try:
        result = search_service.get_legal_unit(unit_id)
        
        if result is None:
            raise HTTPException(status_code=404, detail=f"Legal unit {unit_id} not found")
        
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching legal unit {unit_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch legal unit: {str(e)}")


@app.get("/issues/{year}", response_model=IssueListResponse, tags=["Issues"])
async def list_issues(year: int = Path(..., ge=2014, le=2025)):
    """
    List all gazette issues for a specific year
    
    Returns metadata for all Official Gazette issues published in the given year.
    """
    if search_service is None:
        raise HTTPException(status_code=503, detail="Search service not initialized")
    
    try:
        issues = search_service.list_issues(year)
        
        return IssueListResponse(
            issues=issues,
            total=len(issues)
        )
    
    except Exception as e:
        logger.error(f"Error listing issues for year {year}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list issues: {str(e)}")


@app.get("/stats", response_model=StatsResponse, tags=["Analytics"])
async def get_stats():
    """Get aggregated statistics about the gazette data"""
    if search_service is None:
        raise HTTPException(status_code=503, detail="Search service not initialized")
        
    try:
        return search_service.get_statistics()
    except Exception as e:
        logger.error(f"Error getting statistics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")


@app.get("/stats/heatmap", response_model=List[HeatmapItem], tags=["Analytics"])
async def get_heatmap():
    """Get activity heatmap data"""
    if search_service is None:
        raise HTTPException(status_code=503, detail="Search service not initialized")
    try:
        return search_service.get_heatmap_data()
    except Exception as e:
        logger.error(f"Error getting heatmap: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get heatmap: {str(e)}")


@app.get("/stats/keywords", response_model=List[KeywordItem], tags=["Analytics"])
async def get_keywords():
    """Get top keywords from titles"""
    if search_service is None:
        raise HTTPException(status_code=503, detail="Search service not initialized")
    try:
        return search_service.get_top_keywords()
    except Exception as e:
        logger.error(f"Error getting keywords: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get keywords: {str(e)}")


@app.post("/extract/{unit_id}", tags=["Entities"])
async def extract_entities(unit_id: UUID):
    """
    Trigger entity extraction for a specific legal unit
    """
    if entity_service is None or search_service is None:
        raise HTTPException(status_code=503, detail="Services not initialized")
        
    try:
        # 1. Fetch content
        unit = search_service.get_legal_unit(unit_id)
        if not unit:
            raise HTTPException(status_code=404, detail="Legal unit not found")
            
        # 2. Extract
        logger.info(f"Extracting entities for unit {unit_id}...")
        entities = entity_service.extract_entities(unit.content)
        
        # 3. Save
        entity_service.save_entities(str(unit_id), entities)
        
        return {"status": "success", "extracted_count": len(entities)}
        
    except Exception as e:
        logger.error(f"Extraction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")


@app.get("/entities/top", response_model=List[EntityItem], tags=["Entities"])
async def get_top_entities(type: str = Query(None, description="Filter by entity type (PERSON, ORG, LOC)"), limit: int = 50):
    """
    Get top entities for the sidebar
    """
    if entity_service is None:
        raise HTTPException(status_code=503, detail="Entity service not initialized")
        
    try:
        raw_entities = entity_service.get_top_entities(type, limit)
        # Transform to model
        return [
            EntityItem(
                id=e['id'], 
                name=e['name'], 
                type=e['type'],
                count=0 # Placeholder since we don't have counts yet
            ) for e in raw_entities
        ]
    except Exception as e:
        logger.error(f"Failed to fetch entities: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch entities: {str(e)}")

    except Exception as e:
        logger.error(f"Failed to fetch entities: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch entities: {str(e)}")


@app.get("/stats/treemap", response_model=List[TreemapItem], tags=["Analytics"])
async def get_treemap():
    """Get activity treemap data"""
    try:
        if not search_service: raise HTTPException(503, "Search service unavailable")
        return search_service.get_activity_treemap()
    except Exception as e:
        logger.error(f"Treemap error: {e}")
        raise HTTPException(500, str(e))

@app.get("/stats/map", response_model=List[MapItem], tags=["Analytics"])
async def get_map():
    """Get regional map data"""
    try:
         if not search_service: raise HTTPException(503, "Search service unavailable")
         return search_service.get_regional_map()
    except Exception as e:
        logger.error(f"Map error: {e}")
        raise HTTPException(500, str(e))

@app.get("/stats/timeline", response_model=List[TimelineItem], tags=["Analytics"])
async def get_timeline(q: str = Query(..., min_length=1, description="Bill/Topic to track")):
    """Get legislative timeline for a query"""
    try:
         if not search_service: raise HTTPException(503, "Search service unavailable")
         return search_service.get_legislative_timeline(q)
    except Exception as e:
        logger.error(f"Timeline error: {e}")
        raise HTTPException(500, str(e))

@app.get("/stats/trends", response_model=List[TrendItem], tags=["Analytics"])
async def get_trends(topic: str = Query(..., min_length=1)):
    """Get historical trends for a topic"""
    try:
         if not search_service: raise HTTPException(503, "Search service unavailable")
         return search_service.get_historical_trends(topic)
    except Exception as e:
        logger.error(f"Trends error: {e}")
        raise HTTPException(500, str(e))


@app.get("/library", tags=["Library"])
async def get_library(user_id: str = Depends(get_current_user_id)):
    """Get user's folders and bookmarks"""
    if bookmark_service is None:
        raise HTTPException(status_code=503, detail="Bookmark service not initialized")
    try:
        return bookmark_service.get_user_library(user_id)
    except Exception as e:
        logger.error(f"Library error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch library: {str(e)}")


@app.post("/library/folders", tags=["Library"])
async def create_folder(
    name: str, 
    parent_id: str = None, 
    user_id: str = Depends(get_current_user_id)
):
    """Create a new folder"""
    if bookmark_service is None:
        raise HTTPException(503, "Bookmark service unavailable")
    try:
        return bookmark_service.create_folder(user_id, name, parent_id)
    except Exception as e:
        logger.error(f"Create folder error: {e}")
        raise HTTPException(500, str(e))


@app.delete("/library/folders/{folder_id}", tags=["Library"])
async def delete_folder(folder_id: str, user_id: str = Depends(get_current_user_id)):
    """Delete a folder"""
    if bookmark_service is None:
        raise HTTPException(503, "Bookmark service unavailable")
    try:
        success = bookmark_service.delete_folder(user_id, folder_id)
        if not success:
            raise HTTPException(404, "Folder not found or unauthorized")
        return {"status": "deleted"}
    except HTTPException: raise
    except Exception as e:
        logger.error(f"Delete folder error: {e}")
        raise HTTPException(500, str(e))


@app.post("/library/bookmarks", tags=["Library"])
async def add_bookmark(
    legal_unit_id: str,
    folder_id: str = None,
    note: str = None,
    user_id: str = Depends(get_current_user_id)
):
    """Add a bookmark"""
    if bookmark_service is None:
        raise HTTPException(503, "Bookmark service unavailable")
    try:
        return bookmark_service.add_bookmark(user_id, legal_unit_id, folder_id, note)
    except Exception as e:
        logger.error(f"Add bookmark error: {e}")
        raise HTTPException(500, str(e))


@app.delete("/library/bookmarks/{bookmark_id}", tags=["Library"])
async def remove_bookmark(bookmark_id: str, user_id: str = Depends(get_current_user_id)):
    """Remove a bookmark"""
    if bookmark_service is None:
        raise HTTPException(503, "Bookmark service unavailable")
    try:
        success = bookmark_service.remove_bookmark(user_id, bookmark_id)
        if not success:
            raise HTTPException(404, "Bookmark not found or unauthorized")
        return {"status": "deleted"}
    except HTTPException: raise
    except Exception as e:
        logger.error(f"Remove bookmark error: {e}")
        raise HTTPException(500, str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
