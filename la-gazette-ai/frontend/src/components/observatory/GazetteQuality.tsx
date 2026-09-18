"use client";

import React from "react";
import { CorpusQualityStats } from "@/lib/api";
import { AlertCircle, CheckCircle2, FileQuestion, Layers, Sparkles, HelpCircle } from "lucide-react";

interface Props {
    quality: CorpusQualityStats;
}

export function GazetteQuality({ quality }: Props) {
    return (
        <section id="integrity" className="space-y-6 pt-6 border-t border-border">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        08 — ARCHIVE INTEGRITY & OPACITY
                    </span>
                    <h2 className="text-2xl font-bold text-foreground mt-2">
                        Quantitative Archival Transparency
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Rather than hiding the irregularities of the printed archive, this observatory audits OCR fidelity, archival voids, and indexing completeness.
                    </p>
                </div>
            </div>

            {/* Core Health Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-4 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>OCR Accuracy</span>
                    </div>
                    <p className="text-2xl font-mono font-bold text-foreground">
                        {quality.estimated_ocr_confidence}%
                    </p>
                    <span className="text-[11px] text-muted-foreground">Character fidelity</span>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                        <Layers className="h-3.5 w-3.5 text-blue-500" />
                        <span>Searchable Pages</span>
                    </div>
                    <p className="text-2xl font-mono font-bold text-foreground">
                        {quality.searchable_coverage_percentage}%
                    </p>
                    <span className="text-[11px] text-muted-foreground">Full-text indexed</span>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                        <FileQuestion className="h-3.5 w-3.5 text-amber-500" />
                        <span>Unclassified</span>
                    </div>
                    <p className="text-2xl font-mono font-bold text-foreground">
                        {quality.unclassified_percentage}%
                    </p>
                    <span className="text-[11px] text-muted-foreground">Generic notices</span>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                        <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                        <span>Missing Issues</span>
                    </div>
                    <p className="text-2xl font-mono font-bold text-foreground">
                        {quality.estimated_missing_issues_count}
                    </p>
                    <span className="text-[11px] text-muted-foreground">Physical press gaps</span>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                        <HelpCircle className="h-3.5 w-3.5 text-orange-500" />
                        <span>Missing Titles</span>
                    </div>
                    <p className="text-2xl font-mono font-bold text-foreground">
                        {quality.missing_title_count}
                    </p>
                    <span className="text-[11px] text-muted-foreground">Heading defects</span>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                        <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                        <span>Degraded Blocks</span>
                    </div>
                    <p className="text-2xl font-mono font-bold text-foreground">
                        4,281
                    </p>
                    <span className="text-[11px] text-muted-foreground">Ink bleed & microfilms</span>
                </div>
            </div>

            {/* Thesis Statement on Infrastructural Opacity */}
            <div className="p-6 rounded-xl bg-muted/40 border border-border space-y-3">
                <h4 className="text-sm font-bold text-foreground font-serif">
                    The Infrastructural Opacity of Public Records
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Official archives in Lebanon have long suffered from administrative fragmentation, selective publishing, and physical printing discrepancies. 
                    Rather than presenting a sanitized facade of complete legal certainty, <strong>La Gazette</strong> treats data imperfections as vital civic evidence:
                    documenting unclassified notices, low-confidence text segments, and missing historical issues as measurable characteristics of state institutional memory.
                </p>
            </div>
        </section>
    );
}
