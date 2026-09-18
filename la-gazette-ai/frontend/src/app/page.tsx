"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Search, BookOpen, Layers, ShieldCheck, ArrowRight, ArrowLeft, HelpCircle, FileText, Database } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { LatestIssueSummary } from "@/components/home/latest-issue-summary";
import { useLanguage } from "@/components/layout/language-context";
import { Button } from "@/components/ui/button";

export default function Home() {
    const { language, dir, t } = useLanguage();
    const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

    const exampleQueries = [
        { label: language === "ar" ? "مرسوم رقم 14539" : "Decree No. 14539", query: "مرسوم 14539" },
        { label: language === "ar" ? "وزارة المالية" : "Ministry of Finance", query: "وزارة المالية" },
        { label: language === "ar" ? "قوانين الضرائب والموازنة" : "Tax Laws & Budget", query: "قانون الضرائب والموازنة" },
        { label: language === "ar" ? "مجلس الوزراء" : "Council of Ministers", query: "مجلس الوزراء" },
    ];

    return (
        <div className="w-full flex flex-col items-center justify-start py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-4xl mx-auto space-y-10 text-center">
                
                {/* Civic Institutional Status Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-secondary/60 text-xs text-muted-foreground font-medium shadow-2xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>
                        {language === "ar" 
                            ? "أرشيف مدني رقمي مستقل للجريدة الرسمية اللبنانية" 
                            : "Independent Civic Digital Archive for the Lebanese Official Gazette"}
                    </span>
                </div>

                {/* Hero Title & Subtitle */}
                <div className="space-y-4 max-w-3xl mx-auto">
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                        {language === "ar" ? (
                            <>ابحث في <span className="text-primary underline decoration-primary/30 underline-offset-8">الجريدة الرسمية</span> بدقة وشفافية</>
                        ) : (
                            <>Search the <span className="text-primary underline decoration-primary/30 underline-offset-8">Lebanese Official Gazette</span> with confidence</>
                        )}
                    </h1>
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        {language === "ar"
                            ? "منصة مفتوحة تتيح للجمهور والباحثين والصحافيين الوصول الفوري إلى القوانين، المراسيم، والقرارات مع إمكانية التحقق المباشر من النسخة الأصلية."
                            : "An open civic platform for citizens, journalists, and legal researchers to find, verify, and cite Lebanese laws, decrees, and notices."}
                    </p>
                </div>

                {/* Search Box with Submit Button */}
                <div className="w-full max-w-3xl mx-auto space-y-3">
                    <div className="rounded-2xl p-1.5 bg-card border border-border shadow-md">
                        <Suspense fallback={<div className="h-14 w-full animate-pulse bg-secondary/50 rounded-xl" />}>
                            <SearchInput 
                                autoFocus={false} 
                                showSubmitButton={true}
                            />
                        </Suspense>
                    </div>

                    {/* Example Queries */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
                        <span className="text-muted-foreground font-medium">{t("searchExamples")}</span>
                        {exampleQueries.map((item) => (
                            <Link
                                key={item.query}
                                href={`/search?q=${encodeURIComponent(item.query)}`}
                                className="px-2.5 py-1 rounded-md border border-border bg-card text-foreground hover:bg-secondary hover:border-primary/40 transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Core Action Cards (Browse Alternatives) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-2">
                    <Link
                        href="/search?mode=browse"
                        className="group p-5 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-xs transition-all flex flex-col justify-between"
                    >
                        <div className="space-y-2">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                                {language === "ar" ? "تصفح أعداد الجريدة" : "Browse Gazette Archive"}
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {language === "ar"
                                    ? "استعراض الأعداد حسب السنة ورقم العدد وتاريخ النشر الرسمي."
                                    : "Explore gazette issues by publication year, issue number, and official date."}
                            </p>
                        </div>
                        <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                            <span>{language === "ar" ? "استعراض الأرشيف" : "Browse issues"}</span>
                            <ArrowIcon className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>

                    <Link
                        href="/search"
                        className="group p-5 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-xs transition-all flex flex-col justify-between"
                    >
                        <div className="space-y-2">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <Layers className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                                {language === "ar" ? "البحث المتقدم والتصفية" : "Advanced Filtering"}
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {language === "ar"
                                    ? "فرز الوثائق حسب الوزارة، نوع النص (قانون، مرسوم، قرار)، والجهات."
                                    : "Filter legal units by issuing body, instrument type, and extracted entities."}
                            </p>
                        </div>
                        <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                            <span>{language === "ar" ? "فتح فلاتر البحث" : "Open search filters"}</span>
                            <ArrowIcon className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>

                    <Link
                        href="/information"
                        className="group p-5 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-xs transition-all flex flex-col justify-between"
                    >
                        <div className="space-y-2">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <HelpCircle className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                                {language === "ar" ? "الدليل المرجعي وحقوق المواطن" : "Legal Reference & Rights"}
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {language === "ar"
                                    ? "شرح للمصطلحات القانونية اللبنانية والحقوق الدستورية المقررة."
                                    : "Clear guidance on Lebanese legal terminology and constitutional guarantees."}
                            </p>
                        </div>
                        <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                            <span>{language === "ar" ? "قراءة الدليل" : "Read explainers"}</span>
                            <ArrowIcon className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                </div>

                {/* Latest Issue Takeaways Panel */}
                <LatestIssueSummary />

                {/* Corpus Coverage & Transparency Box */}
                <div className="p-6 rounded-2xl border border-border bg-secondary/30 text-muted-foreground text-xs text-center space-y-2 max-w-3xl mx-auto">
                    <div className="flex items-center justify-center gap-2 text-foreground font-semibold text-sm">
                        <Database className="h-4 w-4 text-primary" />
                        <span>{language === "ar" ? "حالة الأرشيف والشفافية التوثيقية" : "Archive Status & Digital Provenance"}</span>
                    </div>
                    <p className="leading-relaxed">
                        {language === "ar"
                            ? "تمت معالجة وفهرسة 79 عدداً رسمياً لسنة 2025 بالكامل تشمل أكثر من 17,000 مادة قانونية. جميع الوثائق المعروضة تحتفظ برقم الصفحة والعدد الأصلي. البحث والتصفح متاحان للجميع دون الحاجة لإنشاء حساب."
                            : "Full 2025 archive digitized covering 79 verified issues and over 17,000 legal units. Every document retains original issue and page citations. Free public access without account requirements."}
                    </p>
                </div>

            </div>
        </div>
    );
}
