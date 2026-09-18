"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchPaginationProps {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    pageSize: number;
    baseQuery: Record<string, string>;
}

export function SearchPagination({
    currentPage,
    totalPages,
    totalResults,
    pageSize,
    baseQuery,
}: SearchPaginationProps) {
    if (totalPages <= 1) return null;

    const createPageUrl = (page: number) => {
        const params = new URLSearchParams(baseQuery);
        if (page > 1) {
            params.set("page", page.toString());
        } else {
            params.delete("page");
        }
        const qs = params.toString();
        return `/search${qs ? `?${qs}` : ""}`;
    };

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalResults);

    // Calculate a small sliding window of pages
    const delta = 2;
    const range: number[] = [];
    for (
        let i = Math.max(1, currentPage - delta);
        i <= Math.min(totalPages, currentPage + delta);
        i++
    ) {
        range.push(i);
    }

    return (
        <nav
            aria-label="Search pagination"
            className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-border mt-8"
        >
            <p className="text-sm text-muted-foreground order-2 sm:order-1">
                Showing <span className="font-medium text-foreground">{startItem}</span> to{" "}
                <span className="font-medium text-foreground">{endItem}</span> of{" "}
                <span className="font-medium text-foreground">{totalResults.toLocaleString()}</span> results
            </p>

            <div className="flex items-center gap-1.5 order-1 sm:order-2">
                {/* Previous Page */}
                {currentPage > 1 ? (
                    <Link href={createPageUrl(currentPage - 1)}>
                        <Button variant="outline" size="sm" className="h-9 px-3 gap-1">
                            <ChevronLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Previous</span>
                        </Button>
                    </Link>
                ) : (
                    <Button variant="outline" size="sm" disabled className="h-9 px-3 gap-1">
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Previous</span>
                    </Button>
                )}

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                    {range[0] > 1 && (
                        <>
                            <Link href={createPageUrl(1)}>
                                <Button variant={currentPage === 1 ? "default" : "outline"} size="sm" className="h-9 w-9 p-0">
                                    1
                                </Button>
                            </Link>
                            {range[0] > 2 && <span className="px-1 text-muted-foreground">…</span>}
                        </>
                    )}

                    {range.map((p) => (
                        <Link key={p} href={createPageUrl(p)}>
                            <Button
                                variant={currentPage === p ? "default" : "outline"}
                                size="sm"
                                className="h-9 w-9 p-0 font-medium"
                                aria-current={currentPage === p ? "page" : undefined}
                            >
                                {p}
                            </Button>
                        </Link>
                    ))}

                    {range[range.length - 1] < totalPages && (
                        <>
                            {range[range.length - 1] < totalPages - 1 && <span className="px-1 text-muted-foreground">…</span>}
                            <Link href={createPageUrl(totalPages)}>
                                <Button variant={currentPage === totalPages ? "default" : "outline"} size="sm" className="h-9 w-9 p-0">
                                    {totalPages}
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Next Page */}
                {currentPage < totalPages ? (
                    <Link href={createPageUrl(currentPage + 1)}>
                        <Button variant="outline" size="sm" className="h-9 px-3 gap-1">
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </Link>
                ) : (
                    <Button variant="outline" size="sm" disabled className="h-9 px-3 gap-1">
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </nav>
    );
}
