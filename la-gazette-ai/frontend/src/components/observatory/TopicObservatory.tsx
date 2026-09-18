"use client";

import React, { useState } from "react";
import { TopicTrendItem } from "@/lib/api";
import Link from "next/link";
import { Zap, Landmark, Users, Trees, Landmark as GovIcon, Scale, ReceiptText, ArrowUpRight } from "lucide-react";

interface Props {
    topicTrends: TopicTrendItem[];
}

interface TopicMeta {
    id: string;
    title: string;
    titleAr: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    peakPeriod: string;
    ministries: string[];
    orgs: string[];
    relatedLaws: { code: string; title: string }[];
}

const TOPIC_METADATA: Record<string, TopicMeta> = {
    Banking: {
        id: "Banking",
        title: "Banking & Monetary",
        titleAr: "المصارف والنقد والودائع",
        icon: Landmark,
        color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        peakPeriod: "2019 — 2021 (Crisis & Circulars)",
        ministries: ["وزارة المالية", "رئاسة مجلس الوزراء", "وزارة الاقتصاد والتجارة"],
        orgs: ["مصرف لبنان", "جمعية مصارف لبنان", "لجنة الرقابة على المصارف", "هيئة الأسواق المالية"],
        relatedLaws: [
            { code: "قانون ٤٤ / ٢٠١٥", title: "مكافحة تبييض الأموال وتمويل الإرهاب" },
            { code: "قانون ١٩٣ / ٢٠٢٠", title: "الدولار الطالبي وتحويل الأموال للخارج" },
            { code: "تعميم ١٥١ / ٢٠٢٠", title: "سحوبات الودائع بالعملات الأجنبية" }
        ]
    },
    Electricity: {
        id: "Electricity",
        title: "Electricity & Energy",
        titleAr: "الكهرباء والطاقة والمحروقات",
        icon: Zap,
        color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        peakPeriod: "2021 — 2023 (Fuel Deficit & Tariffs)",
        ministries: ["وزارة الطاقة والمياه", "رئاسة مجلس الوزراء", "وزارة المالية"],
        orgs: ["مؤسسة كهرباء لبنان", "هيئة إدارة قطاع البترول", "مجلس الإنماء والإعمار"],
        relatedLaws: [
            { code: "قانون ٤٦٢ / ٢٠٠٢", title: "تنظيم قطاع الكهرباء والهيئة الناظمة" },
            { code: "قانون ١٢٩ / ٢٠١٩", title: "تعديل قانون خطة الكهرباء ومعامل الإنتاج" }
        ]
    },
    Refugees: {
        id: "Refugees",
        title: "Refugees & Displaced",
        titleAr: "النازحون واللاجئون والمساعدات",
        icon: Users,
        color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
        peakPeriod: "2015 — 2017 (Emergency Coordination)",
        ministries: ["وزارة الشؤون الاجتماعية", "وزارة الداخلية والبلديات", "وزارة الصحة العامة"],
        orgs: ["مفوضية الأمم المتحدة لشؤون اللاجئين", "الصندوق المركزي للمهجرين", "الأونروا"],
        relatedLaws: [
            { code: "مرسوم ٦٨٢١ / ٢٠٢٠", title: "تنظيم المساعدات الإنسانية الدولية" },
            { code: "قرار ٤٢ / ٢٠١٥", title: "ضوابط تسجيل وتصاريح الإقامة المؤقتة" }
        ]
    },
    Environment: {
        id: "Environment",
        title: "Environment & Water",
        titleAr: "البيئة والمياه والمحميات",
        icon: Trees,
        color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        peakPeriod: "2022 — 2025 (Waste Management & Reserves)",
        ministries: ["وزارة البيئة", "وزارة الطاقة والمياه", "وزارة الزراعة"],
        orgs: ["مصلحة الأبحاث العلمية الزراعية", "مصلحة مياه بيروت وجبل لبنان"],
        relatedLaws: [
            { code: "قانون ٤٤٤ / ٢٠٠٢", title: "حماية البيئة والمحميات الطبيعية" },
            { code: "قانون ٨٠ / ٢٠١٨", title: "الإدارة المتكاملة للنفايات الصلبة" }
        ]
    },
    Municipalities: {
        id: "Municipalities",
        title: "Municipalities & Local Gov",
        titleAr: "البلديات والتنظيم المدني",
        icon: GovIcon,
        color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
        peakPeriod: "2017 — 2019 (Independent Municipal Fund)",
        ministries: ["وزارة الداخلية والبلديات", "وزارة المالية", "مجلس الإنماء والإعمار"],
        orgs: ["الصندوق البلدي المستقل", "المديرية العامة للتنظيم المدني"],
        relatedLaws: [
            { code: "مرسوم ١١٨ / ١٩٧٧", title: "قانون البلديات العام وتعديلاته" },
            { code: "مرسوم ٤٣١٤ / ٢٠١٩", title: "توزيع عائدات الصندوق البلدي المستقل" }
        ]
    },
    Judiciary: {
        id: "Judiciary",
        title: "Judiciary & Anti-Corruption",
        titleAr: "القضاء ومكافحة الفساد",
        icon: Scale,
        color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
        peakPeriod: "2020 — 2022 (Financial Audits & Judicial Formations)",
        ministries: ["وزارة العدل", "مجلس القضاء الأعلى", "مجلس الوزراء"],
        orgs: ["هيئة التفتيش القضائي", "الهيئة الوطنية لمكافحة الفساد", "ديوان المحاسبة"],
        relatedLaws: [
            { code: "قانون ١٧٥ / ٢٠٢٠", title: "مكافحة الفساد وإنشاء الهيئة الوطنية" },
            { code: "قانون ١٨٩ / ٢٠٢٠", title: "التصريح عن الذمة المالية ومعاقبة الإثراء غير المشروع" }
        ]
    },
    Taxes: {
        id: "Taxes",
        title: "Customs & Public Finance",
        titleAr: "الضرائب والجمارك والمالية العامة",
        icon: ReceiptText,
        color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
        peakPeriod: "2024 — 2025 (Budget & Customs Dollar)",
        ministries: ["وزارة المالية", "رئاسة مجلس الوزراء", "وزارة الاقتصاد والتجارة"],
        orgs: ["المجلس الأعلى للجمارك", "مديرية الواردات والضريبة على القيمة المضافة"],
        relatedLaws: [
            { code: "قانون موازنة ٢٠٢٤", title: "قانون الموازنة العامة واستحداث الرسوم" },
            { code: "مرسوم الدولار الجمركي", title: "تعديل تسعير الرسوم الجمركية على الاستيراد" }
        ]
    }
};

