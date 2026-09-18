import { api, SearchResponse, SearchFilters } from "@/lib/api";
import { SearchInput } from "@/components/ui/search-input";
import { ResultCard } from "@/components/search/result-card";
import { SearchFiltersBar } from "@/components/search/search-filters-bar";
import { SearchPagination } from "@/components/search/search-pagination";
import { Search, AlertCircle, FileSearch, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SearchPageProps {
    searchParams: Promise<{
        q?: string;
        type?: string;
        year?: string;
        issue_number?: string;
        issuer?: string;
        sort?: string;
        page?: string;
    }>;
}

export default async function SearchPage(props: SearchPageProps) {
    const searchParams = await props.searchParams;
    const query = searchParams.q || "";
    const type = searchParams.type;
    const year = searchParams.year;
    const issue_number = searchParams.issue_number;
    const issuer = searchParams.issuer;
    const sort = searchParams.sort || "relevance";
    const currentPage = Math.max(1, parseInt(searchParams.page || "1", 10));
    const pageSize = 12;
    const offset = (currentPage - 1) * pageSize;

    const filters: SearchFilters = {};
    if (type) filters.type = type;
    if (year && !isNaN(parseInt(year, 10))) filters.year = parseInt(year, 10);
    if (issue_number && !isNaN(parseInt(issue_number, 10))) filters.issue_number = parseInt(issue_number, 10);
    if (issuer) filters.issuer = issuer;

    let data: SearchResponse | null = null;
    let error: string | null = null;

    try {
        data = await api.search(query, pageSize, filters, offset, sort);
    } catch (e: any) {
        console.error("Search API error:", e);
        error = "Failed to fetch archive records. The archive service may be momentarily unavailable.";
    }

    const totalResults = data?.total || 0;
    const totalPages = Math.ceil(totalResults / pageSize);

    // Build base query object for pagination
    const baseQueryRecord: Record<string, string> = {};
    if (query) baseQueryRecord.q = query;
    if (type) baseQueryRecord.type = type;
    if (year) baseQueryRecord.year = year;
    if (issue_number) baseQueryRecord.issue_number = issue_number;
    if (issuer) baseQueryRecord.issuer = issuer;
    if (sort && sort !== "relevance") baseQueryRecord.sort = sort;

    const isSearching = Boolean(query.trim());
    const hasFilters = Boolean(type || year || issue_number || issuer);

    return (
        <div className="min-h-screen bg-background">
            {/* Top Search Hero Section */}
            <section className="border-b border-border bg-muted/20 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                            <FileSearch className="h-4 w-4" />
                            <span>Official Gazette Search & Explorer</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-4">
                            {isSearching
                                ? `Results for "${query}"`
                                : hasFilters
                                ? "Filtered Publications Archive"
                                : "Browse the Official Gazette Archive"}
                        </h1>

                        <SearchInput
                            placeholder="Search laws, decrees, ministries, or issue numbers (e.g. مرسوم 1234)..."
                            className="h-12 text-base shadow-sm"
                            basePath="/search"
                        />
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search Filters Bar */}
                <SearchFiltersBar
                    currentFilters={{
                        q: query,
                        type,
                        year,
                        issue_number,
                        issuer,
                        sort,
                    }}
                    totalCount={totalResults}
                />

                {/* Error Banner */}
                {error && (
                    <div className="p-6 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive my-6 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">Search Unavailable</p>
                            <p className="text-sm opacity-90 mt-1">{error}</p>
                            <div className="mt-4">
                                <Link href="/search">
                                    <Button variant="outline" size="sm">
                                        Reset Search
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Section */}
                {!error && data && (
                    <div>
                        {data.results.length > 0 ? (
                            <div className="space-y-4">
                                {data.results.map((result, index) => (
                                    <ResultCard
                                        key={result.id}
                                        result={result}
                                        index={index}
                                        highlightTerms={query ? [query] : []}
                                    />
                                ))}

                                {/* Pagination */}
                                <SearchPagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalResults={totalResults}
                                    pageSize={pageSize}
                                    baseQuery={baseQueryRecord}
                                />
                            </div>
                        ) : (
                            /* Zero-results fallback state with helpful instructions */
                            <div className="text-center py-16 px-4 bg-muted/10 border border-dashed border-border rounded-2xl max-w-2xl mx-auto my-8">
                                <Search className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    No publications matched your search
                                </h3>
                                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                                    {isSearching
                                        ? `We couldn't find any legal units matching "${query}" with the current filters. Try searching for broader terms, law/decree numbers, or clearing active filters.`
                                        : "No publications match the selected combination of filters. Try broadening your criteria."}
                                </p>

                                <div className="flex flex-wrap items-center justify-center gap-3">
                                    <Link href="/search">
                                        <Button variant="outline" size="sm">
                                            Clear All Filters
                                        </Button>
                                    </Link>
                                    <Link href="/search?year=2024">
                                        <Button variant="secondary" size="sm">
                                            Browse 2024 Archive
                                        </Button>
                                    </Link>
                                    <Link href="/search?type=قانون">
                                        <Button variant="secondary" size="sm">
                                            Browse Laws (قوانين)
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
