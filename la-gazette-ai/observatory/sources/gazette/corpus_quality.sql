-- 08: Corpus Quality & Transparency
SELECT 
    issues_indexed,
    total_pages_scanned,
    total_units,
    unclassified_count,
    unclassified_percentage,
    searchable_coverage_percentage,
    estimated_ocr_confidence,
    estimated_missing_issues_count,
    missing_title_count
FROM analytics.corpus_quality;
