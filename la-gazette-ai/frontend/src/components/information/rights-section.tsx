"use client";

import { motion } from "framer-motion";
import { Shield, BookOpen, Scale, Users, FileCheck, Vote, Home, Briefcase, HeartPulse } from "lucide-react";

interface Right {
    id: string;
    title: string;
    description: string;
    source: string;
    sourceUrl?: string;
    icon: any;
}

interface Category {
    id: string;
    title: string;
    description: string;
    rights: Right[];
}

const categories: Category[] = [
    {
        id: "civil",
        title: "Civil Liberties",
        description: "Fundamental freedoms guaranteed to every individual.",
        rights: [
            {
                id: "equality",
                title: "Equality Before the Law",
                description: "All Lebanese are equal before the law. They enjoy civil and political rights and bear public obligations without distinction.",
                source: "Art. 7",
                icon: Scale
            },
            {
                id: "liberty",
                title: "Personal Liberty",
                description: "No one may be arrested, imprisoned, or kept in custody except according to the provisions of the law.",
                source: "Art. 8",
                icon: Shield
            },
            {
                id: "expression",
                title: "Freedom of Expression",
                description: "Freedom of speech, writing, and press is guaranteed within the limits established by law.",
                source: "Art. 13",
                icon: Users
            }
        ]
    },
    {
        id: "political",
        title: "Political Rights",
        description: "Rights related to participation in governance.",
        rights: [
            {
                id: "representation",
                title: "Parliamentary Representation",
                description: "The Chamber of Deputies is elected by the people. Every citizen has the right to vote and run for office.",
                source: "Art. 24",
                icon: Vote
            },
            {
                id: "assembly",
                title: "Freedom of Assembly",
                description: "Citizens have the right to gather peacefully without arms.",
                source: "Art. 13",
                icon: Users
            }
        ]
    },
    {
        id: "social",
        title: "Socio-Economic Rights",
        description: "Rights ensuring well-being and property.",
        rights: [
            {
                id: "property",
                title: "Private Property",
                description: "Property is protected by law. No one may be deprived of it except for public utility and with fair compensation.",
                source: "Art. 15",
                icon: Home
            },
            {
                id: "education",
                title: "Freedom of Education (حرية التعليم)",
                description: "Education is free (unrestricted) provided it does not violate public order or morals and respects all religious confessions. This constitutional protection guarantees freedom of teaching and school establishment rather than cost-free instruction.",
                source: "Art. 10 (Lebanese Constitution)",
                sourceUrl: "https://lp.gov.lb/ContentRecordDetails?Id=13684",
                icon: BookOpen
            }
        ]
    }
];

export function RightsSection() {
    return (
        <div className="space-y-12">
            {categories.map((category) => (
                <div key={category.id} className="space-y-6">
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{category.title}</h3>
                        <p className="text-slate-500 dark:text-slate-400">{category.description}</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {category.rights.map((right: any) => (
                            <div
                                key={right.id}
                                className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="rounded-md bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                        <right.icon className="h-5 w-5" />
                                    </div>
                                    {right.sourceUrl ? (
                                        <a
                                            href={right.sourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded hover:underline inline-flex items-center gap-1"
                                            title="View source at Lebanese Parliament"
                                        >
                                            <span>{right.source}</span>
                                            <span>↗</span>
                                        </a>
                                    ) : (
                                        <span className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                                            {right.source}
                                        </span>
                                    )}
                                </div>

                                <h4 className="font-bold text-slate-900 dark:text-white mb-2">{right.title}</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 flex-grow">
                                    {right.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
