"use client";

import Link from "next/link";
import { BookOpen, ShieldCheck, HelpCircle, Mail, ExternalLink } from "lucide-react";
import { useLanguage } from "@/components/layout/language-context";

export function SiteFooter() {
    const { t, language } = useLanguage();

    return (
        <footer className="w-full border-t border-border bg-card text-muted-foreground text-sm mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand & Disclosure */}
                    <div className="md:col-span-2 space-y-3">
                        <div className="flex items-center gap-2 text-foreground font-bold text-base">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <span>{t("siteTitle")}</span>
                        </div>
                        <p className="text-xs leading-relaxed max-w-md">
                            {t("siteDisclosure")}
                        </p>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-xs text-foreground font-medium border border-border">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{t("footerCoverage")}</span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">
                            {language === "ar" ? "روابط سريعة" : "Quick Links"}
                        </h4>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <Link href="/search" className="hover:text-foreground transition-colors">
                                    {t("navSearch")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/search?mode=browse" className="hover:text-foreground transition-colors">
                                    {t("navBrowse")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/information" className="hover:text-foreground transition-colors">
                                    {t("navExplainers")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/analytics" className="hover:text-foreground transition-colors">
                                    {t("navAnalytics")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Governance, Accessibility & Corrections */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">
                            {language === "ar" ? "الشفافية والمعايير" : "Transparency & Standards"}
                        </h4>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <Link href="/information" className="hover:text-foreground transition-colors">
                                    {t("footerMethodology")}
                                </Link>
                            </li>
                            <li>
                                <span className="inline-flex items-center gap-1">
                                    <span>{t("footerAccessibility")}</span>
                                </span>
                            </li>
                            <li>
                                <a 
                                    href="mailto:contact@lagazette.lb?subject=Gazette%20Correction%20Request"
                                    className="hover:text-foreground transition-colors flex items-center gap-1"
                                >
                                    <Mail className="h-3 w-3" />
                                    <span>{t("footerContact")}</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                    <p>{t("footerRights")}</p>
                    <p className="text-muted-foreground/80">
                        {language === "ar" ? "بُني لخدمة المواطن والباحث والصحافي" : "Built for citizens, researchers, and journalists."}
                    </p>
                </div>
            </div>
        </footer>
    );
}
