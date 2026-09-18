"use client";

import React from "react";
import { ObservatoryOverview, YearlyActivityItem } from "@/lib/api";
import { BookOpen, FileText, ScrollText, Building2, Users, Briefcase } from "lucide-react";

interface Props {
    data: ObservatoryOverview;
    selectedYear: number | null;
    onSelectYear: (year: number | null) => void;
}

export function CorpusOverview({ data, selectedYear, onSelectYear }: Props) {
    const years = data.yearly_activity || [];
    const maxActs = Math.max(...years.map(y => y.total_acts), 1);

    return (
        <section id="corpus" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                            01 — CORPUS
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">LEBANESE OFFICIAL GAZETTE</span>
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-foreground mt-2 font-serif">
                        {data.scope_years}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Empirical archive metrics across verified issues, pages, and legal instruments.
                    </p>
                </div>
                {selectedYear && (
                    <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 px-3 py-1.5 rounded-lg">
                        <span className="text-xs text-primary font-medium">Filtering by Year:</span>
                        <span className="text-sm font-bold text-primary font-mono">{selectedYear}</span>
                        <button
                            onClick={() => onSelectYear(null)}
                            className="text-xs text-muted-foreground hover:text-foreground ml-2 underline"
                        >
                            Reset filter
                        </button>
                    </div>
                )}
            </div>

            {/* Macro Numbers */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-4 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-medium">Issues</span>
                    </div>
                    <p className="text-2xl font-bold font-mono text-foreground">
                        {data.total_issues.toLocaleString()}
                    </p>
                    <span className="text-[11px] text-muted-foreground">Official Gazette</span>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <FileText className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs font-medium">Pages</span>
                    </div>
                    <p className="text-2xl font-bold font-mono text-foreground">
                        {data.total_pages.toLocaleString()}
                    </p>
                    <span className="text-[11px] text-muted-foreground">Digitized scans</span>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <ScrollText className="h-4 w-4 text-amber-500" />
                        <span className="text-xs font-medium">Acts</span>
                    </div>
                    <p className="text-2xl font-bold font-mono text-foreground">
                        {data.total_acts.toLocaleString()}
                    </p>
                    <span className="text-[11px] text-muted-foreground">Indexed legal units</span>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Building2 className="h-4 w-4 text-purple-500" />
                        <span className="text-xs font-medium">Ministries</span>
                    </div>
                    <p className="text-2xl font-bold font-mono text-foreground">
                        {data.total_ministries}
                    </p>
                    <span className="text-[11px] text-muted-foreground">State authorities</span>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Users className="h-4 w-4 text-pink-500" />
                        <span className="text-xs font-medium">People</span>
                    </div>
                    <p className="text-2xl font-bold font-mono text-foreground">
                        {data.total_people.toLocaleString()}
                    </p>
                    <span className="text-[11px] text-muted-foreground">Extracted actors</span>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Briefcase className="h-4 w-4 text-cyan-500" />
                        <span className="text-xs font-medium">Organisations</span>
                    </div>
                    <p className="text-2xl font-bold font-mono text-foreground">
                        {data.total_organizations.toLocaleString()}
                    </p>
                    <span className="text-[11px] text-muted-foreground">Entities & firms</span>
                </div>
            </div>

            {/* Interactive Timeline with 1-click year filter */}
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-foreground">Publication Volume Over Time</h3>
                        <p className="text-xs text-muted-foreground">
                            Click any year column to filter the entire observatory.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span> Decrees
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Laws
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> Decisions
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-12 gap-2 pt-4">
                    {years.map((y) => {
                        const isSelected = selectedYear === y.year;
                        const heightPct = Math.max(15, Math.round((y.total_acts / maxActs) * 100));

                        return (
                            <button
                                key={y.year}
                                onClick={() => onSelectYear(isSelected ? null : y.year)}
                                className={`flex flex-col justify-end p-2 rounded-lg border transition-all text-left group ${
                                    isSelected 
                                        ? "bg-primary/10 border-primary ring-2 ring-primary/30" 
                                        : "bg-muted/30 border-border hover:border-primary/40 hover:bg-muted/60"
                                }`}
                                style={{ minHeight: "140px" }}
                            >
                                <div className="w-full flex items-end gap-0.5 h-20 mb-2">
                                    <div
                                        className="w-1/3 bg-blue-500 rounded-t-sm"
                                        style={{ height: `${Math.round((y.decrees_count / (y.total_acts || 1)) * heightPct)}%` }}
                                        title={`Decrees: ${y.decrees_count}`}
                                    />
                                    <div
                                        className="w-1/3 bg-emerald-500 rounded-t-sm"
                                        style={{ height: `${Math.round((y.laws_count / (y.total_acts || 1)) * heightPct)}%` }}
                                        title={`Laws: ${y.laws_count}`}
                                    />
                                    <div
                                        className="w-1/3 bg-amber-500 rounded-t-sm"
                                        style={{ height: `${Math.round((y.decisions_count / (y.total_acts || 1)) * heightPct)}%` }}
                                        title={`Decisions: ${y.decisions_count}`}
                                    />
                                </div>
                                <span className={`text-xs font-mono font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>
                                    {y.year}
                                </span>
                                <span className="text-[10px] font-mono text-muted-foreground truncate">
                                    {y.total_acts.toLocaleString()} acts
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
