"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

import { AuthProvider } from "@/components/auth/auth-provider";
import { LanguageProvider } from "@/components/layout/language-context";

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return (
        <AuthProvider>
            <LanguageProvider>
                <NextThemesProvider {...props}>{children}</NextThemesProvider>
            </LanguageProvider>
        </AuthProvider>
    );
}
