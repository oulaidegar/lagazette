-- 06: Geographic Activity
SELECT 
    region,
    domain,
    year,
    act_count
FROM analytics.geo_activity
ORDER BY act_count DESC;
