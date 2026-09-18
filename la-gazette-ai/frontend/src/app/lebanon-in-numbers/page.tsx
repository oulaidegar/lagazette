import { Metadata } from 'next';
import {
    ExecutiveOverview,
    GovernanceContext,
    DigitalSociety,
    LegalFramework,
    RightsAndEquality,
    EnvironmentClimate,
    SocialProtection
} from '@/components/lebanon-data/index';

export const metadata: Metadata = {
    title: 'Lebanon in Numbers | La Gazette',
    description: 'A comprehensive, interactive data visualization exploring Lebanon\'s demographics, economy, digital society, legal framework, and environment.',
};

export default function LebanonInNumbersPage() {
    return (
        <main className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
            {/* Context Header Bar */}
            <div className="sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/80 bg-background/80 border-border flex h-14 items-center justify-between px-4 sm:px-6">
                <a href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                    &larr; <span>Back to Home</span>
                </a>
                <a href="/search" className="text-xs sm:text-sm font-medium text-primary hover:underline">
                    Search Gazette Archive &rarr;
                </a>
            </div>

            {/* Background elements */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-purple-100/30 dark:bg-purple-900/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 container mx-auto px-6 py-16 sm:py-24 space-y-24 max-w-6xl">
                {/* Hero Section */}
                <header className="text-center space-y-6 max-w-3xl mx-auto">
                    <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Lebanon in <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-400">Numbers</span>
                    </h1>
                    <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                        Foundations for a digital, rights-based, and ecological future.
                    </p>
                    <p className="text-md text-slate-500 dark:text-slate-500 max-w-2xl mx-auto mt-4">
                        Lebanon combines high levels of human development and digital connectivity with a severe economic crisis, fragile rule of law, and patchy rights protections. Explore the data below.
                    </p>
                </header>

                <div className="space-y-32">
                    <ExecutiveOverview />
                    <GovernanceContext />
                    <DigitalSociety />
                    <LegalFramework />
                    <RightsAndEquality />
                    <EnvironmentClimate />
                    <SocialProtection />
                </div>

                {/* Footer Notes */}
                <footer className="pt-16 pb-8 border-t border-slate-200 dark:border-slate-800 mt-24 text-center text-sm text-slate-500">
                    <p>Data compiled from various sources including World Bank, UNDP, Yale EPI, and civil society reports (2023-2025).</p>
                </footer>
            </div>
        </main>
    );
}
