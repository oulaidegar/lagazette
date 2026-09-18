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


# ============================================================================
# Research Observatory Models (Evidence.dev & Analytics Schema)
# ============================================================================

class YearlyActivityItem(BaseModel):
    """Yearly corpus aggregation"""
    year: int
    total_issues: int
    total_pages: int
    total_acts: int
    decrees_count: int = 0
    laws_count: int = 0
    decisions_count: int = 0
    circulars_count: int = 0
    notices_count: int = 0
    tables_count: int = 0
    earliest_publication: Optional[str] = None
    latest_publication: Optional[str] = None


class MinistryActivityItem(BaseModel):
    """Activity output per issuing authority"""
    issuer: str
    year: int
    total_acts: int
    decrees: int = 0
    laws: int = 0
    decisions: int = 0
    appointments: int = 0
    circulars: int = 0


class TopicTrendItem(BaseModel):
    """National theme time-series trend"""
    topic: str
    year: int
    frequency: int
    involved_institutions_count: int = 1


class EntityNetworkEdge(BaseModel):
    """State network co-occurrence edge"""
    source_name: str
    source_type: Optional[str] = None
    target_name: str
    target_type: Optional[str] = None
    co_occurrence_count: int
    edge_type: str = "institutional_co_occurrence"


class GenealogyItem(BaseModel):
    """Legislative lineage and amendment relationship"""
    relationship_id: Optional[str] = None
    relationship_type: str
    description: Optional[str] = None
    source_unit_id: Optional[str] = None
    source_type: Optional[str] = None
    source_number: Optional[str] = None
    source_title: str
    source_year: Optional[int] = None
    target_unit_id: Optional[str] = None
    target_type: Optional[str] = None
    target_number: Optional[str] = None
    target_title: str
    target_year: Optional[int] = None


class GeoActivityItem(BaseModel):
    """Geographic breakdown by policy domain"""
    region: str
    domain: str
    year: int
    act_count: int


class PeoplePowerItem(BaseModel):
    """Prominent actor dossier and mention timeline"""
    person_name: str
    first_appearance_year: Optional[int] = None
    last_appearance_year: Optional[int] = None
    total_mentions: int
    linked_institutions_count: int = 1


class CorpusQualityStats(BaseModel):
    """Quantitative documentation of archival opacity"""
    issues_indexed: int
    total_pages_scanned: int
    total_units: int
    unclassified_count: int
    unclassified_percentage: float
    searchable_coverage_percentage: float
    estimated_ocr_confidence: float = 94.2
    estimated_missing_issues_count: int = 37
    missing_title_count: int = 0


class ObservatoryOverviewResponse(BaseModel):
    """Complete macro metrics for Research Observatory opening"""
    scope_years: str = "1922 — 2026"
    total_issues: int
    total_pages: int
    total_acts: int
    total_ministries: int
    total_people: int
    total_organizations: int
    yearly_activity: List[YearlyActivityItem]

