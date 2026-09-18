"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Filter,
    X,
    SlidersHorizontal,
    Check,
    RotateCcw,
    Building2,
    Calendar,
    FileText,
    ArrowUpDown,
    HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchFiltersBarProps {
    currentFilters: {
        q?: string;
        type?: string;
        year?: string;
        issue_number?: string;
        issuer?: string;
        sort?: string;
    };
    totalCount: number;
}

const DOCUMENT_TYPES = [
    { label: "All Types", value: "" },
    { label: "Law / قانون", value: "قانون" },
    { label: "Decree / مرسوم", value: "مرسوم" },
    { label: "Decision / قرار", value: "قرار" },
    { label: "Notice / إعلان", value: "إعلان" },
    { label: "Circular / تعميم", value: "تعميم" },
    { label: "Order / أمر", value: "أمر" },
];

const COMMON_ISSUERS = [
    { label: "All Authorities", value: "" },
    { label: "Council of Ministers (مجلس الوزراء)", value: "مجلس الوزراء" },
    { label: "Ministry of Finance (وزارة المالية)", value: "وزارة المالية" },
    { label: "Ministry of Justice (وزارة العدل)", value: "وزارة العدل" },
    { label: "Ministry of Interior (وزارة الداخلية والبلديات)", value: "وزارة الداخلية والبلديات" },
    { label: "Ministry of Economy (وزارة الاقتصاد والتجارة)", value: "وزارة الاقتصاد والتجارة" },
    { label: "Banque du Liban (مصرف لبنان)", value: "مصرف لبنان" },
];

const YEARS = [
    { label: "All Years", value: "" },
    { label: "2024", value: "2024" },
    { label: "2023", value: "2023" },
    { label: "2022", value: "2022" },
    { label: "2021", value: "2021" },
    { label: "2020", value: "2020" },
    { label: "2019", value: "2019" },
    { label: "2018", value: "2018" },
    { label: "2017", value: "2017" },
    { label: "2016", value: "2016" },
    { label: "2015", value: "2015" },
];

