"use client";

import { useState } from "react";
import { Table, Code, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LegalTableProps {
    data: any;
    title?: string;
}

export function LegalTable({ data, title = "جدول البيانات الملحقة (Structured Table)" }: LegalTableProps) {
    const [viewRaw, setViewRaw] = useState(false);

    if (!data) return null;

    // Helper to extract rows and columns
    let headers: string[] = [];
    let rows: any[][] = [];

    if (Array.isArray(data)) {
        if (data.length > 0 && typeof data[0] === "object" && !Array.isArray(data[0])) {
            // Case 1: Array of objects [{ colA: val, colB: val }]
            headers = Object.keys(data[0]);
            rows = data.map((item) => headers.map((h) => item[h]));
        } else if (data.length > 0 && Array.isArray(data[0])) {
            // Case 2: Array of arrays [["Header A", "Header B"], ["Val 1", "Val 2"]]
            headers = data[0].map(String);
            rows = data.slice(1);
        }
    } else if (typeof data === "object") {
        if (Array.isArray(data.headers) && Array.isArray(data.rows)) {
            // Case 3: { headers: [...], rows: [[...]] }
            headers = data.headers;
            rows = data.rows;
        } else if (Array.isArray(data.columns) && Array.isArray(data.data)) {
            // Case 4: { columns: [...], data: [[...]] }
            headers = data.columns;
            rows = data.data;
        }
    }

    const hasStructuredRows = headers.length > 0 && rows.length > 0;

    return (
        <section className="mt-8 border border-border rounded-xl overflow-hidden bg-card shadow-sm" aria-labelledby="structured-table-heading">
            <div className="bg-muted/40 px-4 sm:px-6 py-3 border-b border-border flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Table className="h-4 w-4 text-primary" />
                    <h3 id="structured-table-heading" className="font-semibold text-sm sm:text-base text-foreground">
                        {title}
                    </h3>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewRaw(!viewRaw)}
                    className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                >
                    {viewRaw ? (
                        <>
                            <Eye className="h-3.5 w-3.5" />
                            <span>View Table</span>
                        </>
                    ) : (
                        <>
                            <Code className="h-3.5 w-3.5" />
                            <span>View Raw JSON</span>
                        </>
                    )}
                </Button>
            </div>

            <div className="p-4 sm:p-6">
                {viewRaw || !hasStructuredRows ? (
                    <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-xs font-mono text-foreground">
                        <pre>{typeof data === "string" ? data : JSON.stringify(data, null, 2)}</pre>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse text-right font-serif" dir="rtl">
                            <thead>
                                <tr className="border-b-2 border-border bg-muted/20">
                                    {headers.map((header, idx) => (
                                        <th
                                            key={idx}
                                            scope="col"
                                            className="px-4 py-3 text-xs font-bold text-foreground tracking-wider uppercase"
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {rows.map((row, rowIdx) => (
                                    <tr
                                        key={rowIdx}
                                        className="hover:bg-muted/30 transition-colors"
                                    >
                                        {row.map((cell, cellIdx) => (
                                            <td
                                                key={cellIdx}
                                                className="px-4 py-3 text-sm text-foreground/90 whitespace-normal leading-relaxed"
                                            >
                                                {cell !== null && cell !== undefined
                                                    ? typeof cell === "object"
                                                        ? JSON.stringify(cell)
                                                        : String(cell)
                                                    : "—"}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
}
