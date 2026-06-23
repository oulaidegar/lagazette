"""
Search service layer - handles database queries and vector search
"""
import os
import time
from typing import List, Optional, Tuple
from uuid import UUID
import cohere
from supabase import create_client, Client
from dotenv import load_dotenv
from pathlib import Path

from models import (
    SearchFilters, LegalUnitSummary, LegalUnitDetail, Issue, IssueSource,
    StatsResponse, StatItem, HeatmapItem, KeywordItem, TreemapItem, 
    MapItem, TimelineItem, TrendItem
)

# Load environment variables
load_dotenv(Path(__file__).parent.parent / ".env")


class SearchService:
    def __init__(self):
        # Initialize Supabase client
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
        
        self.supabase: Client = create_client(supabase_url, supabase_key)
        
        # Initialize Cohere client
        cohere_key = os.getenv("COHERE_API_KEY")
        if not cohere_key:
            raise ValueError("COHERE_API_KEY must be set")
        
        self.cohere_client = cohere.ClientV2(api_key=cohere_key)
    
    def _generate_query_embedding(self, query: str) -> List[float]:
        """Generate embedding for search query using Cohere"""
        response = self.cohere_client.embed(
            texts=[query],
            model='embed-multilingual-v3.0',
            input_type='search_query',  # Note: search_query for queries, search_document for documents
            embedding_types=["float"]
        )
        return response.embeddings.float_[0]
    
    
    def _generate_smart_preview(self, content: str, query: str = None, entity_name: str = None) -> str:
        """Generate a preview snippet centered around the match"""
        if not content:
            return ""
            
        target = entity_name if entity_name else query
        if not target or len(target) < 3:
            return content[:300] + "..." if len(content) > 300 else content
            
        # Find match
        idx = content.lower().find(target.lower())
        if idx == -1:
             return content[:300] + "..." if len(content) > 300 else content
             
        # Extract window
        start = max(0, idx - 100)
        end = min(len(content), idx + 200)
        snippet = content[start:end]
        
        # Clean up cut-off words (optional, keep simple for now)
        if start > 0:
            snippet = "..." + snippet
        if end < len(content):
            snippet = snippet + "..."
            
        return snippet

    def semantic_search(
        self, 
        query: str, 
        limit: int = 10, 
        filters: Optional[SearchFilters] = None
    ) -> Tuple[List[LegalUnitSummary], float]:
        """
        Perform semantic search using vector similarity.
        Handles 'No Query + Entity Filter' case for browsing.
        Returns: (results, query_time_ms)
        """
        start_time = time.time()
        
        filtered_results = []
        entity_name = None
        
        # Check if this is a "Browse by Entity" or "Browse by Issue" case 
        # (Empty query but Entity Filter or Issue Filter present)
        is_browse_mode = (not query or not query.strip()) and filters and (filters.entity_id or (filters.year and filters.issue_number))

        if is_browse_mode:
            # Fetch Entity Name for preview
            try:
                allowed_ids = []
                
                # Case 1: Browse by Entity
                if filters.entity_id:
                    ent_res = self.supabase.table('entities').select('name').eq('id', str(filters.entity_id)).execute()
                    if ent_res.data:
                        entity_name = ent_res.data[0]['name']
                    
                    lue_res = self.supabase.table('legal_unit_entities')\
                        .select('legal_unit_id')\
                        .eq('entity_id', str(filters.entity_id))\
                        .limit(limit)\
                        .execute()
                    allowed_ids = [row['legal_unit_id'] for row in lue_res.data]
                
                # Case 2: Browse by Issue
                elif filters.year and filters.issue_number:
                    # Find issue ID first
                    issue_res = self.supabase.table('issues').select('id').eq('year', filters.year).eq('issue_number', filters.issue_number).execute()
                    
                    if issue_res.data:
                        issue_id = issue_res.data[0]['id']
                        units_query = self.supabase.table('legal_units').select('id').eq('issue_id', issue_id).limit(limit).execute()
                        allowed_ids = [u['id'] for u in units_query.data]
                    else:
                        allowed_ids = []

                if not allowed_ids:
                    return [], (time.time() - start_time) * 1000
                    
                # Fetch units with issue info
                units_res = self.supabase.table('legal_units')\
                    .select('id, type, unit_number, title, issuer, content, issues!inner(issue_number, year), page_number')\
                    .in_('id', allowed_ids)\
                    .execute()
                    
                # Add dummy similarity
                filtered_results = [{**row, 'similarity': 1.0} for row in units_res.data]

            except Exception as e:
                print(f"Error in browse mode: {e}")
                return [], 0
        
        else:
            # Standard Semantic Search
            if not query:
                # Fallback: just return latest units? Or empty?
                # For now return random/latest if no query and no filters (not common use case here)
                pass 
            else:
                # Generate embedding for query
                query_embedding = None
                try:
                    query_embedding = self._generate_query_embedding(query)
                except Exception as e:
                    print(f"Cohere Embedding Error (likely billing): {e}")
                
            # 1. Vector Search (High recall using semantic validity)
            vector_results = []
            if query_embedding is not None:
                try:
                    # Fetch more candidates for re-ranking (e.g., 50 or limit * 5)
                    fetch_count = max(50, limit * 5)
                    
                    result = self.supabase.rpc(
                        'search_legal_units',
                        {
                            'query_embedding': query_embedding,
                            'match_threshold': 0.3,  # Lower threshold to get more candidates
                            'match_count': fetch_count
                        }
                    ).execute()
                    vector_results = result.data
                except Exception as e:
                    print(f"Vector RPC Error: {e}")
                    vector_results = []

            # 2. Keyword Search (Exact match using Full Text Search)
            keyword_results = []
            try:
                # Use Supabase text_search on content/title
                kw_query = self.supabase.table('legal_units').select('id, type, unit_number, title, issuer, content, issues!inner(issue_number, year), page_number')\
                    .limit(fetch_count)\
                    .text_search('content', query, options={'config': 'arabic'})
                
                # Apply basic filters if possible to reduce noise
                # (Complex filters like date range might be better post-merge or require complex query building)
                if filters and filters.year:
                    # Note: Filtering on joined table 'issues' in Supabase-py with textSearch can be tricky.
                    # We might skip year filter here and rely on RRF + Post-filter.
                    pass

                kw_res = kw_query.execute()
                keyword_results = kw_res.data
            except Exception as e:
                print(f"Keyword Search Error: {e}")
                keyword_results = []

            # 3. Reciprocal Rank Fusion (RRF)
            # Combine the two lists
            def reciprocal_rank_fusion(results_lists, k=60):
                fused_scores = {}
                for r_list in results_lists:
                    for rank, item in enumerate(r_list):
                        doc_id = item['id']
                        if doc_id not in fused_scores:
                            fused_scores[doc_id] = {'doc': item, 'score': 0.0}
                        fused_scores[doc_id]['score'] += 1.0 / (k + rank + 1)
                
                # Sort by fused score
                sorted_items = sorted(fused_scores.values(), key=lambda x: x['score'], reverse=True)
                return [item['doc'] for item in sorted_items]

            # Fuse!
            fused_results = reciprocal_rank_fusion([vector_results, keyword_results])
            
            # Use fused results as candidates for filtering & reranking
            filtered_results = fused_results

            # Apply additional filters (Pre-Reranking)
            if filters:
                # Entity Filter (Post-process)
                if filters.entity_id:
                     # Fetch name if not already
                    if not entity_name:
                        try:
                            ent_res = self.supabase.table('entities').select('name').eq('id', str(filters.entity_id)).execute()
                            if ent_res.data: entity_name = ent_res.data[0]['name']
                        except: pass

                    lue_res = self.supabase.table('legal_unit_entities').select('legal_unit_id').eq('entity_id', str(filters.entity_id)).execute()
                    allowed_ids = {row['legal_unit_id'] for row in lue_res.data}
                    filtered_results = [r for r in filtered_results if r['id'] in allowed_ids]

                if filters.type:
                    filtered_results = [r for r in filtered_results if r.get('type') == filters.type]
                
                if filters.issuer:
                    filtered_results = [
                        r for r in filtered_results 
                        if filters.issuer.lower() in (r.get('issuer') or '').lower()
                    ]
            
            # --- RERANKING STEP (Cohere) ---
            if query and filtered_results and query_embedding is not None:
                try:
                    # Rerank the top N fused candidates
                    candidates = filtered_results[:limit*5] # Rerank top 50 roughly
                    
                    # Prepare documents for reranking
                    docs_to_rank = []
                    for r in candidates:
                         # Combine Title + Content for context
                         text_content = f"{r.get('title', '')} \n {r.get('content', '')[:2000]}"
                         docs_to_rank.append(text_content)
                    
                    if docs_to_rank:
                        rerank_response = self.cohere_client.rerank(
                            model='rerank-multilingual-v3.0',
                            query=query,
                            documents=docs_to_rank,
                            top_n=limit
                        )
                        
                        # Re-order based on rerank indices
                        ranked_results = []
                        for result in rerank_response.results:
                            original_idx = result.index
                            item = candidates[original_idx]
                            item['similarity'] = result.relevance_score
                            ranked_results.append(item)
                        
                        filtered_results = ranked_results
                except Exception as e:
                    print(f"Rerank Error (likely billing): {e}")
                    filtered_results = filtered_results[:limit]
            else:
                filtered_results = filtered_results[:limit]

            # Generate Smart Previews for final results
            # The formatting loop handles this below
        # Final Formatting
        results = []
        # Need to fetch issue info for RPC results (browse mode already fetched it)
        # Note: RPC 'search_legal_units' returns some fields but NOT nested issues/page_number usually unless modified?
        # My RPC definition (assumed) returns fields from legal_units.
        # But `search_legal_units` usually returns `id`, `content`, `similarity`...
        # Wait, the original code did:
        # for row in filtered_results[:limit]:
        #    issue_result = self.supabase.table('legal_units').select(...).eq('id', row['id'])
        # I should keep that pattern for RPC results.
        
        for row in filtered_results[:limit]:
            # If browse mode, we already have issue info in `row['issues']` etc.
            # If RPC mode, we need to fetch it.
            
            unit_data = row
            issue_source = None
            
            if 'issues' in row and isinstance(row['issues'], dict):
                # We have the data (Browse Mode)
                issue_source = IssueSource(
                    issue_number=row['issues']['issue_number'],
                    year=row['issues']['year'],
                    page_number=row.get('page_number')
                )
            else:
                # Need to fetch (RPC Mode)
                try:
                    issue_res = self.supabase.table('legal_units').select(
                        'page_number, issues!inner(issue_number, year)'
                    ).eq('id', row['id']).execute()
                    
                    if issue_res.data:
                        d = issue_res.data[0]
                        issue_source = IssueSource(
                            issue_number=d['issues']['issue_number'],
                            year=d['issues']['year'],
                            page_number=d['page_number']
                        )
                except:
                    pass

            if issue_source: # Only add if valid source found
                # Generate Smart Preview
                preview = self._generate_smart_preview(
                    row.get('content', ''), 
                    query=query if query else None, 
                    entity_name=entity_name
                )
                
                results.append(LegalUnitSummary(
                    id=row['id'],
                    type=row.get('type'),
                    unit_number=row.get('unit_number'),
                    title=row.get('title'),
                    issuer=row.get('issuer'),
                    effective_date=None,
                    is_table=False,
                    content_preview=preview,
                    similarity=row.get('similarity', 0.0),
                    source=issue_source
                ))
        
        query_time_ms = (time.time() - start_time) * 1000
        return results, query_time_ms
    
    def get_legal_unit(self, unit_id: UUID) -> Optional[LegalUnitDetail]:
        """Get full details of a specific legal unit"""
        # Flattened select string to avoid potential parsing issues
        select_query = "id, type, unit_number, title, issuer, effective_date, content, is_table, table_data, is_supplement, page_number, issues!inner(issue_number, year)"
        
        result = self.supabase.table('legal_units').select(select_query).eq('id', str(unit_id)).execute()
        
        if not result.data:
            return None
        
        row = result.data[0]
        
        return LegalUnitDetail(
            id=row['id'],
            type=row['type'],
            unit_number=row['unit_number'],
            title=row['title'],
            issuer=row['issuer'],
            effective_date=row['effective_date'],
            content=row['content'],
            is_table=row['is_table'],
            table_data=row['table_data'],
            is_supplement=row['is_supplement'],
            source=IssueSource(
                issue_number=row['issues']['issue_number'],
                year=row['issues']['year'],
                page_number=row['page_number']
            )
        )
    
    def list_issues(self, year: int) -> List[Issue]:
        """List all gazette issues for a specific year"""
        result = self.supabase.table('issues').select(
            'id, issue_number, year, total_pages, publication_date'
        ).eq('year', year).order('issue_number', desc=True).execute()
        
        return [Issue(**row) for row in result.data]

    def get_statistics(self) -> StatsResponse:
        """
        Get aggregated statistics for the dashboard.
        Note: For a larger dataset, this should be done via a Supabase RPC or materialized view.
        For ~20k records, we can fetch metadata and aggregate in Python.
        """
        from collections import Counter
        from collections import Counter

        # 1. Fetch Issues count
        issues_res = self.supabase.table('issues').select('year', count='exact').execute()
        total_issues = issues_res.count if issues_res.count is not None else len(issues_res.data)
        
        # 2. Fetch Legal Units metadata (type, issuer)
        # We limit to 50000 to cover the current dataset (approx 17k)
        # In production, use pagination or RPC.
        units_res = self.supabase.table('legal_units').select(
            'type, issuer, issues(year)'
        ).limit(2000).execute()
        
        data = units_res.data
        total_units = len(data)
        
        # 3. Aggregate
        type_counts = Counter()
        issuer_counts = Counter()
        year_counts = Counter()
        
        for row in data:
            # Type
            t = row.get('type') or 'Unknown'
            type_counts[t] += 1
            
            # Issuer
            i = row.get('issuer')
            if i:
                issuer_counts[i] += 1
            else:
                issuer_counts['Unknown'] += 1
                
            # Year (from nested issue)
            if row.get('issues'):
                y = row['issues'].get('year')
                if y:
                    year_counts[y] += 1

        # 4. Format for response
        def to_stats(counter, top_n=None):
            items = [StatItem(name=str(k), value=v) for k, v in counter.most_common(top_n)]
            return items

        return StatsResponse(
            total_legal_units=total_units,
            total_issues=total_issues,
            by_type=to_stats(type_counts),
            by_issuer=to_stats(issuer_counts, top_n=20), # Top 20 issuers
            by_year=to_stats(year_counts)
        )

    def get_heatmap_data(self) -> List["HeatmapItem"]:
        """
        Get daily publication counts for heatmap.
        """
        from collections import Counter
        from collections import Counter

        # Fetch all issue publication dates
        result = self.supabase.table('issues').select('publication_date').execute()
        
        date_counts = Counter()
        for row in result.data:
            pdate = row.get('publication_date')
            if pdate:
                date_counts[str(pdate)] += 1
                
        # Also, ideally we want the count of *Legal Units* per day, not just issues.
        # But `issues` table gives us when the Gazette was published.
        # If we want density of *laws*, we should join.
        # Simple version: Count of Issues per day (usually 1 or 0). 
        # Better version: Count of Legal Units published on that date.
        
        # Let's do Legal Units count per publication date.
        # This requires joining legal_units -> issues -> publication_date.
        # Supabase API limits might make this slow for 17k rows.
        # For now, let's just return Issue counts (Activity of publication).
        # Actually, "Activity Heatmap" usually implies "Contributions" or "Docs".
        # Let's try to get per-date unit counts if possible, roughly.
        
        # Alternative: We already fetched legal_units metadata in get_statistics.
        # We can cache it or re-fetch locally if needed.
        # But to be safe and fast, let's just count ISSUES for now.
        # It shows when the Gazette was active.
        
        # Refined: Users care about VOLUME. 1 issue might have 1000 decrees (Budget).
        # So fetching `legal_units(issues(publication_date))` is better.
        # We can reuse the query from get_statistics if we change it, but let's do a dedicated query.
        
        units_res = self.supabase.table('legal_units').select('issues(publication_date)').limit(5000).execute()
        
        daily_counts = Counter()
        for row in units_res.data:
            if row.get('issues') and row['issues'].get('publication_date'):
                daily_counts[str(row['issues']['publication_date'])] += 1
                
        return [HeatmapItem(date=k, count=v) for k, v in daily_counts.items()]

    def get_top_keywords(self) -> List["KeywordItem"]:
        """
        Extract top keywords from titles.
        """
        from collections import Counter
        import re
        from collections import Counter
        import re

        # Fetch titles
        result = self.supabase.table('legal_units').select('title').limit(1000).execute()
        
        text_blob = ""
        for row in result.data:
            if row.get('title'):
                text_blob += " " + row['title']
        
        # Simple Arabic tokenization
        # Remove common stopwords (very basic list)
        stopwords = {
            'في', 'من', 'على', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'تم', 'كان',
            'أن', 'إن', 'لا', 'ما', 'هو', 'هي', 'و', 'أو', 'قرار', 'رقم', 
            'تاريخ', 'بشأن', 'تعديل', 'تحديد', 'مرسوم', 'قانون', 'عام', 'سنة',
            'الجمهورية', 'اللبنانية', 'وزارة', 'مجلس', 'الوزراء', 'المادة'
        }
        
        # Normalize: Remove tashkeel, non-letters (keep Arabic letters)
        # Regex for Arabic letters: [\u0600-\u06FF]
        words = re.findall(r'[\u0600-\u06FF]+', text_blob)
        
        # Filter
        meaningful_words = [
            w for w in words 
            if len(w) > 3 and w not in stopwords
        ]
        
        counter = Counter(meaningful_words)
        
        return [KeywordItem(text=k, value=v) for k, v in counter.most_common(50)]

    def get_activity_treemap(self) -> List["TreemapItem"]:
        """
        Get activity treemap data (aggr by issuer).
        """
        from collections import Counter
        from collections import Counter
        
        # Fetch issuers
        # Use a limit that covers most active units
        result = self.supabase.table('legal_units').select('issuer').limit(1000).execute()
        
        counts = Counter()
        for row in result.data:
            issuer = row.get('issuer')
            if issuer:
                # Basic cleaning
                clean_issuer = issuer.strip()
                if len(clean_issuer) > 3:
                     counts[clean_issuer] += 1
            else:
                counts['Unknown'] += 1
                
        # Return top 30 issuers for the treemap
        return [TreemapItem(name=k, value=v) for k, v in counts.most_common(30)]

    def get_regional_map(self) -> List["MapItem"]:
        """
        Get regional activity data.
        """
        from collections import Counter
        from collections import Counter

        # Define regions mapping (simplified)
        regions_map = {
            "Beirut": ["Beirut", "بيروت"],
            "Mount Lebanon": ["Baabda", "Metn", "Chouf", "Aley", "Kesrouan", "Jbeil", "بعبدا", "المتن", "الشوف", "عاليه", "كسروان", "جبيل", "جبل لبنان"],
            "North": ["Tripoli", "Koura", "Zgharta", "Batroun", "Bcharre", "Akkar", "Minieh-Dannieh", "طرابلس", "الكورة", "زغرتا", "البترون", "بشري", "عكار", "المنية", "الضنية", "الشمال"],
            "South": ["Sidon", "Tyre", "Jezzine", "Saida", "Sour", "صيدا", "صور", "جزين", "الجنوب"],
            "Bekaa": ["Zahle", "Baalbek", "Hermel", "Rashaya", "West Bekaa", "زحلة", "بعلبك", "الهرمل", "راشيا", "البقاع الغربي", "البقاع"],
            "Nabatieh": ["Nabatieh", "Marjaayoun", "Hasbaya", "Bint Jbeil", "النبطية", "مرجعيون", "حاصبيا", "بنت جبيل"]
        }
        
        # 1. Get LOC entity IDs and Names
        loc_res = self.supabase.table('entities').select('id, name').eq('type', 'LOC').execute()
        loc_map = {row['id']: row['name'] for row in loc_res.data}
        
        if not loc_map:
            return []
            
        # 2. Fetch counts from legal_unit_entities
        lue_res = self.supabase.table('legal_unit_entities').select('entity_id').in_('entity_id', list(loc_map.keys())).execute()
        
        # 3. Aggregate
        region_counts = Counter()
        
        for row in lue_res.data:
            eid = row['entity_id']
            ename = loc_map.get(eid)
            if ename:
                # Match to region
                for region, keywords in regions_map.items():
                    if any(k in ename for k in keywords):
                        region_counts[region] += 1
                        break # Count only once per entity occurrence
                        
        return [MapItem(region=k, value=v) for k, v in region_counts.items()]

    def get_legislative_timeline(self, query: str) -> List["TimelineItem"]:
        """
        Get timeline of events for a query.
        """
        from datetime import date
        from datetime import date
        
        # Search for query
        results, _ = self.semantic_search(query, limit=50)
        
        timeline = []
        for r in results:
            # Simple heuristic for date
            d = r.effective_date
            if not d and r.source and r.source.year:
                 d = date(r.source.year, 1, 1)
            
            if d:
                timeline.append(TimelineItem(
                    date=d,
                    title=r.title or "Unknown Title",
                    status=r.type or "Document",
                    description=r.content_preview,
                    id=r.id
                ))
            
        # Sort by date
        timeline.sort(key=lambda x: str(x.date))
        return timeline

    def get_historical_trends(self, topic: str) -> List["TrendItem"]:
        """
        Get trend data for a topic.
        """
        from collections import Counter
        from collections import Counter
        
        # Search for topic to get relevant units
        results, _ = self.semantic_search(topic, limit=100)
        
        year_counts = Counter()
        for r in results:
            if r.source and r.source.year:
                year_counts[r.source.year] += 1
                
        return [TrendItem(year=k, value=v, topic=topic) for k, v in sorted(year_counts.items())]