const SPARK_BLOCKS = [" ", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

function generateSparkline(items: TopicTrendItem[]): string {
    if (!items.length) return "▁▁▂▂▃▃▄▅▆";
    const vals = items.map(i => i.frequency);
    const max = Math.max(...vals, 1);
    return vals.map(v => {
        const idx = Math.min(Math.floor((v / max) * (SPARK_BLOCKS.length - 1)), SPARK_BLOCKS.length - 1);
        return SPARK_BLOCKS[idx];
    }).join("");
}

export function TopicObservatory({ topicTrends }: Props) {
    const [activeTopicId, setActiveTopicId] = useState<string>("Banking");
    const activeMeta = TOPIC_METADATA[activeTopicId] || TOPIC_METADATA.Banking;

    // Group items by topic
    const topicGroups = Object.keys(TOPIC_METADATA).map(key => {
        const items = topicTrends.filter(t => t.topic.toLowerCase() === key.toLowerCase());
        const total = items.reduce((acc, cur) => acc + cur.frequency, 0);
        return {
            meta: TOPIC_METADATA[key],
            items,
            total,
            sparkline: generateSparkline(items)
        };
    });

    return (
        <section id="topics" className="space-y-6 pt-6 border-t border-border">
            <div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    03 — TOPIC OBSERVATORY
                </span>
                <h2 className="text-2xl font-bold text-foreground mt-2">
                    What Has the Lebanese State Been Talking About?
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Temporal trajectories, legislative surges, and institutional responsibility across national themes.
                </p>
            </div>

            {/* Sparkline Overview Rows */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {topicGroups.map(({ meta, total, sparkline }) => {
                    const Icon = meta.icon;
                    const isActive = activeTopicId === meta.id;

                    return (
                        <button
                            key={meta.id}
                            onClick={() => setActiveTopicId(meta.id)}
                            className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                                isActive 
                                    ? "bg-card border-primary ring-2 ring-primary/20 shadow-sm" 
                                    : "bg-card/60 border-border hover:border-primary/40 hover:bg-card"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg border ${meta.color}`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-sm text-foreground">{meta.title}</h4>
                                        <span className="text-xs text-muted-foreground" dir="rtl">
                                            ({meta.titleAr})
                                        </span>
                                    </div>
                                    <span className="text-xs font-mono text-muted-foreground">
                                        {total > 0 ? `${total.toLocaleString()} acts indexed` : "Longitudinal tracking"}
                                    </span>
                                </div>
                            </div>

                            {/* ASCII Sparkline */}
                            <div className="text-right">
                                <span className="font-mono text-base font-bold text-primary tracking-widest block select-none">
                                    {sparkline}
                                </span>
                                <span className="text-[10px] font-mono text-muted-foreground">2014 — 2026</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Topic Deep-Dive Panel */}
            <div className="p-6 rounded-xl bg-card border border-border space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl border ${activeMeta.color}`}>
                            {React.createElement(activeMeta.icon, { className: "h-6 w-6" })}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">
                                Deep Dive: {activeMeta.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5" dir="rtl">
                                {activeMeta.titleAr}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={`/search?q=${encodeURIComponent(activeMeta.titleAr.split(" ")[0])}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors w-fit"
                    >
                        Search all {activeMeta.title} records
                        <ArrowUpRight className="h-3 w-3" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Peak Periods & Trajectory */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                            Peak Publication Period
                        </h4>
                        <div className="p-4 rounded-xl bg-muted/40 border border-border">
                            <span className="text-sm font-bold text-foreground font-serif">
                                {activeMeta.peakPeriod}
                            </span>
                            <p className="text-xs text-muted-foreground mt-2">
                                Highest concentration of decrees, ministerial decisions, and emergency regulatory notices.
                            </p>
                        </div>
                    </div>

                    {/* Involved Ministries & Authorities */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                            Relevant Authorities
                        </h4>
                        <div className="space-y-1.5">
                            {activeMeta.ministries.map(m => (
                                <Link
                                    key={m}
                                    href={`/search?issuer=${encodeURIComponent(m)}`}
                                    className="p-2.5 rounded-lg bg-muted/40 border border-border hover:border-primary/40 text-xs text-foreground block transition-colors"
                                    dir="rtl"
                                >
                                    {m} &rarr;
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Organizations & Regulatory Bodies */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                            Key Regulators & Entities
                        </h4>
                        <div className="space-y-1.5">
                            {activeMeta.orgs.map(o => (
                                <div
                                    key={o}
                                    className="p-2.5 rounded-lg bg-muted/40 border border-border text-xs text-foreground"
                                    dir="rtl"
                                >
                                    {o}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Related Key Laws & Decrees */}
                <div className="pt-4 border-t border-border space-y-3">
                    <h4 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                        Foundational Legislation & Frameworks
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {activeMeta.relatedLaws.map(law => (
                            <Link
                                key={law.code}
                                href={`/search?q=${encodeURIComponent(law.code)}`}
                                className="p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/40 transition-colors block group"
                            >
                                <span className="font-mono text-xs font-bold text-primary block group-hover:underline">
                                    {law.code}
                                </span>
                                <span className="text-xs text-foreground line-clamp-2 mt-1" dir="rtl">
                                    {law.title}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
