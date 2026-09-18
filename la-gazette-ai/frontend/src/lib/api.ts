import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// API Configuration
const getApiBaseUrl = () => {
    // If running in browser (client side)
    if (typeof window !== "undefined") {
        return "/_/backend";
    }

    // If NEXT_PUBLIC_API_URL is explicitly set, use it.
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }
    
    // If running on Vercel (server side during static build)
    const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL;
    if (vercelUrl) {
        return `https://${vercelUrl}/_/backend`;
    }
    
    // Local fallback
    return "http://127.0.0.1:8000";
};

const API_BASE_URL = getApiBaseUrl();

// Types
export interface SearchFilters {
    type?: string;
    year?: number;
    issue_number?: number;
    issuer?: string;
    date_from?: string;
    date_to?: string;
    entity_id?: string;
}

export interface LegalUnitSummary {
    id: string;
    type: string | null;
    unit_number: string | null;
    title: string | null;
    issuer: string | null;
    effective_date: string | null;
    is_table: boolean;
    content_preview: string;
    similarity: number;
    match_type?: "exact_reference" | "semantic" | "browse";
    source: {
        issue_number: number;
        year: number;
        page_number: number | null;
        publication_date?: string | null;
        date_precision?: "exact" | "year_only" | "unverified";
    };
}

export interface LegalUnitDetail extends LegalUnitSummary {
    content: string;
    table_data: any | null;
    is_supplement: boolean;
    source_pdf_url?: string | null;
}

export interface SearchResponse {
    results: LegalUnitSummary[];
    total: number;
    page: number;
    page_size: number;
    has_more: boolean;
    query_time_ms: number;
    coverage_note?: string;
}

export interface StatsResponse {
    total_legal_units: number;
    total_issues: number;
    by_type: Array<{ name: string; value: number }>;
    by_issuer: Array<{ name: string; value: number }>;
    by_year: Array<{ name: string; value: number }>;
}

export interface Issue {
    id: string;
    issue_number: number;
    year: number;
    total_pages: number | null;
    publication_date: string | null;
}

export interface IssueListResponse {
    issues: Issue[];
    total: number;
}

export interface HeatmapItem {
    date: string;
    count: number;
    level?: number;
}

export interface KeywordItem {
    text: string;
    value: number;
}

export interface EntityItem {
    id: string;
    name: string;
    type: string;
    count: number | null;
}

export interface TreemapItem {
    name: string;
    value: number;
}

export interface MapItem {
    region: string;
    value: number;
}

export interface TimelineItem {
    date: string;
    title: string;
    status: string;
    description: string;
    id: string;
}

export interface TrendItem {
    year: number;
    value: number;
    topic: string;
}

export interface YearlyActivityItem {
    year: number;
    total_issues: number;
    total_pages: number;
    total_acts: number;
    decrees_count: number;
    laws_count: number;
    decisions_count: number;
    circulars_count: number;
    notices_count: number;
    tables_count: number;
    earliest_publication: string | null;
    latest_publication: string | null;
}

export interface ObservatoryOverview {
    scope_years: string;
    total_issues: number;
    total_pages: number;
    total_acts: number;
    total_ministries: number;
    total_people: number;
    total_organizations: number;
    yearly_activity: YearlyActivityItem[];
}

export interface MinistryActivityItem {
    issuer: string;
    year: number;
    total_acts: number;
    decrees: number;
    laws: number;
    decisions: number;
    appointments: number;
    circulars: number;
}

export interface TopicTrendItem {
    topic: string;
    year: number;
    frequency: number;
    involved_institutions_count: number;
}

export interface EntityNetworkEdge {
    source_name: string;
    source_type?: string;
    target_name: string;
    target_type?: string;
    co_occurrence_count: number;
    edge_type: string;
}

