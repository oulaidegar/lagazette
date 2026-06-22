"use client";

import { Suspense } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { LatestIssueSummary } from "@/components/home/latest-issue-summary";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 relative overflow-hidden bg-[#020617] text-slate-200">

            {/* Background gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

            <div className="relative z-10 w-full max-w-4xl text-center space-y-8">
                <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    The Official Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Lebanese Gazette</span>
                </h1>

                <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
                    The Lebanese Official Gazette, reimagined. Search through laws, decrees, and decisions instantly with AI-powered semantic search.
                </p>

                <div className="w-full max-w-2xl mx-auto space-y-8 pt-8">
                    <div className="bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800">
                        <Suspense fallback={<div className="h-12 w-full animate-pulse bg-slate-800/50" />}>
                            <SearchInput className="w-full border-none shadow-none bg-transparent text-white placeholder:text-slate-400 focus-visible:ring-0" autoFocus />
                        </Suspense>
                    </div>
                    <div className="text-left">
                        <LatestIssueSummary />
                    </div>
                </div>

                {/* Quick Links / Metrics */}
                <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-400">
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-md">
                        <span className="block font-semibold text-white text-lg">2025</span>
                        Data Available
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-md">
                        <span className="block font-semibold text-white text-lg">17k+</span>
                        Legal Units
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-md">
                        <span className="block font-semibold text-white text-lg">Instant</span>
                        Search
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-md">
                        <span className="block font-semibold text-white text-lg">Smart</span>
                        Filtering
                    </div>
                </div>
            </div>
        </main>
    );
}
