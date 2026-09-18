-- 07: People & Power
SELECT 
    person_name,
    first_appearance_year,
    last_appearance_year,
    total_mentions,
    linked_institutions_count
FROM analytics.people_power
ORDER BY total_mentions DESC;
