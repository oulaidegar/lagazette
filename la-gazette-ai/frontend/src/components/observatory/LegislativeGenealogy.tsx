"use client";

import React, { useState } from "react";
import { GenealogyItem } from "@/lib/api";
import Link from "next/link";
import { GitFork, GitBranch, ArrowRight, BookOpen } from "lucide-react";

interface Props {
    genealogyItems: GenealogyItem[];
}

export function LegislativeGenealogy({ genealogyItems }: Props) {
    const items = genealogyItems.length > 0 ? genealogyItems : [
        {
            relationship_type: "amends",
            description: "تعديل المادة السادسة المتعلقة بتبادل المعلومات المالية والضريبية",
            source_title: "قانون مكافحة تبييض الأموال وتمويل الإرهاب (قانون ٤٤ / ٢٠١٥)",
            source_number: "44/2015",
            source_year: 2015,
            target_title: "قانون تبادل المعلومات الضريبية الدولية (قانون ٥٥ / ٢٠١٦)",
            target_number: "55/2016",
            target_year: 2016
        },
        {
            relationship_type: "referenced_by",
            description: "تحديد دقائق تطبيق معايير الامتثال والتحقق المصرفي",
            source_title: "قانون مكافحة تبييض الأموال وتمويل الإرهاب (قانون ٤٤ / ٢٠١٥)",
            source_number: "44/2015",
            source_year: 2015,
            target_title: "مرسوم شروط التحقق المصرفي ومعايير الامتثال (مرسوم ١٠٢٤ / ٢٠١٨)",
            target_number: "1024/2018",
            target_year: 2018
        },
        {
            relationship_type: "implemented_by",
            description: "نظام عمل هيئة التحقيق الخاصة وإجراءات تجميد الأصول المشبوهة",
            source_title: "مرسوم شروط التحقق المصرفي ومعايير الامتثال (مرسوم ١٠٢٤ / ٢٠١٨)",
            source_number: "1024/2018",
            source_year: 2018,
            target_title: "قرار هيئة التحقيق الخاصة بشأن فتح وتجميد الحسابات (قرار ٧٨١ / ٢٠١٩)",
            target_number: "781/2019",
            target_year: 2019
        },
        {
            relationship_type: "amends",
            description: "إلزام كبار الموظفين والمصرفيين بالتصريح عن الذمة المالية ومكافحة الإثراء",
            source_title: "قانون مكافحة تبييض الأموال وتمويل الإرهاب (قانون ٤٤ / ٢٠١٥)",
            source_number: "44/2015",
            source_year: 2015,
            target_title: "قانون التصريح عن الذمة المالية ومعاقبة الإثراء غير المشروع (قانون ١٨٩ / ٢٠٢٠)",
            target_number: "189/2020",
            target_year: 2020
        }
    ];

    const [selectedRelation, setSelectedRelation] = useState<GenealogyItem | null>(items[0]);

    return (
        <section id="genealogy" className="space-y-6 pt-6 border-t border-border">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        05 — LEGISLATIVE GENEALOGY
                    </span>
                    <h2 className="text-2xl font-bold text-foreground mt-2">
                        Legal Instrument Pedigree & Evolution
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Navigate the amendment lineage of pivotal Lebanese laws: which decrees implement them, and which statutes amend them.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Visual Tree View */}
                <div className="lg:col-span-7 p-6 rounded-xl bg-card border border-border space-y-6">
                    {/* Root Law */}
                    <div className="p-4 rounded-xl bg-primary/10 border-2 border-primary/40 text-foreground">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono font-bold text-primary uppercase tracking-wider">
                                Root Instrument
                            </span>
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-primary/20 text-primary font-bold">
                                2015
                            </span>
                        </div>
                        <h3 className="text-base font-bold mt-1.5 font-serif" dir="rtl">
                            قانون مكافحة تبييض الأموال وتمويل الإرهاب (قانون رقم ٤٤ / ٢٠١٥)
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Cornerstone anti-money laundering legislation creating the modern Special Investigation Commission framework.
                        </p>
                    </div>

                    {/* Genealogy Branches */}
                    <div className="relative pl-6 space-y-4 border-l-2 border-primary/30 ml-4">
                        {items.map((item, idx) => {
                            const isSelected = selectedRelation?.target_title === item.target_title;
                            const badgeColor = item.relationship_type === "amends" 
                                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                : item.relationship_type === "implemented_by"
                                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                : "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30";

                            return (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedRelation(item)}
                                    className={`relative p-4 rounded-xl border transition-all cursor-pointer ${
                                        isSelected 
                                            ? "bg-card border-primary ring-2 ring-primary/20 shadow-sm" 
                                            : "bg-card/60 border-border hover:border-primary/40 hover:bg-card"
                                    }`}
                                >
                                    {/* Branch Dot */}
                                    <div className="absolute -left-[31px] top-6 w-3 h-3 rounded-full bg-primary border-2 border-card" />

                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${badgeColor}`}>
                                                {item.relationship_type.replace("_", " ")}
                                            </span>
                                            <span className="font-mono text-xs font-bold text-foreground">
                                                {item.target_number}
                                            </span>
                                        </div>
                                        <span className="font-mono text-xs text-muted-foreground">
                                            {item.target_year}
                                        </span>
                                    </div>

                                    <h4 className="text-sm font-semibold text-foreground mt-2" dir="rtl">
                                        {item.target_title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2" dir="rtl">
                                        {item.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Detail Inspector Card */}
                <div className="lg:col-span-5 p-6 rounded-xl bg-card border border-border space-y-4 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
                            <GitFork className="h-3.5 w-3.5 text-primary" />
                            <span>Legal Lineage Context</span>
                        </div>

                        {selectedRelation ? (
                            <div className="mt-4 space-y-4">
                                <div>
                                    <span className="text-xs text-muted-foreground font-mono">MODIFICATION TYPE</span>
                                    <h4 className="text-lg font-bold text-foreground font-mono mt-0.5 uppercase">
                                        {selectedRelation.relationship_type.replace("_", " ")}
                                    </h4>
                                </div>

                                <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-2">
                                    <span className="text-xs font-medium text-muted-foreground">Substantive Scope:</span>
                                    <p className="text-sm text-foreground leading-relaxed" dir="rtl">
                                        {selectedRelation.description}
                                    </p>
                                </div>

                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between py-1.5 border-b border-border">
                                        <span className="text-muted-foreground">Originating Year:</span>
                                        <span className="font-mono font-bold text-foreground">{selectedRelation.source_year}</span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b border-border">
                                        <span className="text-muted-foreground">Enacting Year:</span>
                                        <span className="font-mono font-bold text-foreground">{selectedRelation.target_year}</span>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="pt-4 border-t border-border">
                        {selectedRelation && (
                            <Link
                                href={`/search?q=${encodeURIComponent(selectedRelation.target_number || "")}`}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                            >
                                <BookOpen className="h-4 w-4" />
                                Inspect Act in Archive Search
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
