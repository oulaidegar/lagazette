"use client";

import React, { useState } from "react";
import { MinistryActivityItem } from "@/lib/api";
import Link from "next/link";
import { SlidersHorizontal, ExternalLink } from "lucide-react";

interface Props {
    ministries: MinistryActivityItem[];
    selectedYear: number | null;
    onYearChange: (year: number) => void;
}

export function GovernmentActivity({ ministries, selectedYear, onYearChange }: Props) {
    const [actType, setActType] = useState<"all" | "decrees" | "laws" | "decisions" | "appointments">("all");
    const currentYear = selectedYear || 2025;

    // Filter and sort
    const processed = ministries.map(m => {
        let count = m.total_acts;
        if (actType === "decrees") count = m.decrees;
        else if (actType === "laws") count = m.laws;
        else if (actType === "decisions") count = m.decisions;
        else if (actType === "appointments") count = m.appointments;
        return { ...m, displayCount: count };
    }).sort((a, b) => b.displayCount - a.displayCount);

    const maxCount = Math.max(...processed.map(p => p.displayCount), 1);

    return (
        <section id="government" className="space-y-6 pt-6 border-t border-border">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        02 — GOVERNMENT ACTIVITY
                    </span>
                    <h2 className="text-2xl font-bold text-foreground mt-2">
                        State Executive Output
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Quantitative production across Lebanese ministries, councils, and regulatory authorities.
                    </p>
                </div>

                {/* Act Type Filter Pills */}
                <div className="flex flex-wrap gap-1 p-1 bg-muted/60 rounded-lg border border-border text-xs">
                    {(["all", "decrees", "laws", "decisions", "appointments"] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setActType(type)}
                            className={`px-3 py-1.5 rounded-md font-medium capitalize transition-all ${
                                actType === type
                                    ? "bg-card text-foreground shadow-sm border border-border"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {type === "all" ? "All Types" : type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Period Slider */}
            <div className="p-4 rounded-xl bg-card border border-border flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">Observation Period:</span>
                    <span className="font-mono text-sm font-bold text-primary">{currentYear}</span>
                </div>
                <div className="flex items-center gap-3 w-full md:w-2/3">
                    <span className="text-xs font-mono text-muted-foreground">2014</span>
                    <input
                        type="range"
                        min="2014"
                        max="2026"
                        step="1"
                        value={currentYear}
                        onChange={(e) => onYearChange(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <span className="text-xs font-mono text-muted-foreground">2026</span>
                </div>
            </div>

            {/* Ministry Distribution Bar List */}
            <div className="space-y-3">
                {processed.slice(0, 10).map((m, idx) => {
                    const pct = Math.round((m.displayCount / maxCount) * 100);

                    return (
                        <div
                            key={m.issuer}
                            className="p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all space-y-2 group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-xs font-bold text-muted-foreground w-6">
                                        #{idx + 1}
                                    </span>
                                    <Link
                                        href={`/search?issuer=${encodeURIComponent(m.issuer)}&year=${currentYear}`}
                                        className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5"
                                    >
                                        <span dir="rtl">{m.issuer}</span>
                                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </div>
                                <div className="text-right">
                                    <span className="font-mono text-sm font-bold text-foreground">
                                        {m.displayCount.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-1">acts</span>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-muted/60 h-2.5 rounded-full overflow-hidden flex">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>

                            <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1">
                                <span>Decrees: {m.decrees.toLocaleString()}</span>
                                <span>Laws: {m.laws.toLocaleString()}</span>
                                <span>Decisions: {m.decisions.toLocaleString()}</span>
                                <span>Appointments: {m.appointments.toLocaleString()}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
