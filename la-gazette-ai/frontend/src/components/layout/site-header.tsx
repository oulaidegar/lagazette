"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Search, BookOpen, Bookmark, BarChart3, HelpCircle, Menu, X, Globe, User, LogOut, ExternalLink } from "lucide-react";
import { useLanguage, Language } from "@/components/layout/language-context";
import { useAuth } from "@/components/auth/auth-provider";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
    const pathname = usePathname();
    const { language, setLanguage, dir, t } = useLanguage();
    const { user, signOut } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [langMenuOpen, setLangMenuOpen] = useState(false);

    const navLinks = [
        { href: "/search", label: t("navSearch"), icon: Search },
        { href: "/search?mode=browse", label: t("navBrowse"), icon: BookOpen },
        { href: "/information", label: t("navExplainers"), icon: HelpCircle },
        { href: "/analytics", label: t("navAnalytics"), icon: BarChart3 },
        { href: "/library", label: t("navLibrary"), icon: Bookmark, authRequired: true },
    ];

    const langNames: Record<Language, string> = {
        ar: "العربية",
        en: "English",
        fr: "Français",
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-card/90 backdrop-blur-md shadow-xs transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                {/* Brand / Logo */}
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg text-foreground focus-visible:ring-2 rounded-md">
                        <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-xs">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="leading-tight font-extrabold tracking-tight">
                                {language === "ar" ? "الجريدة الرسمية" : "La Gazette"}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-normal tracking-wide uppercase">
                                {language === "ar" ? "أرشيف رقمي مدني" : "Civic Digital Archive"}
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Desktop Navigation Links */}
                <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
                    {navLinks.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href.split("?")[0]));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:ring-2 ${
                                    isActive
                                        ? "bg-secondary text-primary font-semibold dark:text-primary-foreground"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                                }`}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right controls: Language, Theme, Auth */}
                <div className="flex items-center gap-2">
                    {/* Language Switcher Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setLangMenuOpen(!langMenuOpen)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border border-border bg-card text-foreground hover:bg-secondary transition-colors focus-visible:ring-2"
                            aria-label="Select Language"
                            aria-expanded={langMenuOpen}
                        >
                            <Globe className="h-3.5 w-3.5" />
                            <span>{langNames[language]}</span>
                        </button>

                        {langMenuOpen && (
                            <div className={`absolute ${dir === "rtl" ? "left-0" : "right-0"} mt-2 w-32 rounded-lg border border-border bg-card shadow-lg py-1 z-50`}>
                                {(["ar", "en", "fr"] as Language[]).map((l) => (
                                    <button
                                        key={l}
                                        onClick={() => {
                                            setLanguage(l);
                                            setLangMenuOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-secondary transition-colors ${
                                            language === l ? "font-bold text-primary" : "text-foreground"
                                        }`}
                                    >
                                        <span>{langNames[l]}</span>
                                        {language === l && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Dark/Light mode toggle */}
                    <ModeToggle />

                    {/* User Auth state */}
                    {user ? (
                        <div className="hidden sm:flex items-center gap-2">
                            <Link href="/library">
                                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                                    <Bookmark className="h-3.5 w-3.5" />
                                    <span>{t("navLibrary")}</span>
                                </Button>
                            </Link>
                            <button
                                onClick={() => signOut()}
                                title={t("signOut")}
                                aria-label={t("signOut")}
                                className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors focus-visible:ring-2"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="hidden sm:block">
                            <Button size="sm" variant="default" className="text-xs">
                                {t("signIn")}
                            </Button>
                        </Link>
                    )}

                    {/* Mobile Hamburger Button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 rounded-lg text-foreground hover:bg-secondary transition-colors focus-visible:ring-2"
                        aria-label={mobileOpen ? "Close Menu" : "Open Menu"}
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-border bg-card px-4 pt-3 pb-6 space-y-3 shadow-xl">
                    <nav className="space-y-1">
                        {navLinks.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    pathname === item.href
                                        ? "bg-secondary text-primary font-bold"
                                        : "text-foreground hover:bg-secondary"
                                }`}
                            >
                                <item.icon className="h-5 w-5 text-muted-foreground" />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="pt-4 border-t border-border flex flex-col gap-2">
                        {user ? (
                            <div className="flex items-center justify-between px-3 py-2 bg-secondary/50 rounded-lg">
                                <div className="text-xs">
                                    <p className="font-semibold text-foreground">{user.email}</p>
                                    <p className="text-muted-foreground">{t("navLibrary")}</p>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => signOut()}>
                                    {t("signOut")}
                                </Button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                                    <Button className="w-full" size="sm">
                                        {t("signIn")}
                                    </Button>
                                </Link>
                                <Link href="/signup" className="flex-1" onClick={() => setMobileOpen(false)}>
                                    <Button variant="outline" className="w-full" size="sm">
                                        {t("signUp")}
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
