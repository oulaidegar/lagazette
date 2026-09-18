"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/layout/language-context";
import { Button } from "@/components/ui/button";

interface SearchInputProps {
    className?: string;
    placeholder?: string;
    autoFocus?: boolean;
    basePath?: string;
    showSubmitButton?: boolean;
    onSearch?: (query: string) => void;
}

export function SearchInput({ 
    className, 
    placeholder, 
    autoFocus = false, 
    basePath = "/search",
    showSubmitButton = true,
    onSearch
}: SearchInputProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlQuery = searchParams.get("q") || "";
    const { t, dir } = useLanguage();

    const [query, setQuery] = useState(urlQuery);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync input state whenever URL query changes (e.g. Back/Forward button)
    useEffect(() => {
        setQuery(urlQuery);
    }, [urlQuery]);

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (onSearch) {
            onSearch(trimmed);
            return;
        }
        if (trimmed) {
            router.push(`${basePath}?q=${encodeURIComponent(trimmed)}`);
        } else {
            router.push(basePath);
        }
    };

    const clearSearch = () => {
        setQuery("");
        inputRef.current?.focus();
        if (onSearch) {
            onSearch("");
        } else if (urlQuery) {
            router.push(basePath);
        }
    };

    const resolvedPlaceholder = placeholder || t("searchPlaceholder");

    return (
        <form onSubmit={handleSearch} className={cn("w-full relative group", className)} role="search">
            <label htmlFor="gazette-search-input" className="sr-only">
                {t("searchPlaceholder")}
            </label>
            <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors ${
                        dir === "rtl" ? "right-4" : "left-4"
                    }`} />

                    <input
                        id="gazette-search-input"
                        ref={inputRef}
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className={cn(
                            "w-full h-13 rounded-xl border border-input bg-card text-foreground",
                            "shadow-xs hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all",
                            "text-base placeholder:text-muted-foreground focus:outline-none",
                            dir === "rtl" ? "pr-12 pl-10 text-right" : "pl-12 pr-10 text-left"
                        )}
                        placeholder={resolvedPlaceholder}
                    />

                    {query && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className={`absolute top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors ${
                                dir === "rtl" ? "left-3" : "right-3"
                            }`}
                            aria-label="Clear search input"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {showSubmitButton && (
                    <Button 
                        type="submit" 
                        size="lg" 
                        className="h-13 px-6 rounded-xl font-semibold gap-2 shadow-xs shrink-0"
                    >
                        <Search className="h-4 w-4" />
                        <span>{t("searchButton")}</span>
                    </Button>
                )}
            </div>
        </form>
    );
}
