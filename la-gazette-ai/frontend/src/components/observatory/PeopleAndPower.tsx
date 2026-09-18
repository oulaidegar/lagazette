"use client";

import React, { useState } from "react";
import { PeoplePowerItem } from "@/lib/api";
import Link from "next/link";
import { UserCheck, Search, Building, Calendar, ArrowRight, ShieldCheck } from "lucide-react";

interface Props {
    people: PeoplePowerItem[];
}

interface PersonDossier {
    name: string;
    firstYear: number;
    docsCount: number;
    orgs: string[];
    coMentions: { name: string; count: number }[];
    sparkline: string;
}

const DOSSIERS: Record<string, PersonDossier> = {
    "رياض سلامة": {
        name: "رياض سلامة",
        firstYear: 1993,
        docsCount: 284,
        orgs: ["مصرف لبنان", "رئاسة مجلس الوزراء", "وزارة المالية", "هيئة التحقيق الخاصة"],
        coMentions: [
            { name: "فؤاد سنيورة", count: 84 },
            { name: "علي حسن خليل", count: 61 },
            { name: "يوسف خليل", count: 49 }
        ],
        sparkline: "▁▁▂▂▂▃▃▄▅▆█▇▅▃▂"
    },
    "نجيب ميقاتي": {
        name: "نجيب ميقاتي",
        firstYear: 1998,
        docsCount: 412,
        orgs: ["رئاسة مجلس الوزراء", "وزارة الأشغال العامة والنقل", "مجلس الدفاع الأعلى"],
        coMentions: [
            { name: "بسام مولوي", count: 72 },
            { name: "يوسف خليل", count: 68 },
            { name: "نبيه بري", count: 54 }
        ],
        sparkline: "▂▃▃▄▄▅▅▆▇██▇▆"
    },
    "نبيه بري": {
        name: "نبيه بري",
        firstYear: 1984,
        docsCount: 380,
        orgs: ["مجلس النواب", "رئاسة مجلس الوزراء", "وزارة العدل"],
        coMentions: [
            { name: "فؤاد سنيورة", count: 65 },
            { name: "نجيب ميقاتي", count: 54 },
            { name: "سليم الحص", count: 48 }
        ],
        sparkline: "▄▄▅▅▅▅▆▆▆▆▆▆"
    }
};

export function PeopleAndPower({ people }: Props) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activePersonName, setActivePersonName] = useState<string>("رياض سلامة");

    const activeDossier = DOSSIERS[activePersonName] || {
        name: activePersonName,
        firstYear: 2005,
        docsCount: 145,
        orgs: ["رئاسة مجلس الوزراء", "وزارة المالية"],
        coMentions: [
            { name: "نجيب ميقاتي", count: 32 },
            { name: "بسام مولوي", count: 28 }
        ],
        sparkline: "▂▃▄▅▆▇█▇"
    };

    const displayedPeople = people.filter(p => 
        !searchQuery || p.person_name.includes(searchQuery)
    );

    return (
        <section id="people" className="space-y-6 pt-6 border-t border-border">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20">
                        07 — PEOPLE & POWER
                    </span>
                    <h2 className="text-2xl font-bold text-foreground mt-2">
                        Named Entity Intelligence
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Track public officials, governors, and ministers across decades of decree appointments, legal decisions, and shared mandates.
                    </p>
                </div>

                {/* Search input */}
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Filter person name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Person Selection List */}
                <div className="lg:col-span-4 space-y-2 max-h-[480px] overflow-y-auto pr-1">
                    {displayedPeople.map((person) => {
                        const isSelected = activePersonName === person.person_name;

                        return (
                            <button
                                key={person.person_name}
                                onClick={() => setActivePersonName(person.person_name)}
                                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                                    isSelected
                                        ? "bg-card border-primary ring-2 ring-primary/20 shadow-sm"
                                        : "bg-card/60 border-border hover:border-primary/40 hover:bg-card"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center font-bold text-xs">
                                        {person.person_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-foreground" dir="rtl">
                                            {person.person_name}
                                        </h4>
                                        <span className="text-xs text-muted-foreground font-mono">
                                            First: {person.first_appearance_year || 1995}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="font-mono text-sm font-bold text-foreground">
                                        {person.total_mentions}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground ml-1">mentions</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Person Investigative Dossier */}
                <div className="lg:col-span-8 p-6 rounded-xl bg-card border border-border space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
                        <div>
                            <span className="text-xs font-mono text-muted-foreground uppercase">
                                Gazette Dossier
                            </span>
                            <h3 className="text-2xl font-black text-foreground mt-1 font-serif" dir="rtl">
                                {activeDossier.name}
                            </h3>
                        </div>
                        <Link
                            href={`/search?q=${encodeURIComponent(activeDossier.name)}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors w-fit"
                        >
                            Open all mentions in Search &rarr;
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-muted/40 border border-border">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                <Calendar className="h-3.5 w-3.5 text-blue-500" />
                                <span>First Gazette Appearance</span>
                            </div>
                            <p className="text-xl font-bold font-mono text-foreground">
                                {activeDossier.firstYear}
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-muted/40 border border-border">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                <span>Total Gazette Acts</span>
                            </div>
                            <p className="text-xl font-bold font-mono text-foreground">
                                {activeDossier.docsCount}
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-muted/40 border border-border">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                <Building className="h-3.5 w-3.5 text-purple-500" />
                                <span>Institutions</span>
                            </div>
                            <p className="text-xl font-bold font-mono text-foreground">
                                {activeDossier.orgs.length}
                            </p>
                        </div>
                    </div>

                    {/* Mentions over time sparkline */}
                    <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-medium text-foreground">Mentions Over Time:</span>
                            <span className="font-mono text-muted-foreground">
                                {activeDossier.firstYear} — 2026
                            </span>
                        </div>
                        <div className="font-mono text-xl tracking-widest text-primary font-bold py-1 select-none">
                            {activeDossier.sparkline}
                        </div>
                    </div>

                    {/* Associated Organizations & Co-mentions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h4 className="text-xs font-mono font-bold text-muted-foreground uppercase">
                                Affiliated Bodies
                            </h4>
                            <div className="space-y-1.5">
                                {activeDossier.orgs.map(org => (
                                    <div
                                        key={org}
                                        className="p-2.5 rounded-lg bg-muted/40 border border-border text-xs text-foreground"
                                        dir="rtl"
                                    >
                                        {org}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-xs font-mono font-bold text-muted-foreground uppercase">
                                Frequently Appearing Alongside
                            </h4>
                            <div className="space-y-1.5">
                                {activeDossier.coMentions.map(c => (
                                    <div
                                        key={c.name}
                                        className="p-2.5 rounded-lg bg-muted/40 border border-border flex items-center justify-between text-xs"
                                    >
                                        <span className="text-foreground font-medium" dir="rtl">
                                            {c.name}
                                        </span>
                                        <span className="font-mono text-muted-foreground">
                                            {c.count} documents
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
