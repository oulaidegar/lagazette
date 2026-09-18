import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "./providers";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
    title: "La Gazette — The Digital Archive of the Lebanese Official Gazette",
    description: "Independent civic archive and advanced search engine for the Lebanese Official Gazette (الجريدة الرسمية اللبنانية).",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ar" dir="rtl" suppressHydrationWarning>
            <body
                className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-primary/20 selection:text-primary"
                suppressHydrationWarning
            >
                <a href="#main-content" className="skip-to-content">
                    تخطي إلى المحتوى الرئيسي / Skip to main content
                </a>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <SiteHeader />
                    <main id="main-content" className="flex-1 w-full flex flex-col">
                        {children}
                    </main>
                    <SiteFooter />
                </ThemeProvider>
            </body>
        </html>
    );
}
