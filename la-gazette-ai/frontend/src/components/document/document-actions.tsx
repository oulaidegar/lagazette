"use client";

import { useState } from "react";
import { Copy, Check, Printer, Share2, ExternalLink, Bookmark, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/library/bookmark-button";
import { LegalUnitDetail } from "@/lib/api";

interface DocumentActionsProps {
    document: LegalUnitDetail;
}

export function DocumentActions({ document }: DocumentActionsProps) {
    const [copied, setCopied] = useState(false);
    const [citationStyle, setCitationStyle] = useState<"ar" | "en">("ar");

    const getFormattedCitation = () => {
        const type = document.type || "وثيقة رسمية";
        const unitNo = document.unit_number ? `رقم ${document.unit_number}` : "";
        const issueNo = document.source.issue_number ? `العدد ${document.source.issue_number}` : "";
        const year = document.source.year ? `سنة ${document.source.year}` : "";
        const page = document.source.page_number ? `ص. ${document.source.page_number}` : "";

        let dateStr = "";
        if (document.source.publication_date) {
            dateStr = `بتاريخ ${document.source.publication_date}`;
        }

        if (citationStyle === "ar") {
            return `الجمهورية اللبنانية، الجريدة الرسمية، ${issueNo}، ${dateStr || year}، ${type} ${unitNo}، ${page}`.replace(/,\s*,/g, ',').trim();
        } else {
            const enType = document.type || "Official Document";
            const enUnit = document.unit_number ? `No. ${document.unit_number}` : "";
            const enIssue = `Issue ${document.source.issue_number} (${document.source.year})`;
            const enPage = document.source.page_number ? `p. ${document.source.page_number}` : "";
            return `Lebanese Official Gazette, ${enIssue}, ${enType} ${enUnit}, ${enPage}`.replace(/,\s*,/g, ',').trim();
        }
    };

    const handleCopyCitation = async () => {
        try {
            const citation = getFormattedCitation();
            await navigator.clipboard.writeText(citation);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch (e) {
            console.error("Failed to copy citation:", e);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-4 bg-muted/30 border border-border rounded-xl">
            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCitation}
                    className="h-8 gap-1.5 text-xs font-medium"
                    aria-label="Copy official legal citation"
                >
                    {copied ? (
                        <>
                            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Citation Copied</span>
                        </>
                    ) : (
                        <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy Citation (نسخ المرجع)</span>
                        </>
                    )}
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrint}
                    className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground hidden sm:flex"
                    aria-label="Print document"
                >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print</span>
                </Button>
            </div>

            {/* Save / Bookmark Button */}
            <div className="flex items-center gap-2">
                <BookmarkButton legalUnitId={document.id} size="sm" variant="outline" showText={true} />
            </div>
        </div>
    );
}
