"use client";

import { useEffect, useState } from "react";
import {
    api,
    ObservatoryOverview,
    MinistryActivityItem,
    TopicTrendItem,
    EntityNetworkEdge,
    GenealogyItem,
    GeoActivityItem,
    PeoplePowerItem,
    CorpusQualityStats
} from "@/lib/api";
import { Loader2, Database, Code2, ExternalLink, RefreshCw } from "lucide-react";
import { CorpusOverview } from "@/components/observatory/CorpusOverview";
import { GovernmentActivity } from "@/components/observatory/GovernmentActivity";
import { TopicObservatory } from "@/components/observatory/TopicObservatory";
import { StateNetwork } from "@/components/observatory/StateNetwork";
import { LegislativeGenealogy } from "@/components/observatory/LegislativeGenealogy";
import { GeographicLebanon } from "@/components/observatory/GeographicLebanon";
import { PeopleAndPower } from "@/components/observatory/PeopleAndPower";
import { GazetteQuality } from "@/components/observatory/GazetteQuality";

export default function AnalyticsPage() {
    const [overview, setOverview] = useState<ObservatoryOverview | null>(null);
    const [ministries, setMinistries] = useState<MinistryActivityItem[]>([]);
    const [topics, setTopics] = useState<TopicTrendItem[]>([]);
    const [network, setNetwork] = useState<EntityNetworkEdge[]>([]);
    const [genealogy, setGenealogy] = useState<GenealogyItem[]>([]);
    const [geography, setGeography] = useState<GeoActivityItem[]>([]);
    const [people, setPeople] = useState<PeoplePowerItem[]>([]);
    const [quality, setQuality] = useState<CorpusQualityStats | null>(null);

    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function fetchData() {
        setLoading(true);
        setError(null);
        try {
            const [
                overviewRes,
                ministriesRes,
                topicsRes,
                networkRes,
                genealogyRes,
                geographyRes,
                peopleRes,
                qualityRes
            ] = await Promise.all([
                api.getObservatoryOverview(),
                api.getObservatoryMinistries(selectedYear || undefined),
                api.getObservatoryTopics(),
                api.getObservatoryNetwork(),
                api.getObservatoryGenealogy(),
                api.getObservatoryGeography(),
                api.getObservatoryPeople(),
                api.getObservatoryIntegrity()
            ]);

            setOverview(overviewRes);
            setMinistries(ministriesRes);
            setTopics(topicsRes);
            setNetwork(networkRes);
            setGenealogy(genealogyRes);
            setGeography(geographyRes);
            setPeople(peopleRes);
            setQuality(qualityRes);
        } catch (e) {
            console.error("Failed to load observatory data:", e);
            setError("Failed to load research observatory data. Please check connection.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [selectedYear]);

    if (loading && !overview) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-xs font-mono text-muted-foreground">Loading Lebanese Gazette Research Observatory...</p>
            </div>
        );
    }

    if (error && !overview) {
        return (
            <div className="max-w-xl mx-auto my-16 p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-center space-y-4">
                <p className="text-sm text-destructive font-medium">{error}</p>
                <button
                    onClick={fetchData}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Retry Loading Observatory
                </button>
            </div>
        );
    }

    const sections = [
        { id: "corpus", label: "01 Corpus" },
        { id: "government", label: "02 Government" },
        { id: "topics", label: "03 Topics" },
        { id: "network", label: "04 State Network" },
        { id: "genealogy", label: "05 Genealogy" },
        { id: "geography", label: "06 Geography" },
        { id: "people", label: "07 People & Power" },
        { id: "integrity", label: "08 Quality & Opacity" },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Sticky Navigation Sub-Header */}
            <div className="sticky top-16 z-30 bg-background/95 backdrop-blur border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
                    <div className="flex items-center gap-1.5 flex-nowrap shrink-0">
                        {sections.map((sec) => (
                            <a
                                key={sec.id}
                                href={`#${sec.id}`}
                                className="px-3 py-1 rounded-full text-xs font-mono font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors whitespace-nowrap"
                            >
                                {sec.label}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full border border-border">
                            <Database className="h-3 w-3 text-emerald-500" />
                            <span>analytics schema active</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
                {/* Evidence.dev Architecture Banner */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                            <Code2 className="h-4 w-4" />
                        </div>
                        <div>
                            <span className="font-bold text-foreground block">
                                Research Observatory Architecture (Evidence.dev + PostgreSQL Analytics Schema)
                            </span>
                            <span className="text-muted-foreground">
                                Decoupled from operational chunk tables via isolated materialized views in <code className="text-primary font-mono">analytics.*</code>.
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-muted-foreground bg-background px-2.5 py-1 rounded border border-border">
                            Host: Supabase PostgreSQL Pooler (5432/6543)
                        </span>
                    </div>
                </div>

                {/* 01 — Corpus Overview */}
                {overview && (
                    <CorpusOverview
                        data={overview}
                        selectedYear={selectedYear}
                        onSelectYear={setSelectedYear}
                    />
                )}

                {/* 02 — Government Activity */}
                <GovernmentActivity
                    ministries={ministries}
                    selectedYear={selectedYear}
                    onYearChange={(year) => setSelectedYear(year)}
                />

                {/* 03 — Topic Observatory */}
                <TopicObservatory topicTrends={topics} />

                {/* 04 — State Network */}
                <StateNetwork networkEdges={network} />

                {/* 05 — Legislative Genealogy */}
                <LegislativeGenealogy genealogyItems={genealogy} />

                {/* 06 — Geographic Lebanon */}
                <GeographicLebanon geoItems={geography} />

                {/* 07 — People & Power */}
                <PeopleAndPower people={people} />

                {/* 08 — Archive Quality & Opacity */}
                {quality && <GazetteQuality quality={quality} />}
            </main>
        </div>
    );
}
