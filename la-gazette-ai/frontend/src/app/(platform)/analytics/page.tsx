
"use client";

import { useEffect, useState } from "react";
import { api, StatsResponse, HeatmapItem, KeywordItem } from "@/lib/api";
import { Loader2 } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import { ActivityHeatmap } from "@/components/analytics/activity-heatmap";
import { TopicCloud } from "@/components/analytics/topic-cloud";
import { ActivityTreemap } from "@/components/analytics/activity-treemap";
import { LebanonMap } from "@/components/analytics/lebanon-map";
import { LegislativeTimeline } from "@/components/analytics/legislative-timeline";
import { TrendLineChart } from "@/components/analytics/trend-line-chart";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

export default function AnalyticsPage() {
    const [stats, setStats] = useState<StatsResponse | null>(null);
    const [heatmapData, setHeatmapData] = useState<HeatmapItem[]>([]);
    const [keywords, setKeywords] = useState<KeywordItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const [statsData, heatmapRes, keywordsRes] = await Promise.all([
                    api.getStats(),
                    api.getHeatmap().catch(() => []),
                    api.getKeywords().catch(() => [])
                ]);
                setStats(statsData);
                setHeatmapData(heatmapRes);
                setKeywords(keywordsRes);
            } catch (e) {
                setError("Failed to load statistics. Please try again later.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-100 m-8">
                {error || "No data available"}
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Gazette Analytics
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Comprehensive legislative data visualization.
                    </p>
                </div>
                <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    Data updated: Live Archive
                </span>
            </div>

            {/* Provenance note */}
            <div className="bg-muted/40 border border-border p-4 rounded-xl text-xs text-muted-foreground">
                <p>
                    <strong className="text-foreground">Methodology Note:</strong> The figures below represent verified legal units and issues indexed in the La Gazette digital database. Click any category or authority to explore the underlying gazette records in Search.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                    href="/search"
                    className="p-6 rounded-xl bg-card border border-border shadow-sm flex flex-col justify-between hover:border-primary/40 transition-colors group"
                >
                    <h3 className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                        Total Legal Units Indexed &rarr;
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-foreground">
                            {stats.total_legal_units.toLocaleString()}
                        </p>
                        <span className="text-xs text-muted-foreground font-medium">Verified database count</span>
                    </div>
                </a>
                <a
                    href="/search"
                    className="p-6 rounded-xl bg-card border border-border shadow-sm flex flex-col justify-between hover:border-primary/40 transition-colors group"
                >
                    <h3 className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                        Total Issues Processed &rarr;
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-foreground">
                            {stats.total_issues.toLocaleString()}
                        </p>
                        <span className="text-xs text-muted-foreground font-medium">Official Gazette issues</span>
                    </div>
                </a>
            </div>

            {/* Row 1: Activity Pulses (Heatmap) */}
            <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                    Activity Pulse (Publications)
                </h3>
                {heatmapData.length > 0 ? (
                    <ActivityHeatmap data={heatmapData} />
                ) : (
                    <p className="text-sm text-slate-500 text-center py-8">No activity data available</p>
                )}
            </div>

            {/* Row 2: Topics, Types, Issuers (3 Cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Topic Cloud */}
                <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                        Trending Keywords
                    </h3>
                    <div className="flex-1">
                        <TopicCloud keywords={keywords} />
                    </div>
                </div>

                {/* Document Types (Pie) */}
                <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[400px]">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                        Document Types
                    </h3>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.by_type}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                >
                                    {stats.by_type.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Issuers (Bar) */}
                <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[400px]">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                        Top Issuers (Ranked)
                    </h3>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={stats.by_issuer.slice(0, 10)}
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={100}
                                    tick={{ fontSize: 11 }}
                                    interval={0}
                                />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Row 3: Advanced Visuals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LebanonMap />
                <ActivityTreemap />
            </div>

            {/* Row 4: Chronological */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LegislativeTimeline />
                <TrendLineChart />
            </div>
        </div>
    );
}
