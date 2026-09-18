"use client";

import Link from "next/link";
import { Calendar, FileText, Building2, ChevronRight, ExternalLink, Bookmark } from "lucide-react";
import { LegalUnitSummary } from "@/lib/api";
import { BookmarkButton } from "@/components/library/bookmark-button";
import { motion } from "framer-motion";

interface ResultCardProps {
    result: LegalUnitSummary;
    index: number;
    highlightTerms?: string[];
}

export function ResultCard({ result, index, highlightTerms = [] }: ResultCardProps) {
    // Helper to highlight terms
    const renderContent = (text: string) => {
        if (!highlightTerms.length || !text) return text;

        // Escape terms for regex
        const terms = highlightTerms
            .filter(t => t && t.length > 1)
            .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

        if (!terms.length) return text;

        const pattern = new RegExp(`(${terms.join('|')})`, 'gi');
        const parts = text.split(pattern);

        return parts.map((part, i) =>
            terms.some(t => part.toLowerCase() === t.toLowerCase()) ?
                <mark key={i} className="bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-semibold px-0.5 rounded">{part}</mark> :
                part
        );
    };

    // Format publication date safely
    const renderDate = () => {
        if (result.source.date_precision === "year_only") {
            return `Year ${result.source.year}`;
        }
        if (result.source.publication_date) {
            try {
                const d = new Date(result.source.publication_date);
                if (!isNaN(d.getTime())) {
                    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
                }
            } catch {
                // fall through
            }
            return result.source.publication_date;
        }
        if (result.effective_date) {
            return result.effective_date;
        }
        return `Year ${result.source.year}`;
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.04, 0.4) }}
            className="bg-card text-card-foreground rounded-xl border border-border p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 flex flex-col justify-between gap-4"
        >
            <div>
                {/* Header Meta Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary uppercase tracking-wide">
                            {result.type || "Document"}
                        </span>
                        {result.unit_number && (
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                No. {result.unit_number}
                            </span>
                        )}
                        {result.match_type === "exact_reference" && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Exact Match
                            </span>
                        )}
                        {result.match_type === "semantic" && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                Semantic Match
                            </span>
                        )}
                    </div>

                    <BookmarkButton legalUnitId={result.id} size="sm" variant="ghost" showText={false} />
                </div>

                {/* Document Title */}
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 line-clamp-2 hover:text-primary transition-colors text-right font-serif" dir="rtl">
                    <Link href={`/legal-units/${result.id}`}>
                        {result.title || "وثيقة غير معنونة"}
                    </Link>
                </h3>

                {/* Metadata Line */}
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-muted-foreground mb-3 pb-3 border-b border-border/60">
                    {result.issuer && (
                        <div className="flex items-center gap-1.5" title="Issuing Authority">
                            <Building2 className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                            <span className="font-medium text-foreground/80">{result.issuer}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 shrink-0" />
                        <span>Issue {result.source.issue_number} ({result.source.year})</span>
                    </div>

                    {result.source.page_number && (
                        <div className="flex items-center gap-1">
                            <span>p. {result.source.page_number}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>{renderDate()}</span>
                    </div>
                </div>

                {/* Content Preview */}
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 text-right font-serif" dir="rtl">
                    {renderContent(result.content_preview)}
                </p>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-2 flex items-center justify-between gap-4 text-xs sm:text-sm">
                <Link
                    href={`/search?year=${result.source.year}&issue_number=${result.source.issue_number}`}
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors hover:underline"
                >
                    <FileText className="h-3.5 w-3.5" />
                    Browse all units in Issue {result.source.issue_number}
                </Link>

                <Link
                    href={`/legal-units/${result.id}`}
                    className="font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1 group"
                >
                    Read Full Text
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
            </div>
        </motion.article>
    );
}
