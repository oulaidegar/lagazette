"use client";

import React, { useState } from "react";
import { GeoActivityItem } from "@/lib/api";
import Link from "next/link";
import { MapPin, Filter } from "lucide-react";

interface Props {
    geoItems: GeoActivityItem[];
}

const DOMAINS = [
    "All Domains",
    "Infrastructure",
    "Land Acquisition",
    "Municipal Decisions",
    "Environmental Regulation",
    "Public Procurement"
];

export function GeographicLebanon({ geoItems }: Props) {
    const [selectedDomain, setSelectedDomain] = useState<string>("All Domains");

    const filtered = geoItems.filter(item => {
        if (selectedDomain === "All Domains") return true;
        return item.domain.toLowerCase() === selectedDomain.toLowerCase();
    });

    // Aggregate by region
    const regionTotals: Record<string, number> = {};
    for (const item of filtered) {
        regionTotals[item.region] = (regionTotals[item.region] || 0) + item.act_count;
    }

    const sortedRegions = Object.entries(regionTotals).sort((a, b) => b[1] - a[1]);
    const maxVal = Math.max(...Object.values(regionTotals), 1);

    return (
        <section id="geography" className="space-y-6 pt-6 border-t border-border">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                        06 — GEOGRAPHIC LEBANON
                    </span>
                    <h2 className="text-2xl font-bold text-foreground mt-2">
                        Spatial Distribution of State Action
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Where does the gazette act? Regional concentration of public works, municipal mandates, and land expropriations.
                    </p>
                </div>

                {/* Domain Filter Pills */}
                <div className="flex flex-wrap gap-1 p-1 bg-muted/60 rounded-lg border border-border text-xs">
                    {DOMAINS.map((domain) => (
                        <button
                            key={domain}
                            onClick={() => setSelectedDomain(domain)}
                            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                                selectedDomain === domain
                                    ? "bg-card text-foreground shadow-sm border border-border"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {domain}
                        </button>
                    ))}
                </div>
            </div>

            {/* Regional Visual List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedRegions.map(([region, count]) => {
                    const pct = Math.round((count / maxVal) * 100);
                    // Generate ASCII dot representation as requested: e.g. ●●●●●●
                    const dotsCount = Math.min(Math.max(1, Math.round(pct / 10)), 10);
                    const dots = "●".repeat(dotsCount);

                    return (
                        <Link
                            key={region}
                            href={`/search?q=${encodeURIComponent(region)}`}
                            className="p-5 rounded-xl bg-card border border-border hover:border-primary/40 transition-all space-y-3 group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-cyan-500" />
                                    <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                                        {region}
                                    </h4>
                                </div>
                                <span className="font-mono text-sm font-bold text-foreground">
                                    {count.toLocaleString()} <span className="text-xs text-muted-foreground font-normal">acts</span>
                                </span>
                            </div>

                            {/* Dot indicator */}
                            <div className="text-cyan-500 font-mono tracking-widest text-sm select-none">
                                {dots}
                            </div>

                            {/* Distribution bar */}
                            <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>

                            <span className="text-[11px] text-muted-foreground block group-hover:underline">
                                Explore {region} legal decisions &rarr;
                            </span>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
