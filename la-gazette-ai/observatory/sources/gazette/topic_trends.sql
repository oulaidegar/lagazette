-- 03: Topic Trends
SELECT 
    topic,
    year,
    frequency,
    involved_institutions_count
FROM analytics.topic_trends
ORDER BY topic, year ASC;