export function SearchFiltersBar({ currentFilters, totalCount }: SearchFiltersBarProps) {
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Filter values state for form inputs
    const [issueInput, setIssueInput] = useState(currentFilters.issue_number || "");

    const updateFilter = (key: string, value: string | undefined) => {
        const params = new URLSearchParams();

        // Copy existing params
        Object.entries(currentFilters).forEach(([k, v]) => {
            if (v && k !== "page") {
                params.set(k, v);
            }
        });

        if (value && value.trim() !== "") {
            params.set(key, value.trim());
        } else {
            params.delete(key);
        }

        // Reset page to 1 on filter change
        params.delete("page");

        const qs = params.toString();
        router.push(`/search${qs ? `?${qs}` : ""}`);
    };

    const clearAllFilters = () => {
        const params = new URLSearchParams();
        if (currentFilters.q) {
            params.set("q", currentFilters.q);
        }
        const qs = params.toString();
        router.push(`/search${qs ? `?${qs}` : ""}`);
    };

    const hasActiveFilters = Boolean(
        currentFilters.type ||
        currentFilters.year ||
        currentFilters.issue_number ||
        currentFilters.issuer ||
        (currentFilters.sort && currentFilters.sort !== "relevance")
    );

    return (
        <div className="w-full">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border mb-4">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="lg:hidden flex items-center gap-1.5"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        <span>Filters {hasActiveFilters && "(Active)"}</span>
                    </Button>

                    <span className="text-sm font-medium text-muted-foreground">
                        {totalCount > 0 ? (
                            <span>Found <strong className="text-foreground">{totalCount.toLocaleString()}</strong> publications</span>
                        ) : (
                            <span>No matching publications</span>
                        )}
                    </span>
                </div>

                {/* Sort Control */}
                <div className="flex items-center gap-2 text-sm">
                    <label htmlFor="sort-select" className="text-muted-foreground flex items-center gap-1 text-xs sm:text-sm">
                        <ArrowUpDown className="h-3.5 w-3.5" />
                        <span>Sort:</span>
                    </label>
                    <select
                        id="sort-select"
                        value={currentFilters.sort || "relevance"}
                        onChange={(e) => updateFilter("sort", e.target.value)}
                        className="bg-background border border-border rounded-lg text-xs sm:text-sm px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                    >
                        <option value="relevance">Most Relevant</option>
                        <option value="date_desc">Newest to Oldest</option>
                        <option value="date_asc">Oldest to Newest</option>
                    </select>
                </div>
            </div>

            {/* Active Filter Badges / Chips */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active:</span>

                    {currentFilters.type && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                            Type: {currentFilters.type}
                            <button
                                onClick={() => updateFilter("type", undefined)}
                                className="hover:text-primary/70 p-0.5 rounded-full"
                                aria-label="Remove type filter"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}

                    {currentFilters.year && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                            Year: {currentFilters.year}
                            <button
                                onClick={() => updateFilter("year", undefined)}
                                className="hover:text-primary/70 p-0.5 rounded-full"
                                aria-label="Remove year filter"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}

                    {currentFilters.issue_number && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                            Issue: {currentFilters.issue_number}
                            <button
                                onClick={() => updateFilter("issue_number", undefined)}
                                className="hover:text-primary/70 p-0.5 rounded-full"
                                aria-label="Remove issue filter"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}

                    {currentFilters.issuer && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                            Authority: {currentFilters.issuer}
                            <button
                                onClick={() => updateFilter("issuer", undefined)}
                                className="hover:text-primary/70 p-0.5 rounded-full"
                                aria-label="Remove authority filter"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
                    >
                        <RotateCcw className="h-3 w-3" />
                        Clear All
                    </Button>
                </div>
            )}

            {/* Desktop Filters Panel / Mobile Collapsible Drawer */}
            <div className={`${mobileOpen ? "block" : "hidden"} lg:block bg-card border border-border rounded-xl p-4 mb-6 shadow-sm`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Document Type */}
                    <div>
                        <label htmlFor="filter-type" className="block text-xs font-semibold text-foreground mb-1.5">
                            Document Type
                        </label>
                        <select
                            id="filter-type"
                            value={currentFilters.type || ""}
                            onChange={(e) => updateFilter("type", e.target.value)}
                            className="w-full bg-background border border-border rounded-lg text-sm px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                            {DOCUMENT_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Publication Year */}
                    <div>
                        <label htmlFor="filter-year" className="block text-xs font-semibold text-foreground mb-1.5">
                            Publication Year
                        </label>
                        <select
                            id="filter-year"
                            value={currentFilters.year || ""}
                            onChange={(e) => updateFilter("year", e.target.value)}
                            className="w-full bg-background border border-border rounded-lg text-sm px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                            {YEARS.map((y) => (
                                <option key={y.value} value={y.value}>
                                    {y.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Issue Number */}
                    <div>
                        <label htmlFor="filter-issue" className="block text-xs font-semibold text-foreground mb-1.5">
                            Issue Number (العدد)
                        </label>
                        <div className="flex gap-2">
                            <Input
                                id="filter-issue"
                                type="number"
                                min="1"
                                max="10000"
                                placeholder="e.g. 35"
                                value={issueInput}
                                onChange={(e) => setIssueInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        updateFilter("issue_number", issueInput);
                                    }
                                }}
                                className="h-9 text-sm"
                            />
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => updateFilter("issue_number", issueInput)}
                                className="h-9 px-3"
                            >
                                Apply
                            </Button>
                        </div>
                    </div>

                    {/* Issuing Authority */}
                    <div>
                        <label htmlFor="filter-issuer" className="block text-xs font-semibold text-foreground mb-1.5">
                            Issuing Authority (الجهة المصدرة)
                        </label>
                        <select
                            id="filter-issuer"
                            value={currentFilters.issuer || ""}
                            onChange={(e) => updateFilter("issuer", e.target.value)}
                            className="w-full bg-background border border-border rounded-lg text-sm px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 truncate"
                        >
                            {COMMON_ISSUERS.map((iss) => (
                                <option key={iss.value} value={iss.value}>
                                    {iss.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