export interface GenealogyItem {
    relationship_id?: string;
    relationship_type: string;
    description?: string;
    source_unit_id?: string;
    source_type?: string;
    source_number?: string;
    source_title: string;
    source_year?: number;
    target_unit_id?: string;
    target_type?: string;
    target_number?: string;
    target_title: string;
    target_year?: number;
}

export interface GeoActivityItem {
    region: string;
    domain: string;
    year: number;
    act_count: number;
}

export interface PeoplePowerItem {
    person_name: string;
    first_appearance_year?: number;
    last_appearance_year?: number;
    total_mentions: number;
    linked_institutions_count: number;
}

export interface CorpusQualityStats {
    issues_indexed: number;
    total_pages_scanned: number;
    total_units: number;
    unclassified_count: number;
    unclassified_percentage: number;
    searchable_coverage_percentage: number;
    estimated_ocr_confidence: number;
    estimated_missing_issues_count: number;
    missing_title_count: number;
}


export const api = {
    async search(
        query: string, 
        limit: number = 10, 
        filters?: SearchFilters, 
        offset: number = 0, 
        sort_by: string = "relevance"
    ): Promise<SearchResponse> {
        const response = await fetch(`${API_BASE_URL}/search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, limit, filters: filters && Object.keys(filters).length > 0 ? filters : undefined, offset, sort_by }),
            cache: "no-store",
        });

        if (!response.ok) {
            const errDetail = await response.text().catch(() => "");
            console.error(`Backend search error (${response.status}):`, errDetail);
            throw new Error(`Search failed with status ${response.status}: ${errDetail}`);
        }
        return response.json();
    },

    async getLegalUnit(id: string): Promise<LegalUnitDetail> {
        const response = await fetch(`${API_BASE_URL}/legal-units/${id}`, {
            cache: "no-store", // Ensure fresh data
        });

        if (!response.ok) {
            if (response.status === 404) throw new Error("Document not found");
            throw new Error("Failed to fetch document");
        }
        return response.json();
    },

    async getIssues(year: number) {
        const response = await fetch(`${API_BASE_URL}/issues/${year}`);
        if (!response.ok) throw new Error("Failed to fetch issues");
        return response.json();
    },

    async listIssues(year: number): Promise<IssueListResponse> {
        const res = await fetch(`${API_BASE_URL}/issues/${year}`);
        if (!res.ok) throw new Error("Failed to fetch issues");
        return res.json();
    },

    async getStats(): Promise<StatsResponse> {
        const response = await fetch(`${API_BASE_URL}/stats`, {
            cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed to fetch statistics");
        return response.json();
    },

    async getHeatmap(): Promise<HeatmapItem[]> {
        const response = await fetch(`${API_BASE_URL}/stats/heatmap`, {
            cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed to fetch heatmap data");
        return response.json();
    },

    async getKeywords(): Promise<KeywordItem[]> {
        const response = await fetch(`${API_BASE_URL}/stats/keywords`, {
            cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed to fetch keywords");
        return response.json();
    },

    async getTopEntities(type?: string): Promise<EntityItem[]> {
        const query = type ? `?type=${type}` : "";
        const response = await fetch(`${API_BASE_URL}/entities/top${query}`, {
            cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed to fetch entities");
        return response.json();
    },

    async getTreemap(): Promise<TreemapItem[]> {
        const response = await fetch(`${API_BASE_URL}/stats/treemap`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch treemap");
        return response.json();
    },

    async getMap(): Promise<MapItem[]> {
        const response = await fetch(`${API_BASE_URL}/stats/map`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch map");
        return response.json();
    },

    async getTimeline(q: string): Promise<TimelineItem[]> {
        const response = await fetch(`${API_BASE_URL}/stats/timeline?q=${encodeURIComponent(q)}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch timeline");
        return response.json();
    },

    async getTrends(topic: string): Promise<TrendItem[]> {
        const response = await fetch(`${API_BASE_URL}/stats/trends?topic=${encodeURIComponent(topic)}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch trends");
        return response.json();
    },

    // Library Methods
    async getLibrary(token: string) {
        const response = await fetch(`${API_BASE_URL}/library`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed to fetch library");
        return response.json();
    },

    async createFolder(name: string, token: string, parentId?: string) {
        const response = await fetch(`${API_BASE_URL}/library/folders?name=${encodeURIComponent(name)}${parentId ? `&parent_id=${parentId}` : ''}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to create folder");
        return response.json();
    },

    async deleteFolder(folderId: string, token: string) {
        const response = await fetch(`${API_BASE_URL}/library/folders/${folderId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to delete folder");
        return response.json();
    },

    async addBookmark(legalUnitId: string, token: string, folderId?: string, note?: string) {
        const response = await fetch(`${API_BASE_URL}/library/bookmarks?legal_unit_id=${legalUnitId}${folderId ? `&folder_id=${folderId}` : ''}${note ? `&note=${encodeURIComponent(note)}` : ''}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to add bookmark");
        return response.json();
    },

    async removeBookmark(bookmarkId: string, token: string) {
        const response = await fetch(`${API_BASE_URL}/library/bookmarks/${bookmarkId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to delete bookmark");
        return response.json();
    },

    async checkBookmarkStatus(legalUnitId: string, token: string): Promise<{ is_bookmarked: boolean; bookmark_id: string | null; folder_id: string | null }> {
        const response = await fetch(`${API_BASE_URL}/library/bookmarks/status?legal_unit_id=${legalUnitId}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });
        if (!response.ok) {
            // Fallback gracefully
            return { is_bookmarked: false, bookmark_id: null, folder_id: null };
        }
        return response.json();
    },

    // ========================================================================
    // Research Observatory Methods (Evidence.dev & Analytics Schema)
    // ========================================================================
    async getObservatoryOverview(): Promise<ObservatoryOverview> {
        const response = await fetch(`${API_BASE_URL}/analytics/observatory/overview`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load observatory overview");
        return response.json();
    },

    async getObservatoryMinistries(year?: number, actType?: string): Promise<MinistryActivityItem[]> {
        const params = new URLSearchParams();
        if (year) params.append("year", year.toString());
        if (actType && actType !== "all") params.append("act_type", actType);
        const response = await fetch(`${API_BASE_URL}/analytics/observatory/ministries?${params.toString()}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load ministry activity");
        return response.json();
    },

    async getObservatoryTopics(topic?: string): Promise<TopicTrendItem[]> {
        const params = new URLSearchParams();
        if (topic) params.append("topic", topic);
        const response = await fetch(`${API_BASE_URL}/analytics/observatory/topics?${params.toString()}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load topic trends");
        return response.json();
    },

    async getObservatoryNetwork(): Promise<EntityNetworkEdge[]> {
        const response = await fetch(`${API_BASE_URL}/analytics/observatory/network`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load entity network");
        return response.json();
    },

    async getObservatoryGenealogy(): Promise<GenealogyItem[]> {
        const response = await fetch(`${API_BASE_URL}/analytics/observatory/genealogy`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load legislative genealogy");
        return response.json();
    },

    async getObservatoryGeography(region?: string, domain?: string): Promise<GeoActivityItem[]> {
        const params = new URLSearchParams();
        if (region) params.append("region", region);
        if (domain) params.append("domain", domain);
        const response = await fetch(`${API_BASE_URL}/analytics/observatory/geography?${params.toString()}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load geographic data");
        return response.json();
    },

    async getObservatoryPeople(): Promise<PeoplePowerItem[]> {
        const response = await fetch(`${API_BASE_URL}/analytics/observatory/people`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load people and power");
        return response.json();
    },

    async getObservatoryIntegrity(): Promise<CorpusQualityStats> {
        const response = await fetch(`${API_BASE_URL}/analytics/observatory/integrity`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load corpus quality");
        return response.json();
    }
};

