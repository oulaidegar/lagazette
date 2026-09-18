"use client";

import { useState } from "react";
import { LegalUnitDetail } from "@/lib/api";
import {
    FileText,
    Calendar,
    Building2,
    BookOpen,
    ExternalLink,
    Search,
    ShieldCheck,
    AlertTriangle,
    Eye,
} from "lucide-react";
import { LegalTable } from "@/components/document/legal-table";
import { DocumentActions } from "@/components/document/document-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DocumentViewerProps {
    document: LegalUnitDetail;
}

export function DocumentViewer({ document }: DocumentViewerProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showScanDrawer, setShowScanDrawer] = useState(false);

    // Format publication date safely
    const renderPublicationDate = () => {
        if (document.source.date_precision === "year_only") {
            return `Year ${document.source.year} (Exact date unverified)`;
        }
        if (document.source.publication_date) {
            try {
                const d = new Date(document.source.publication_date);
                if (!isNaN(d.getTime())) {
                    return d.toLocaleDateString("ar-LB", { day: "numeric", month: "long", year: "numeric" });
                }
            } catch {
                // fall through
            }
            return document.source.publication_date;
        }
        if (document.effective_date) {
            return document.effective_date;
        }
        return `سنة ${document.source.year}`;
    };

    // Helper to highlight search terms within content
    const renderHighlightedContent = (text: string) => {
        if (!searchTerm.trim() || searchTerm.length < 2) {
            return text;
        }

        try {
            const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const parts = text.split(new RegExp(`(${escaped})`, "gi"));
            return parts.map((part, index) =>
                part.toLowerCase() === searchTerm.toLowerCase() ? (
                    <mark
                        key={index}
                        className="bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-100 font-semibold px-0.5 rounded"
                    >
                        {part}
                    </mark>
                ) : (
                    part
                )
            );
        } catch {
            return text;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header Area */}
            <header className="space-y-4">
                {/* Meta Badges */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 text-xs sm:text-sm font-semibold rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wide">
                        {document.type || "Official Document"}
                    </span>
                    {document.unit_number && (
                        <span className="px-3 py-1 text-xs sm:text-sm font-mono font-medium rounded-full bg-muted text-muted-foreground border border-border">
                            No. {document.unit_number}
                        </span>
                    )}
                    {document.is_supplement && (
                        <span className="px-3 py-1 text-xs sm:text-sm font-medium rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-200">
                            ملحق (Supplement)
                        </span>
                    )}
                </div>

                {/* Main Arabic Document Title */}
                <h1
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-snug sm:leading-tight font-serif text-right"
                    dir="rtl"
                >
                    {document.title || "وثيقة رسمية غير معنونة"}
                </h1>

                {/* Provenance & Citation Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/40 border border-border rounded-2xl p-4 sm:p-6 text-sm">
                    {/* Issuer */}
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                Authority (الجهة المصدرة)
                            </p>
                            <p className="font-medium text-foreground mt-0.5 font-serif text-right" dir="rtl">
                                {document.issuer || "الجمهورية اللبنانية"}
                            </p>
                        </div>
                    </div>

                    {/* Source Archive Issue */}
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                Official Gazette
                            </p>
                            <p className="font-medium text-foreground mt-0.5">
                                Issue {document.source.issue_number} ({document.source.year})
                                {document.source.page_number && ` • p. ${document.source.page_number}`}
                            </p>
                        </div>
                    </div>

                    {/* Publication Date */}
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                Published Date
                            </p>
                            <p className="font-medium text-foreground mt-0.5 font-serif text-right" dir="rtl">
                                {renderPublicationDate()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions Toolbar (Citation, Print, Save) */}
                <DocumentActions document={document} />

                {/* In-Document Search & Scan Toggle */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Find within text..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-9 text-sm"
                        />
                    </div>

                    {document.source_pdf_url && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowScanDrawer(!showScanDrawer)}
                            className="w-full sm:w-auto h-9 gap-1.5 text-xs"
                        >
                            <Eye className="h-3.5 w-3.5" />
                            <span>{showScanDrawer ? "Hide Original Scan" : "View Original Gazette Scan"}</span>
                        </Button>
                    )}
                </div>

                {/* Embedded PDF Scan Viewer (if available and toggled) */}
                {showScanDrawer && document.source_pdf_url && (
                    <div className="border border-border rounded-xl p-4 bg-muted/20">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                                <FileText className="h-4 w-4 text-primary" />
                                Official Printed Scan
                            </h4>
                            <a
                                href={document.source_pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                                Open PDF in new tab <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                        <iframe
                            src={document.source_pdf_url}
                            className="w-full h-[600px] rounded-lg border border-border bg-white"
                            title="Official Gazette Printed Scan"
                        />
                    </div>
                )}
            </header>

            {/* Document Content Text */}
            <article className="border border-border bg-card rounded-2xl p-6 sm:p-10 shadow-sm" aria-label="Official text">
                <div
                    className="whitespace-pre-wrap leading-loose text-foreground font-serif text-base sm:text-lg text-right selection:bg-primary/20"
                    dir="rtl"
                >
                    {renderHighlightedContent(document.content)}
                </div>
            </article>

            {/* Structured Table Section (if available) */}
            {document.is_table && document.table_data && (
                <LegalTable data={document.table_data} />
            )}

            {/* Legal Accuracy Disclaimer */}
            <div className="p-5 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="font-semibold text-foreground">Official Verification Notice</p>
                    <p className="leading-relaxed">
                        This digital record is transcribed from the Lebanese Official Gazette for research and accessibility purposes. For binding judicial, commercial, or administrative proceedings, always verify against the original printed edition published by the Lebanese Council of Ministers.
                    </p>
                </div>
            </div>
        </div>
    );
}
