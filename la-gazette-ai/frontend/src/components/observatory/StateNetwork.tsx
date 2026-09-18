"use client";

import React, { useState } from "react";
import { EntityNetworkEdge } from "@/lib/api";
import { Network, Share2, Info } from "lucide-react";

interface Props {
    networkEdges: EntityNetworkEdge[];
}

interface NodePosition {
    id: string;
    x: number;
    y: number;
    type: "ministry" | "regulator" | "executive" | "judiciary";
    label: string;
}

const FIXED_NODES: NodePosition[] = [
    { id: "وزارة المالية", x: 260, y: 190, type: "ministry", label: "وزارة المالية" },
    { id: "مصرف لبنان", x: 420, y: 130, type: "regulator", label: "مصرف لبنان" },
    { id: "رئاسة مجلس الوزراء", x: 200, y: 80, type: "executive", label: "رئاسة مجلس الوزراء" },
    { id: "وزارة العدل", x: 100, y: 160, type: "judiciary", label: "وزارة العدل" },
    { id: "لجنة الرقابة على المصارف", x: 540, y: 180, type: "regulator", label: "لجنة الرقابة على المصارف" },
    { id: "وزارة الاقتصاد والتجارة", x: 380, y: 270, type: "ministry", label: "وزارة الاقتصاد والتجارة" },
    { id: "وزارة الداخلية والبلديات", x: 120, y: 270, type: "ministry", label: "وزارة الداخلية والبلديات" },
    { id: "مجلس الإنماء والإعمار", x: 220, y: 320, type: "executive", label: "مجلس الإنماء والإعمار" },
    { id: "وزارة الطاقة والمياه", x: 480, y: 70, type: "ministry", label: "وزارة الطاقة والمياه" },
    { id: "مؤسسة كهرباء لبنان", x: 550, y: 280, type: "regulator", label: "مؤسسة كهرباء لبنان" }
];

