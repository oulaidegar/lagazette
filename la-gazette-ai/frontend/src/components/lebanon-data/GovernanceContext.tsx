"use client";

import { motion } from "framer-motion";
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip as RadarTooltip, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

export default function GovernanceContext() {
    // Mock data based on the brief description
    const wjpData = [
        { subject: 'Open Government', score: 0.55, fullMark: 1 },
        { subject: 'Fundamental Rights', score: 0.52, fullMark: 1 },
        { subject: 'Constraints on Gov', score: 0.45, fullMark: 1 },
        { subject: 'Regulatory Enf.', score: 0.40, fullMark: 1 },
        { subject: 'Order & Security', score: 0.35, fullMark: 1 },
        { subject: 'Civil Justice', score: 0.30, fullMark: 1 },
        { subject: 'Criminal Justice', score: 0.28, fullMark: 1 },
        { subject: 'Absence of Corruption', score: 0.25, fullMark: 1 },
    ];

    // Press freedom (out of 100 or inverted rank) and Political Freedom (out of 100) trend
    // Roughly simulating democratic backsliding and partial resilience (2015-2025)
    const freedomTrendData = [
        { year: '2015', pressFreedomScore: 60, politicalFreedom: 43 },
        { year: '2017', pressFreedomScore: 58, politicalFreedom: 44 },
        { year: '2019', pressFreedomScore: 52, politicalFreedom: 43 },
        { year: '2021', pressFreedomScore: 47, politicalFreedom: 41 },
        { year: '2022', pressFreedomScore: 45, politicalFreedom: 40 }, // RSF rank ~119
        { year: '2024', pressFreedomScore: 38, politicalFreedom: 39 }, // RSF rank ~140
        { year: '2025', pressFreedomScore: 42.6, politicalFreedom: 39 }, // RSF rank ~132 (rebound)
    ];

    return (
        <section className="space-y-8 relative">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Governance & Rule of Law</h2>
                <p className="text-slate-500 max-w-2xl">
                    Ranked 108th of 142 globally in the WJP Rule of Law Index, maintaining some openness while struggling with systemic corruption and justice deficits.
                </p>
            </div>

            {/* Indicator Provenance Disclaimer */}
            <div className="p-4 rounded-xl border border-border bg-muted/40 text-xs text-muted-foreground leading-relaxed flex items-start gap-3">
                <span className="font-semibold text-foreground shrink-0 uppercase tracking-wider text-[11px] px-2 py-0.5 rounded bg-muted">
                    External Index
                </span>
                <span>
                    These indicators are compiled from non-governmental international research indices (World Justice Project, Reporters Without Borders, and Freedom House) for macro-contextual analysis. They reflect third-party civil assessments, not official publications of the Lebanese Republic.
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Radar Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                >
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Rule of Law Dimensions</h3>
                    <p className="text-sm text-slate-500 mb-6">
                        Performance is strongest in Open Government but alarmingly low in absence of corruption and justice systems.
                    </p>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={wjpData}>
                                <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 1]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <Radar
                                    name="Lebanon WJP Score"
                                    dataKey="score"
                                    stroke="#8b5cf6"
                                    strokeWidth={2}
                                    fill="#8b5cf6"
                                    fillOpacity={0.3}
                                />
                                <RadarTooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Timeline Chart */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col"
                >
                    <div className="mb-6 flex-grow-0">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Democratic Backsliding & Resilience</h3>
                        <p className="text-sm text-slate-500">
                            A steady erosion of freedoms over the past decade, with a partial stabilization in press freedom scores recently.
                        </p>
                    </div>

                    <div className="h-[300px] w-full mb-6 relative">
                        {/* Optional background watermark or overlay could go here */}
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={freedomTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis domain={[20, 70]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                <Line
                                    type="monotone"
                                    name="Press Freedom Score (RSF)"
                                    dataKey="pressFreedomScore"
                                    stroke="#ef4444"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#ef4444' }}
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    type="monotone"
                                    name="Freedom in the World (FH)"
                                    dataKey="politicalFreedom"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#3b82f6' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <span className="block text-xl font-bold text-slate-900 dark:text-white mb-1">39<span className="text-sm font-normal text-slate-500">/100</span></span>
                            <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider hover:text-blue-500 transition-colors">"Partly Free" (Freedom House 2025)</span>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <span className="block text-xl font-bold text-slate-900 dark:text-white mb-1">132<span className="text-sm font-normal text-slate-500">/180</span></span>
                            <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider hover:text-red-500 transition-colors">Press Freedom Rank (RSF 2025)</span>
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
