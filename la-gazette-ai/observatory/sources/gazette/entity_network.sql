-- 04: State Entity Network
SELECT 
    source_name,
    source_type,
    target_name,
    target_type,
    co_occurrence_count,
    edge_type
FROM analytics.entity_network
WHERE co_occurrence_count >= 1
ORDER BY co_occurrence_count DESC;
