"""
Pydantic models for API request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
from datetime import date
from uuid import UUID


# ============================================
# REQUEST MODELS
# ============================================

class SearchFilters(BaseModel):
    """Optional filters for search queries"""
    type: Optional[str] = Field(None, description="Legal unit type (law, decree, decision, etc.)")
    year: Optional[int] = Field(None, description="Year of publication")
    issue_number: Optional[int] = Field(None, description="Issue number")
    issuer: Optional[str] = Field(None, description="Issuing ministry/organization")
    date_from: Optional[date] = Field(None, description="Effective date range start")
    date_to: Optional[date] = Field(None, description="Effective date range end")
    entity_id: Optional[UUID] = Field(None, description="Filter by extracted entity")


class SearchRequest(BaseModel):
    """Search request payload"""
    query: str = Field(..., description="Search query in Arabic or French", min_length=0)
    limit: int = Field(10, description="Maximum number of results", ge=1, le=100)
    offset: int = Field(0, description="Pagination offset", ge=0)
    sort_by: Optional[str] = Field("relevance", description="Sort order: relevance, newest, oldest")
    filters: Optional[SearchFilters] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "query": "قوانين الضرائب للشركات الصغيرة",
                "limit": 10,
                "offset": 0,
                "sort_by": "relevance",
                "filters": {
                    "type": "decree",
                    "year": 2025
                }
            }
        }


# ============================================
# RESPONSE MODELS
# ============================================

class IssueSource(BaseModel):
    """Source information for a legal unit"""
    issue_number: int
    year: int
    page_number: Optional[int] = None
    publication_date: Optional[Union[date, str]] = None
    date_precision: Optional[str] = Field("year_only", description="exact, year_only, unverified")


class LegalUnitBase(BaseModel):
    """Base legal unit information"""
    id: UUID
    type: Optional[str] = None
    unit_number: Optional[str] = None
    title: Optional[str] = None
    issuer: Optional[str] = None
    effective_date: Optional[Union[date, str]] = None
    is_table: bool
    source: IssueSource


class LegalUnitSummary(LegalUnitBase):
    """Legal unit summary for search results"""
    content_preview: str = Field(..., description="Preview snippet around the match")
    similarity: float = Field(..., description="Similarity score (0-1)")
    match_type: Optional[str] = Field("semantic", description="exact_reference, semantic, browse")


class LegalUnitDetail(LegalUnitBase):
    """Full legal unit details"""
    content: str
    table_data: Optional[Union[List[Any], Dict[str, Any]]] = None
    is_supplement: bool
    source_pdf_url: Optional[str] = None


class SearchResponse(BaseModel):
    """Search results response"""
    results: List[LegalUnitSummary]
    total: int
    page: int = 1
    page_size: int = 10
    has_more: bool = False
    query_time_ms: float
    coverage_note: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "results": [
                    {
                        "id": "abc-123-def",
                        "type": "decree",
                        "unit_number": "1/1277",
                        "title": "تحديد دقائق تطبيق أحكام المادة ٨٣",
                        "issuer": "وزارة المالية",
                        "effective_date": "2024-12-19",
                        "is_table": False,
                        "content_preview": "قرار رقم ۱/۱۲۷۷ تاریخ ۱۹ كانون الأول سنة ۲۰۲٤...",
                        "similarity": 0.89,
                        "match_type": "exact_reference",
                        "source": {
                            "issue_number": 9156,
                            "year": 2025,
                            "page_number": 3,
                            "publication_date": None,
                            "date_precision": "year_only"
                        }
                    }
                ],
                "total": 10,
                "page": 1,
                "page_size": 10,
                "has_more": False,
                "query_time_ms": 45.2
            }
        }


class Issue(BaseModel):
    """Gazette issue metadata"""
    id: UUID
    issue_number: int
    year: int
    total_pages: Optional[int]
    publication_date: Optional[date]


class IssueListResponse(BaseModel):
    """List of issues response"""
    issues: List[Issue]
    total: int


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    database: str
    version: str


class StatItem(BaseModel):
    """Single statistic item"""
    name: str
    value: int


class StatsResponse(BaseModel):
    """Aggregated statistics response"""
    total_legal_units: int
    total_issues: int
    by_type: List[StatItem]
    by_issuer: List[StatItem]
    by_year: List[StatItem]


class HeatmapItem(BaseModel):
    """Calendar heatmap item"""
    date: str
    count: int


class KeywordItem(BaseModel):
    """Top keyword item"""
    text: str
    value: int


class EntityItem(BaseModel):
    """Extracted entity item"""
    id: UUID
    name: str = Field(..., description="Entity name")
    type: str = Field(..., description="Entity type (PERSON, ORG, LOC)")
    count: Optional[int] = Field(None, description="Frequency of occurrence")


class TreemapItem(BaseModel):
    """Treemap item"""
    name: str
    value: int


class MapItem(BaseModel):
    """Regional map item"""
    region: str
    value: int
    lat: Optional[float] = None
    lng: Optional[float] = None


class TimelineItem(BaseModel):
    """Legislative timeline event"""
    date: str
    date_precision: str = "exact"
    title: str
    status: str
    description: Optional[str] = None
    id: UUID


class TrendItem(BaseModel):
    """Historical trend data point"""
    year: int
    value: int
    topic: str
