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


import re

def normalize_arabic_text(text: str) -> str:
    """
    Normalize Arabic text: strip diacritics (tashkeel), unify alef variants,
    normalize yaa/alef maqsura, taa marbuta, and map Arabic-Indic numerals.
    """
    if not text:
        return ""
    # Remove tashkeel (diacritics)
    tashkeel_regex = re.compile(r'[\u064B-\u0652\u0670]')
    text = tashkeel_regex.sub('', text)
    # Normalize Alef forms (أ, إ, آ, ٱ -> ا)
    text = re.sub(r'[إأآٱ]', 'ا', text)
    # Normalize Yaa forms (ى -> ي)
    text = re.sub(r'ى', 'ي', text)
    # Normalize Taa Marbuta (ة -> ه)
    text = re.sub(r'ة', 'ه', text)
    # Normalize Arabic-Indic numerals (٠-٩ -> 0-9)
    arabic_indic_digits = '٠١٢٣٤٥٦٧٨٩'
    for i, d in enumerate(arabic_indic_digits):
        text = text.replace(d, str(i))
    return text.strip()


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
            norm_content = normalize_arabic_text(content)
            norm_target = normalize_arabic_text(target)
            idx = norm_content.lower().find(norm_target.lower())
        if idx == -1:
            return content[:300] + "..." if len(content) > 300 else content
             
        # Extract window
        start = max(0, idx - 100)
        end = min(len(content), idx + 200)
        snippet = content[start:end]
        
        if start > 0:
            snippet = "..." + snippet
        if end < len(content):
            snippet = snippet + "..."
            
        return snippet

    def semantic_search(
        self, 
        query: str, 
        limit: int = 10,
        offset: int = 0,
        sort_by: Optional[str] = "relevance",
        filters: Optional[SearchFilters] = None
    ) -> Tuple[List[LegalUnitSummary], int, float]:
        """
        Perform search using vector similarity, full-text search, and candidate re-ranking.
        Applies and enforces all selected constraints before ranking and pagination.
        Returns: (results, total_count, query_time_ms)
        """
        start_time = time.time()
        
        filtered_results = []
        entity_name = None
        clean_query = (query or "").strip()
        normalized_q = normalize_arabic_text(clean_query)
        
        # Check if this is a Browse Mode (No query, browse latest or filtered)
        is_browse_mode = not clean_query
        if is_browse_mode and filters is None:
            filters = SearchFilters()

        if is_browse_mode:
            try:
                allowed_ids = None
                
                # Case 1: Browse by Entity
                if filters.entity_id:
                    ent_res = self.supabase.table('entities').select('name').eq('id', str(filters.entity_id)).execute()
                    if ent_res.data:
                        entity_name = ent_res.data[0]['name']
                    
                    lue_res = self.supabase.table('legal_unit_entities')\
                        .select('legal_unit_id')\
                        .eq('entity_id', str(filters.entity_id))\
                        .limit(500)\
                        .execute()
                    allowed_ids = [row['legal_unit_id'] for row in lue_res.data]
                
                # Case 2: Browse by Issue
                elif filters.year and filters.issue_number:
                    issue_res = self.supabase.table('issues').select('id').eq('year', filters.year).eq('issue_number', filters.issue_number).execute()
                    if issue_res.data:
                        issue_id = issue_res.data[0]['id']
                        units_query = self.supabase.table('legal_units').select('id').eq('issue_id', issue_id).limit(500).execute()
                        allowed_ids = [u['id'] for u in units_query.data]
                    else:
                        allowed_ids = []

                # Build query for units
                base_query = self.supabase.table('legal_units')\
                    .select('id, type, unit_number, title, issuer, effective_date, content, issues!inner(issue_number, year, publication_date), page_number')
                
                if allowed_ids is not None:
                    if not allowed_ids:
                        return [], 0, (time.time() - start_time) * 1000
                    base_query = base_query.in_('id', allowed_ids)
                elif filters.year:
                    base_query = base_query.eq('issues.year', filters.year)

                if filters.type:
                    base_query = base_query.eq('type', filters.type)
                if filters.issuer:
                    base_query = base_query.ilike('issuer', f"%{filters.issuer}%")

                units_res = base_query.limit(500).execute()
                
                # In browse mode, similarity is 0.0, match_type is 'browse'
                filtered_results = [{**row, 'similarity': 0.0, 'match_type': 'browse'} for row in units_res.data]

            except Exception as e:
                print(f"Error in browse mode: {e}")
                return [], 0, (time.time() - start_time) * 1000
        
        else:
            # Search candidate retrieval count
            fetch_count = max(80, (offset + limit) * 4)
            
            # Generate embedding for query
            query_embedding = None
            if clean_query:
                try:
                    query_embedding = self._generate_query_embedding(clean_query)
                except Exception as e:
                    print(f"Cohere Embedding Error: {e}")
            
            # 1. Vector Search (Semantic)
            vector_results = []
            if query_embedding is not None:
                try:
                    result = self.supabase.rpc(
                        'search_legal_units',
                        {
                            'query_embedding': query_embedding,
                            'match_threshold': 0.25,
                            'match_count': fetch_count
                        }
                    ).execute()
                    vector_results = result.data or []
                except Exception as e:
                    print(f"Vector RPC Error: {e}")
                    vector_results = []

            # 2. Keyword Search (Exact Full Text Search)
            keyword_results = []
            if clean_query:
                try:
                    kw_query = self.supabase.table('legal_units')\
                        .select('id, type, unit_number, title, issuer, effective_date, content, issues!inner(issue_number, year, publication_date), page_number')\
                        .limit(fetch_count)\
                        .text_search('content', clean_query, options={'type': 'plain', 'config': 'arabic'})
                    
                    kw_res = kw_query.execute()
                    keyword_results = kw_res.data or []
                except Exception as e:
                    print(f"Keyword Search Error: {e}")
                    keyword_results = []
                
                # Check for unit number exact match lookup (e.g. 14539 or 1/1277)
                num_match = re.search(r'\d+', normalized_q)
                if num_match:
                    try:
                        num_query = self.supabase.table('legal_units')\
                            .select('id, type, unit_number, title, issuer, effective_date, content, issues!inner(issue_number, year, publication_date), page_number')\
                            .ilike('unit_number', f"%{num_match.group(0)}%")\
                            .limit(20)\
                            .execute()
                        for item in (num_query.data or []):
                            item['similarity'] = 0.99
                            item['match_type'] = 'exact_reference'
                            keyword_results.insert(0, item)
                    except Exception as e:
                        print(f"Number lookup error: {e}")

            # 3. Reciprocal Rank Fusion (RRF)
            def reciprocal_rank_fusion(results_lists, k=60):
                fused_scores = {}
                for r_list in results_lists:
                    for rank, item in enumerate(r_list):
                        doc_id = item['id']
                        if doc_id not in fused_scores:
                            fused_scores[doc_id] = {'doc': item, 'score': 0.0}
                        fused_scores[doc_id]['score'] += 1.0 / (k + rank + 1)
                
                sorted_items = sorted(fused_scores.values(), key=lambda x: x['score'], reverse=True)
                return [item['doc'] for item in sorted_items]

            fused_results = reciprocal_rank_fusion([vector_results, keyword_results])
            filtered_results = fused_results

            # 4. Scope Enforcement: Apply ALL selected constraints
            if filters:
                if filters.entity_id:
                    try:
                        if not entity_name:
                            ent_res = self.supabase.table('entities').select('name').eq('id', str(filters.entity_id)).execute()
                            if ent_res.data: entity_name = ent_res.data[0]['name']
                        lue_res = self.supabase.table('legal_unit_entities').select('legal_unit_id').eq('entity_id', str(filters.entity_id)).execute()
                        allowed_ids = {row['legal_unit_id'] for row in lue_res.data}
                        filtered_results = [r for r in filtered_results if r['id'] in allowed_ids]
                    except: pass

                if filters.type:
                    filtered_results = [r for r in filtered_results if (r.get('type') or '').lower() == filters.type.lower()]
                
                if filters.issuer:
                    filtered_results = [
                        r for r in filtered_results 
                        if filters.issuer.lower() in (r.get('issuer') or '').lower()
                    ]

                if filters.year:
                    filtered_results = [
                        r for r in filtered_results
                        if (r.get('issues') and r['issues'].get('year') == filters.year)
                    ]

                if filters.issue_number:
                    filtered_results = [
                        r for r in filtered_results
                        if (r.get('issues') and r['issues'].get('issue_number') == filters.issue_number)
                    ]

                if filters.date_from:
                    filtered_results = [
                        r for r in filtered_results
                        if r.get('effective_date') and str(r['effective_date']) >= str(filters.date_from)
                    ]

                if filters.date_to:
                    filtered_results = [
                        r for r in filtered_results
                        if r.get('effective_date') and str(r['effective_date']) <= str(filters.date_to)
                    ]

            # 5. Reranking with Cohere (if available and not sorted strictly by date)
            if clean_query and filtered_results and query_embedding is not None and sort_by == "relevance":
                try:
                    candidates = filtered_results[:min(len(filtered_results), 40)]
                    docs_to_rank = []
                    for r in candidates:
                        text_content = f"{r.get('title', '')} \n {r.get('content', '')[:1500]}"
                        docs_to_rank.append(text_content)
                    
                    if docs_to_rank:
                        rerank_response = self.cohere_client.rerank(
                            model='rerank-multilingual-v3.0',
                            query=clean_query,
                            documents=docs_to_rank,
                            top_n=min(len(candidates), 25)
                        )
                        ranked_results = []
                        for result in rerank_response.results:
                            item = candidates[result.index]
                            item['similarity'] = float(result.relevance_score)
                            item['match_type'] = 'semantic'
                            ranked_results.append(item)
                        # Retain unranked tail
                        ranked_ids = {r['id'] for r in ranked_results}
                        for r in filtered_results:
                            if r['id'] not in ranked_ids:
                                ranked_results.append(r)
                        filtered_results = ranked_results
                except Exception as e:
                    print(f"Rerank Error: {e}")

        # 6. Sorting
        if sort_by == "newest":
            filtered_results.sort(
                key=lambda r: (
                    (r.get('issues') or {}).get('year', 0),
                    (r.get('issues') or {}).get('issue_number', 0),
                    r.get('page_number') or 0
                ),
                reverse=True
            )
        elif sort_by == "oldest":
            filtered_results.sort(
                key=lambda r: (
                    (r.get('issues') or {}).get('year', 9999),
                    (r.get('issues') or {}).get('issue_number', 9999),
                    r.get('page_number') or 9999
                )
            )

        total_count = len(filtered_results)
        paged_candidates = filtered_results[offset : offset + limit]

        # 7. Final Formatting: Batch fetch missing issue metadata
        missing_ids = [
            row['id'] for row in paged_candidates 
            if 'issues' not in row or not isinstance(row.get('issues'), dict)
        ]
        metadata_map = {}
        if missing_ids:
            try:
                meta_res = self.supabase.table('legal_units').select(
                    'id, page_number, effective_date, issues!inner(issue_number, year, publication_date)'
                ).in_('id', missing_ids).execute()
                for item in (meta_res.data or []):
                    metadata_map[item['id']] = item
            except Exception as e:
                print(f"Batch metadata fetch error: {e}")

        results = []
        for row in paged_candidates:
            issue_source = None
            
            if 'issues' in row and isinstance(row['issues'], dict):
                pub_date = row['issues'].get('publication_date')
                issue_source = IssueSource(
                    issue_number=row['issues']['issue_number'],
                    year=row['issues']['year'],
                    page_number=row.get('page_number'),
                    publication_date=str(pub_date) if pub_date else None,
                    date_precision="unverified" if pub_date else "year_only"
                )
            elif row['id'] in metadata_map:
                d = metadata_map[row['id']]
                d_issues = d.get('issues') or {}
                pub_date = d_issues.get('publication_date')
                issue_source = IssueSource(
                    issue_number=d_issues.get('issue_number', 0),
                    year=d_issues.get('year', 0),
                    page_number=d.get('page_number') or row.get('page_number'),
                    publication_date=str(pub_date) if pub_date else None,
                    date_precision="unverified" if pub_date else "year_only"
                )
                if 'effective_date' in d and not row.get('effective_date'):
                    row['effective_date'] = d.get('effective_date')

            if not issue_source and row.get('source'):
                issue_source = row['source']

            if issue_source:
                preview = self._generate_smart_preview(
                    row.get('content', ''), 
                    query=clean_query if clean_query else None, 
                    entity_name=entity_name
                )
                
                # Determine match type context
                match_type = row.get('match_type')
                if not match_type:
                    if is_browse_mode:
                        match_type = 'browse'
                    elif row.get('similarity', 0.0) >= 0.85 or (clean_query and row.get('unit_number') and clean_query in str(row.get('unit_number'))):
                        match_type = 'exact_reference'
                    else:
                        match_type = 'semantic'

                results.append(LegalUnitSummary(
                    id=row['id'],
                    type=row.get('type'),
                    unit_number=row.get('unit_number'),
                    title=row.get('title'),
                    issuer=row.get('issuer'),
                    effective_date=row.get('effective_date'),
                    is_table=bool(row.get('is_table')),
                    content_preview=preview,
                    similarity=round(float(row.get('similarity', 0.0)), 2),
                    match_type=match_type,
                    source=issue_source
                ))
        
        query_time_ms = (time.time() - start_time) * 1000
        return results, total_count, query_time_ms
    
    def get_legal_unit(self, unit_id: UUID) -> Optional[LegalUnitDetail]:
        """Get full details of a specific legal unit with provenance and original source reference"""
        select_query = "id, type, unit_number, title, issuer, effective_date, content, is_table, table_data, is_supplement, page_number, issues!inner(issue_number, year, publication_date)"
        
        result = self.supabase.table('legal_units').select(select_query).eq('id', str(unit_id)).execute()
        
        if not result.data:
            return None
        
        row = result.data[0]
        issue_info = row['issues']
        pub_date = issue_info.get('publication_date')
        
        return LegalUnitDetail(
            id=row['id'],
            type=row['type'],
            unit_number=row['unit_number'],
            title=row['title'],
            issuer=row['issuer'],
            effective_date=row['effective_date'],
            content=row['content'],
            is_table=bool(row['is_table']),
            table_data=row['table_data'],
            is_supplement=bool(row['is_supplement']),
            source_pdf_url=f"/data/pdfs/Gazette_Issue_{issue_info['issue_number']}.pdf",
            source=IssueSource(
                issue_number=issue_info['issue_number'],
                year=issue_info['year'],
                page_number=row['page_number'],
                publication_date=str(pub_date) if pub_date else None,
                date_precision="unverified" if pub_date else "year_only"
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
        Uses exact count queries for honest corpus metrics.
        """
        from collections import Counter

        # 1. Fetch exact Issues count
        issues_res = self.supabase.table('issues').select('id', count='exact').execute()
        total_issues = issues_res.count if issues_res.count is not None else len(issues_res.data)
        
        # 2. Fetch exact Legal Units count
        units_count_res = self.supabase.table('legal_units').select('id', count='exact').execute()
        total_units = units_count_res.count if units_count_res.count is not None else 0
        
        # 3. Distribution sample
        units_res = self.supabase.table('legal_units').select(
            'type, issuer, issues(year)'
        ).limit(3000).execute()
        
        data = units_res.data or []
        
        type_counts = Counter()
        issuer_counts = Counter()
        year_counts = Counter()
        
        for row in data:
            t = row.get('type') or 'other'
            type_counts[t] += 1
            
            i = row.get('issuer')
            if i:
                issuer_counts[i.strip()] += 1
            else:
                issuer_counts['غير محدد'] += 1
                
            if row.get('issues'):
                y = row['issues'].get('year')
                if y:
                    year_counts[y] += 1

        def to_stats(counter, top_n=None):
            return [StatItem(name=str(k), value=v) for k, v in counter.most_common(top_n)]

        return StatsResponse(
            total_legal_units=total_units,
            total_issues=total_issues,
            by_type=to_stats(type_counts),
            by_issuer=to_stats(issuer_counts, top_n=20),
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
        Get timeline of events for a query. Never manufactures days or months when precision is unknown.
        """
        results, _, _ = self.semantic_search(query, limit=50)
        
        timeline = []
        for r in results:
            d_str = None
            precision = "exact"
            if r.effective_date:
                d_str = str(r.effective_date)
            elif r.source and r.source.publication_date:
                d_str = str(r.source.publication_date)
            elif r.source and r.source.year:
                d_str = str(r.source.year)
                precision = "year_only"
            
            if d_str:
                timeline.append(TimelineItem(
                    date=d_str,
                    date_precision=precision,
                    title=r.title or "بدون عنوان",
                    status=r.type or "مستند",
                    description=r.content_preview,
                    id=r.id
                ))
            
        timeline.sort(key=lambda x: str(x.date))
        return timeline

    def get_historical_trends(self, topic: str) -> List["TrendItem"]:
        """
        Get topic trend data across publication years.
        """
        from collections import Counter
        results, _, _ = self.semantic_search(topic, limit=150)
        
        year_counts = Counter()
        for r in results:
            if r.source and r.source.year:
                year_counts[r.source.year] += 1
                
        return [TrendItem(year=k, value=v, topic=topic) for k, v in sorted(year_counts.items())]