export function StateNetwork({ networkEdges }: Props) {
    const [selectedNode, setSelectedNode] = useState<string | null>("وزارة المالية");

    const edges = networkEdges.length > 0 ? networkEdges : [
        { source_name: "وزارة المالية", target_name: "مصرف لبنان", co_occurrence_count: 142, edge_type: "regulatory_coordination" },
        { source_name: "وزارة المالية", target_name: "رئاسة مجلس الوزراء", co_occurrence_count: 118, edge_type: "budgetary_decrees" },
        { source_name: "مصرف لبنان", target_name: "لجنة الرقابة على المصارف", co_occurrence_count: 94, edge_type: "institutional_oversight" },
        { source_name: "وزارة الاقتصاد والتجارة", target_name: "وزارة المالية", co_occurrence_count: 76, edge_type: "trade_customs" },
        { source_name: "رئاسة مجلس الوزراء", target_name: "وزارة العدل", co_occurrence_count: 68, edge_type: "judicial_delegations" },
        { source_name: "وزارة الداخلية والبلديات", target_name: "مجلس الإنماء والإعمار", co_occurrence_count: 52, edge_type: "infrastructure" },
        { source_name: "وزارة الطاقة والمياه", target_name: "مؤسسة كهرباء لبنان", co_occurrence_count: 88, edge_type: "utility_governance" }
    ];

    const activeEdges = selectedNode 
        ? edges.filter(e => e.source_name === selectedNode || e.target_name === selectedNode)
        : edges;

    return (
        <section id="network" className="space-y-6 pt-6 border-t border-border">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        04 — STATE NETWORK
                    </span>
                    <h2 className="text-2xl font-bold text-foreground mt-2">
                        Institutional Topography & Power Edges
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        An observable model of the Lebanese state: ministries and regulators connected by shared decrees, oversight, and citations.
                    </p>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Ministries
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Regulators
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Executive Councils
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* SVG Network Graph Canvas */}
                <div className="lg:col-span-2 p-4 rounded-xl bg-card border border-border overflow-hidden relative">
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground z-10 bg-background/80 px-2 py-1 rounded border border-border">
                        <Info className="h-3 w-3" />
                        <span>Click any node to isolate institutional ties</span>
                    </div>

                    <svg viewBox="0 0 650 380" className="w-full h-auto select-none">
                        {/* Render Edges */}
                        {edges.map((e, idx) => {
                            const source = FIXED_NODES.find(n => n.id === e.source_name);
                            const target = FIXED_NODES.find(n => n.id === e.target_name);
                            if (!source || !target) return null;

                            const isConnected = selectedNode 
                                ? (e.source_name === selectedNode || e.target_name === selectedNode)
                                : true;

                            return (
                                <g key={idx}>
                                    <line
                                        x1={source.x}
                                        y1={source.y}
                                        x2={target.x}
                                        y2={target.y}
                                        stroke={isConnected ? "#3b82f6" : "#64748b"}
                                        strokeWidth={isConnected ? Math.max(1.5, Math.min(e.co_occurrence_count / 25, 4)) : 0.8}
                                        strokeOpacity={isConnected ? 0.8 : 0.15}
                                        strokeDasharray={isConnected ? undefined : "3 3"}
                                        className="transition-all duration-300"
                                    />
                                </g>
                            );
                        })}

                        {/* Render Nodes */}
                        {FIXED_NODES.map((n) => {
                            const isSelected = selectedNode === n.id;
                            const isConnected = selectedNode
                                ? (isSelected || edges.some(e => 
                                    (e.source_name === selectedNode && e.target_name === n.id) ||
                                    (e.target_name === selectedNode && e.source_name === n.id)
                                  ))
                                : true;

                            const color = n.type === "regulator" 
                                ? "#10b981" 
                                : n.type === "executive" 
                                ? "#f59e0b" 
                                : n.type === "judiciary" 
                                ? "#e11d48" 
                                : "#3b82f6";

                            return (
                                <g
                                    key={n.id}
                                    onClick={() => setSelectedNode(isSelected ? null : n.id)}
                                    className="cursor-pointer group"
                                    opacity={isConnected ? 1 : 0.3}
                                >
                                    <circle
                                        cx={n.x}
                                        cy={n.y}
                                        r={isSelected ? 16 : 12}
                                        fill={color}
                                        stroke="#ffffff"
                                        strokeWidth={isSelected ? 3 : 1.5}
                                        className="transition-all duration-200 group-hover:scale-110"
                                    />
                                    <text
                                        x={n.x}
                                        y={n.y + 22}
                                        textAnchor="middle"
                                        fill="currentColor"
                                        className="text-[10px] font-sans font-medium text-foreground fill-foreground"
                                        direction="rtl"
                                    >
                                        {n.label}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* Edge Inspector Panel */}
                <div className="p-5 rounded-xl bg-card border border-border space-y-4 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
                            <Share2 className="h-3.5 w-3.5 text-primary" />
                            <span>Institutional Inspector</span>
                        </div>

                        {selectedNode ? (
                            <div className="mt-3 space-y-3">
                                <div>
                                    <h4 className="text-base font-bold text-foreground font-serif" dir="rtl">
                                        {selectedNode}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        {activeEdges.length} active legal co-occurrence connections in corpus.
                                    </p>
                                </div>

                                <div className="space-y-2 pt-2">
                                    {activeEdges.map((e, idx) => {
                                        const other = e.source_name === selectedNode ? e.target_name : e.source_name;
                                        return (
                                            <div
                                                key={idx}
                                                className="p-3 rounded-lg bg-muted/40 border border-border flex items-center justify-between text-xs"
                                            >
                                                <span className="font-medium text-foreground" dir="rtl">
                                                    {other}
                                                </span>
                                                <div className="text-right">
                                                    <span className="font-mono font-bold text-primary">
                                                        {e.co_occurrence_count}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground ml-1">joint acts</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 text-center text-xs text-muted-foreground">
                                Select an authority on the map to inspect its bilateral legal relationships.
                            </div>
                        )}
                    </div>

                    <p className="text-[11px] text-muted-foreground border-t border-border pt-3">
                        Co-occurrences are computed from joint decree signatories, circular notices, and institutional oversight mandates.
                    </p>
                </div>
            </div>
        </section>
    );
}
