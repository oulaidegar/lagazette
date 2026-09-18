"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "ar" | "en" | "fr";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    dir: "rtl" | "ltr";
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    ar: {
        // Brand & Identity
        siteTitle: "الجريدة الرسمية اللبنانية",
        siteTagline: "الأرشيف الرقمي والبحث المتقدم",
        siteDisclosure: "منصة مدنية مستقلة تتيح الوصول الرقمي للجريدة الرسمية للجمهورية اللبنانية. ليست جهة رسمية.",
        
        // Navigation
        navHome: "الرئيسية",
        navSearch: "البحث والتصفية",
        navBrowse: "تصفح الأعداد",
        navExplainers: "الدليل المرجعي",
        navAnalytics: "بيانات وتحليلات",
        navLibrary: "مكتبتي",
        navPinpoint: "أرشيف الوثائق الكامل (Pinpoint)",
        
        // Actions
        searchButton: "بحث",
        searchPlaceholder: "ابحث في القوانين والمراسيم والقرارات...",
        searchExamples: "أمثلة شائعة:",
        clearAll: "مسح الكل",
        filters: "تصفية النتائج",
        applyFilters: "تطبيق التصفية",
        save: "حفظ",
        saved: "محفوظ",
        saving: "جاري الحفظ...",
        signIn: "تسجيل الدخول",
        signOut: "تسجيل الخروج",
        signUp: "إنشاء حساب",
        
        // Search & Document
        resultsFound: "نتيجة عُثر عليها",
        noResults: "لم يتم العثور على وثائق مطابقة",
        noResultsHint: "جرّب كلمات بحث بديلة، أو قم بإزالة بعض خيارات التصفية.",
        browseAll: "استعراض الأرشيف",
        exactMatch: "تطابق مرجعي مباشر",
        semanticMatch: "تطابق دلالي",
        browseMatch: "وثيقة من العدد",
        officialScan: "النسخة الرسمية الأصلية",
        viewOriginal: "عرض النسخة الأصلية (PDF)",
        copyCitation: "نسخ الاستشهاد الرسمي",
        citationCopied: "تم نسخ الاستشهاد بنجاح!",
        printDoc: "طباعة",
        reportCorrection: "إبلاغ عن تصحيح أو نقص",
        readableText: "النص المقروء",
        structuredTable: "جدول البيانات",
        aiSummary: "ملخص توضيحي",
        backToSearch: "العودة إلى نتائج البحث",
        unknownDate: "تاريخ غير موثّق / حسب سنة العدد",
        legalDisclaimer: "نص النشر الرسمي كما صدر في الجريدة الرسمية. لم يتم التحقق من التعديلات اللاحقة.",
        
        // Metadata fields
        type: "النوع",
        number: "الرقم",
        issuer: "الجهة الصادرة",
        issueNumber: "العدد",
        year: "السنة",
        page: "الصفحة",
        publicationDate: "تاريخ النشر",
        effectiveDate: "تاريخ السريان",
        
        // Footer
        footerCoverage: "تغطية الأرشيف الرقمي: 2014 - 2025",
        footerMethodology: "المنهجية ومصادر البيانات",
        footerAccessibility: "إمكانية الوصول (WCAG 2.2)",
        footerContact: "تواصل وملاحظات",
        footerRights: "جميع الحقوق للمحتوى العام محفوظة للشعب اللبناني وفق قوانين حق الوصول إلى المعلومات.",
    },
    en: {
        siteTitle: "Lebanese Official Gazette",
        siteTagline: "Digital Archive & Semantic Search",
        siteDisclosure: "An independent civic service providing digital access to publications of the Lebanese Official Gazette. Not an official government body.",
        
        navHome: "Home",
        navSearch: "Search & Filter",
        navBrowse: "Browse Archive",
        navExplainers: "Legal Reference",
        navAnalytics: "Research Analytics",
        navLibrary: "My Library",
        navPinpoint: "Full Document Archive (Pinpoint)",
        
        searchButton: "Search",
        searchPlaceholder: "Search laws, decrees, decisions...",
        searchExamples: "Suggested queries:",
        clearAll: "Clear all",
        filters: "Filters",
        applyFilters: "Apply Filters",
        save: "Save",
        saved: "Saved",
        saving: "Saving...",
        signIn: "Sign In",
        signOut: "Sign Out",
        signUp: "Sign Up",
        
        resultsFound: "results found",
        noResults: "No documents found",
        noResultsHint: "Try different keywords or relax your active filters.",
        browseAll: "Browse the Archive",
        exactMatch: "Exact Reference Match",
        semanticMatch: "Semantic Match",
        browseMatch: "Archive Listing",
        officialScan: "Official Scan",
        viewOriginal: "View Original Scan (PDF)",
        copyCitation: "Copy Citation",
        citationCopied: "Citation copied to clipboard!",
        printDoc: "Print",
        reportCorrection: "Report Correction",
        readableText: "Extracted Text",
        structuredTable: "Structured Table",
        aiSummary: "Editorial Summary",
        backToSearch: "Back to Search",
        unknownDate: "Unverified date / Year precision only",
        legalDisclaimer: "Published text as recorded in the Gazette. Current legal amendment status not verified.",
        
        type: "Type",
        number: "Number",
        issuer: "Issuer",
        issueNumber: "Issue",
        year: "Year",
        page: "Page",
        publicationDate: "Publication Date",
        effectiveDate: "Effective Date",
        
        footerCoverage: "Archive coverage: 2014 – 2025",
        footerMethodology: "Methodology & Provenance",
        footerAccessibility: "Accessibility (WCAG 2.2 AA)",
        footerContact: "Contact & Corrections",
        footerRights: "Public legal records accessible under Access to Information legislation.",
    },
    fr: {
        siteTitle: "Journal Officiel Libanais",
        siteTagline: "Archives Numériques & Recherche",
        siteDisclosure: "Service civique indépendant offrant un accès numérique aux publications du Journal Officiel Libanais. Organisme non gouvernemental.",
        
        navHome: "Accueil",
        navSearch: "Recherche & Filtres",
        navBrowse: "Consulter les Numéros",
        navExplainers: "Répertoire Juridique",
        navAnalytics: "Analyses & Données",
        navLibrary: "Ma Bibliothèque",
        navPinpoint: "Archives Intégrales (Pinpoint)",
        
        searchButton: "Rechercher",
        searchPlaceholder: "Rechercher lois, décrets, arrêtés...",
        searchExamples: "Recherches suggérées :",
        clearAll: "Effacer tout",
        filters: "Filtres",
        applyFilters: "Appliquer les filtres",
        save: "Enregistrer",
        saved: "Enregistré",
        saving: "Enregistrement...",
        signIn: "Se connecter",
        signOut: "Se déconnecter",
        signUp: "S'inscrire",
        
        resultsFound: "résultats trouvés",
        noResults: "Aucun document trouvé",
        noResultsHint: "Essayez d'autres mots-clés ou modifiez vos filtres.",
        browseAll: "Parcourir les archives",
        exactMatch: "Référence exacte",
        semanticMatch: "Correspondance sémantique",
        browseMatch: "Document du numéro",
        officialScan: "Scan Officiel",
        viewOriginal: "Voir la page originale (PDF)",
        copyCitation: "Copier la citation",
        citationCopied: "Citation copiée !",
        printDoc: "Imprimer",
        reportCorrection: "Signaler une correction",
        readableText: "Texte Numérisé",
        structuredTable: "Tableau de Données",
        aiSummary: "Résumé",
        backToSearch: "Retour à la recherche",
        unknownDate: "Date non vérifiée / Précision par année",
        legalDisclaimer: "Texte officiel publié au Journal Officiel. Les amendements ultérieurs ne sont pas vérifiés.",
        
        type: "Type",
        number: "Numéro",
        issuer: "Émetteur",
        issueNumber: "Numéro de parution",
        year: "Année",
        page: "Page",
        publicationDate: "Date de publication",
        effectiveDate: "Date d'effet",
        
        footerCoverage: "Couverture : 2014 – 2025",
        footerMethodology: "Méthodologie & Sources",
        footerAccessibility: "Accessibilité (WCAG 2.2)",
        footerContact: "Contact & Corrections",
        footerRights: "Documents juridiques publics diffusés conformément au droit d'accès à l'information.",
    }
};

const LanguageContext = createContext<LanguageContextType>({
    language: "ar",
    setLanguage: () => {},
    dir: "rtl",
    t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("ar");

    useEffect(() => {
        const savedLang = localStorage.getItem("gazette_lang") as Language;
        if (savedLang && (savedLang === "ar" || savedLang === "en" || savedLang === "fr")) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("gazette_lang", lang);
        const dir = lang === "ar" ? "rtl" : "ltr";
        document.documentElement.setAttribute("dir", dir);
        document.documentElement.setAttribute("lang", lang);
    };

    const dir = language === "ar" ? "rtl" : "ltr";

    useEffect(() => {
        document.documentElement.setAttribute("dir", dir);
        document.documentElement.setAttribute("lang", language);
    }, [dir, language]);

    const t = (key: string): string => {
        return translations[language]?.[key] || translations["en"]?.[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, dir, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
