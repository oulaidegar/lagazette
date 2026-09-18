-- 01: Yearly Activity
SELECT 
    year,
    total_issues,
    total_pages,
    total_acts,
    decrees_count,
    laws_count,
    decisions_count,
    circulars_count,
    notices_count,
    tables_count,
    earliest_publication,
    latest_publication
FROM analytics.yearly_activity
ORDER BY year ASC;
