import { api, LegalUnitDetail } from "@/lib/api";
import { DocumentViewer } from "@/components/document/document-viewer";
import { BackButton } from "@/components/document/back-button";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentPageProps {
    params: Promise<{ id: string }>;
}

export default async function DocumentPage(props: DocumentPageProps) {
    const params = await props.params;
    let document: LegalUnitDetail | null = null;
    let fetchError: string | null = null;

    try {
        document = await api.getLegalUnit(params.id);
    } catch (error: any) {
        if (error?.status === 404 || error?.message?.includes("404") || error?.message?.includes("not found")) {
            notFound();
        } else {
            fetchError = "Unable to connect to the legal database. Please check your network or try again.";
        }
    }

    if (fetchError || !document) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-4 p-8 border border-border bg-card rounded-2xl shadow-sm">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                    <h1 className="text-xl font-bold text-foreground">Failed to Load Document</h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {fetchError || "The requested publication could not be retrieved at this moment."}
                    </p>
                    <div className="flex justify-center gap-3 pt-4">
                        <Link href="/search">
                            <Button variant="outline">Browse Archive</Button>
                        </Link>
                        <Link href={`/legal-units/${params.id}`}>
                            <Button>Retry</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Context Navigation Bar */}
            <div className="border-b border-border bg-muted/20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
                    <BackButton />

                    {/* Quick citation reference */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                        <FileText className="h-3.5 w-3.5" />
                        <span>Issue {document.source.issue_number} ({document.source.year})</span>
                    </div>
                </div>
            </div>

            {/* Document Reader Container */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <DocumentViewer document={document} />
            </main>
        </div>
    );
}
