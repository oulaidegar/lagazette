import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// API Configuration
const getApiBaseUrl = () => {
    // If NEXT_PUBLIC_API_URL is explicitly set, use it.
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }
    
    // If running on Vercel (server side or client side)
    const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL;
    if (vercelUrl) {
        return `https://${vercelUrl}/_/backend`;
    }
    
    // If running in browser (client side)
    if (typeof window !== "undefined") {
        return "/_/backend";
    }
    
    // Local fallback
    return "http://localhost:8000";
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
    source: {
        issue_number: number;
        year: number;
        page_number: number | null;
    };
}

export interface LegalUnitDetail extends LegalUnitSummary {
    content: string;
    table_data: any | null;
    is_supplement: boolean;
}

export interface SearchResponse {
    results: LegalUnitSummary[];
    total: number;
    query_time_ms: number;
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

export const api = {
    async search(query: string, limit: number = 10, filters?: SearchFilters): Promise<SearchResponse> {
        const response = await fetch(`${API_BASE_URL}/search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, limit, filters }),
            cache: "no-store",
        });

        if (!response.ok) throw new Error("Search failed");
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
    }
};
