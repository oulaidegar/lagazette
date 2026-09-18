-- 02: Ministry Activity
SELECT 
    issuer,
    year,
    total_acts,
    decrees,
    laws,
    decisions,
    appointments,
    circulars
FROM analytics.ministry_activity
ORDER BY year DESC, total_acts DESC;
