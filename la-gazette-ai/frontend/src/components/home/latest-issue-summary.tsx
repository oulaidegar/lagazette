"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ChevronDown, ChevronUp, FileText, ExternalLink, ShieldAlert, ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/components/layout/language-context";
import { Button } from "@/components/ui/button";

export function LatestIssueSummary() {
    const [isExpanded, setIsExpanded] = useState(false);
    const { language, dir } = useLanguage();
    const issueNumber = 9236;
    const issueYear = 2025;

    const takeaways = [
        {
            title: language === "ar" ? "اعتمادات أمنية وإدارية" : "Security & Administrative Reallocations",
            desc: language === "ar" 
                ? "تعديلات موازنة لصالح المديرية العامة لأمن الدولة لتأمين النفقات التشغيلية الطارئة." 
                : "Budget reallocations for the State Security Directorate under the Council of Ministers.",
            query: "أمن الدولة",
            type: "decree"
        },
        {
            title: language === "ar" ? "مشاريع مجلس الإنماء والإعمار" : "Council for Development & Reconstruction (CDR)",
            desc: language === "ar"
                ? "تحويل اعتمادات مالية لاستكمال مبانٍ ومشاريع حكومية في منطقة شحيم وإقليم الخروب."
                : "Fund transfers to complete government buildings and public works in the Chhim region.",
            query: "شحيم مجلس الانماء والاعمار",
            type: "decree"
        },
        {
            title: language === "ar" ? "إجراءات وزارة المالية" : "Ministry of Finance Directives",
            desc: language === "ar"
                ? "قرارات تنظيمية تتعلق بدقائق تطبيق القوانين الضريبية وإجراءات التحصيل المالي."
                : "Operational directives to streamline fiscal administration and revenue management.",
            query: "وزارة المالية",
            issuer: "وزارة المالية"
        },
        {
            title: language === "ar" ? "بدلات الاشتراك والإعلانات" : "Annual Subscription Fees & Notices",
            desc: language === "ar"
                ? "تحديد أسعار الاشتراكات السنوية للجريدة الرسمية للعام 2025 وشروط قبول الإعلانات الرسمية."
                : "Official publication subscription rates and publication notice guidelines for 2025.",
            query: "الاشتراك السنوي الجريدة الرسمية",
            type: "notice"
        }
    ];

    const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

    return (
        <section className="w-full max-w-4xl mx-auto mt-6" aria-labelledby="latest-issue-heading">
            <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden transition-all">
                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-border bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                                <Sparkles className="h-3 w-3" />
                                <span>{language === "ar" ? "أحدث عدد مفهرس" : "Latest Digitized Issue"}</span>
                            </span>
                            <span className="text-xs font-mono text-muted-foreground">
                                {language === "ar" ? `العدد ${issueNumber} • سنة ${issueYear}` : `Issue ${issueNumber} • ${issueYear}`}
                            </span>
                        </div>
                        <h3 id="latest-issue-heading" className="text-lg sm:text-xl font-bold text-foreground">
                            {language === "ar" 
                                ? "أبرز مقررات ختام سنة 2025: تسويات الموازنة ومشاريع الإنماء" 
                                : "Closing 2025: Budget Adjustments & Regional Infrastructure"}
                        </h3>
                    </div>

                    <Link href={`/search?year=${issueYear}&issue_number=${issueNumber}`}>
                        <Button variant="outline" size="sm" className="gap-2 font-medium shrink-0">
                            <span>{language === "ar" ? "تصفح كل محتويات العدد (54 مادة)" : "Browse All 54 Units in Issue"}</span>
                            <ArrowIcon className="h-3.5 w-3.5" />
                        </Button>
                    </Link>
                </div>

                {/* Always-visible Verification Disclaimer */}
                <div className="px-5 sm:px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <p className="leading-normal">
                        {language === "ar"
                            ? "تنبيه توثيقي: هذا الملخص مستخرج آلياً لأغراض التيسير. يُرجى مراجعة نصوص الوثائق الأصلية المنشورة أدناه قبل الاستناد القانوني."
                            : "Editorial Note: This summary is generated from digitized publication titles. Always verify with the cited source documents below."}
                    </p>
                </div>

                {/* Takeaways Grid */}
                <div className="p-5 sm:p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {takeaways.map((item, idx) => (
                            <div 
                                key={idx} 
                                className="p-4 rounded-xl border border-border bg-background hover:border-primary/40 transition-colors flex flex-col justify-between"
                            >
                                <div className="space-y-1.5 mb-3">
                                    <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        <span>{item.title}</span>
                                    </h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                                <Link 
                                    href={`/search?year=${issueYear}&issue_number=${issueNumber}&q=${encodeURIComponent(item.query)}`}
                                    className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 mt-auto pt-2 border-t border-border/50"
                                >
                                    <span>{language === "ar" ? "عرض الوثائق المؤيدة في العدد" : "View supporting publications in issue"}</span>
                                    <ArrowIcon className="h-3 w-3" />
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Expandable Overview Context */}
                    <div className="pt-2">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-full text-center py-2 text-xs font-medium text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors"
                        >
                            <span>
                                {isExpanded 
                                    ? (language === "ar" ? "طي الشرح الإضافي" : "Collapse context")
                                    : (language === "ar" ? "قراءة التقييم التشريعي الكامل للعدد" : "Read complete issue legislative context")}
                            </span>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>

                        {isExpanded && (
                            <div className="mt-3 p-4 rounded-xl bg-secondary/50 text-xs text-muted-foreground leading-relaxed space-y-2 border border-border">
                                <p>
                                    {language === "ar"
                                        ? "يعكس العدد 9236 نهجاً إدارياً لتسوية قيود السنة المالية 2025، حيث تركزت أكثر من 60% من المراسيم على نقل اعتمادات الموازنة وتغذية بنود المحروقات وتسيير المصالح الحكومية الأساسية، مع غياب القوانين التشريعية الكبرى الصادرة عن البرلمان في هذا العدد تحديداً."
                                        : "Issue 9236 reflects year-end administrative housekeeping to balance 2025 fiscal accounts. Over 60% of decrees focus on budgetary transfers, fuel allocations, and essential departmental continuations, with routine administrative notifications dominating the remainder."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
