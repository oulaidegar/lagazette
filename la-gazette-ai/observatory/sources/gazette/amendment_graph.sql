-- 05: Legislative Genealogy
SELECT 
    relationship_id,
    relationship_type,
    description,
    source_unit_id,
    source_type,
    source_number,
    source_title,
    source_year,
    target_unit_id,
    target_type,
    target_number,
    target_title,
    target_year
FROM analytics.amendment_graph;
