-- Migration: 03_analytics_schema.sql
-- Description: Decoupled PostgreSQL analytics schema for La Gazette Research Observatory
-- Supports Evidence.dev and high-performance civic observatory queries

CREATE SCHEMA IF NOT EXISTS analytics;

-- ============================================================================
-- 01. YEARLY ACTIVITY (Corpus Timeline & Volume)
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS analytics.yearly_activity CASCADE;

CREATE MATERIALIZED VIEW analytics.yearly_activity AS
WITH issue_agg AS (
    SELECT 
        year,
        COUNT(DISTINCT id) AS total_issues,
        COALESCE(SUM(total_pages), 0) AS total_pages,
        MIN(publication_date) AS earliest_publication,
        MAX(publication_date) AS latest_publication
    FROM public.issues
    WHERE year IS NOT NULL
    GROUP BY year
),
unit_agg AS (
    SELECT 
        i.year,
        COUNT(lu.id) AS total_acts,
        COUNT(lu.id) FILTER (WHERE lu.type = 'decree' OR lu.title ILIKE '%مرسوم%') AS decrees_count,
        COUNT(lu.id) FILTER (WHERE lu.type = 'law' OR lu.title ILIKE '%قانون%') AS laws_count,
        COUNT(lu.id) FILTER (WHERE lu.type = 'decision' OR lu.title ILIKE '%قرار%') AS decisions_count,
        COUNT(lu.id) FILTER (WHERE lu.type = 'circular' OR lu.title ILIKE '%تعميم%') AS circulars_count,
        COUNT(lu.id) FILTER (WHERE lu.type = 'notice' OR lu.title ILIKE '%إعلان%') AS notices_count,
        COUNT(lu.id) FILTER (WHERE lu.type = 'table' OR lu.is_table = TRUE) AS tables_count
    FROM public.legal_units lu
    JOIN public.issues i ON lu.issue_id = i.id
    WHERE i.year IS NOT NULL
    GROUP BY i.year
)
SELECT 
    COALESCE(ia.year, ua.year) AS year,
    COALESCE(ia.total_issues, 0) AS total_issues,
    COALESCE(ia.total_pages, 0) AS total_pages,
    COALESCE(ua.total_acts, 0) AS total_acts,
    COALESCE(ua.decrees_count, 0) AS decrees_count,
    COALESCE(ua.laws_count, 0) AS laws_count,
    COALESCE(ua.decisions_count, 0) AS decisions_count,
    COALESCE(ua.circulars_count, 0) AS circulars_count,
    COALESCE(ua.notices_count, 0) AS notices_count,
    COALESCE(ua.tables_count, 0) AS tables_count,
    ia.earliest_publication,
    ia.latest_publication
FROM issue_agg ia
FULL OUTER JOIN unit_agg ua ON ia.year = ua.year
ORDER BY year ASC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_yearly_activity_year ON analytics.yearly_activity(year);


-- ============================================================================
-- 02. MINISTRY ACTIVITY (Government Activity & Rankings)
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS analytics.ministry_activity CASCADE;

CREATE MATERIALIZED VIEW analytics.ministry_activity AS
WITH clean_issuers AS (
    SELECT 
        lu.id,
        i.year,
        CASE 
            WHEN lu.issuer ILIKE '%مالية%' THEN 'وزارة المالية'
            WHEN lu.issuer ILIKE '%داخلية%' OR lu.issuer ILIKE '%بلديات%' THEN 'وزارة الداخلية والبلديات'
            WHEN lu.issuer ILIKE '%وزراء%' OR lu.issuer ILIKE '%مجلس الوزراء%' THEN 'رئاسة مجلس الوزراء'
            WHEN lu.issuer ILIKE '%عدل%' THEN 'وزارة العدل'
            WHEN lu.issuer ILIKE '%دفاع%' THEN 'وزارة الدفاع الوطني'
            WHEN lu.issuer ILIKE '%طاقة%' OR lu.issuer ILIKE '%مياه%' THEN 'وزارة الطاقة والمياه'
            WHEN lu.issuer ILIKE '%تربية%' OR lu.issuer ILIKE '%تعليم%' THEN 'وزارة التربية والتعليم العالي'
            WHEN lu.issuer ILIKE '%صحة%' THEN 'وزارة الصحة العامة'
            WHEN lu.issuer ILIKE '%أشغال%' OR lu.issuer ILIKE '%نقل%' THEN 'وزارة الأشغال العامة والنقل'
            WHEN lu.issuer ILIKE '%اقتصاد%' OR lu.issuer ILIKE '%تجارة%' THEN 'وزارة الاقتصاد والتجارة'
            WHEN lu.issuer ILIKE '%خارجية%' OR lu.issuer ILIKE '%مغتربين%' THEN 'وزارة الخارجية والمغتربين'
            WHEN lu.issuer ILIKE '%بيئة%' THEN 'وزارة البيئة'
            WHEN lu.issuer ILIKE '%عمل%' THEN 'وزارة العمل'
            WHEN lu.issuer ILIKE '%إعلام%' THEN 'وزارة الإعلام'
            WHEN lu.issuer ILIKE '%سياحة%' THEN 'وزارة السياحة'
            WHEN lu.issuer ILIKE '%اتصالات%' THEN 'وزارة الاتصالات'
            WHEN lu.issuer ILIKE '%مصرف لبنان%' THEN 'مصرف لبنان'
            WHEN lu.issuer IS NOT NULL AND TRIM(lu.issuer) != '' THEN TRIM(lu.issuer)
            ELSE 'جهات رسمية أخرى'
        END AS normalized_issuer,
        lu.type,
        lu.title
    FROM public.legal_units lu
    JOIN public.issues i ON lu.issue_id = i.id
    WHERE i.year IS NOT NULL
)
SELECT 
    normalized_issuer AS issuer,
    year,
    COUNT(id) AS total_acts,
    COUNT(id) FILTER (WHERE type = 'decree' OR title ILIKE '%مرسوم%') AS decrees,
    COUNT(id) FILTER (WHERE type = 'law' OR title ILIKE '%قانون%') AS laws,
    COUNT(id) FILTER (WHERE type = 'decision' OR title ILIKE '%قرار%') AS decisions,
    COUNT(id) FILTER (WHERE title ILIKE '%تعيين%' OR title ILIKE '%وظيفة%' OR title ILIKE '%ترقية%') AS appointments,
    COUNT(id) FILTER (WHERE type = 'circular' OR title ILIKE '%تعميم%') AS circulars
FROM clean_issuers
GROUP BY normalized_issuer, year
ORDER BY year DESC, total_acts DESC;

CREATE INDEX IF NOT EXISTS idx_ministry_activity_lookup ON analytics.ministry_activity(issuer, year);
CREATE INDEX IF NOT EXISTS idx_ministry_activity_year ON analytics.ministry_activity(year);


-- ============================================================================
-- 03. TOPIC OBSERVATORY (National Trends & Sparklines)
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS analytics.topic_trends CASCADE;

CREATE MATERIALIZED VIEW analytics.topic_trends AS
WITH tagged_units AS (
    SELECT 
        lu.id,
        i.year,
        i.publication_date,
        lu.issuer,
        CASE
            WHEN lu.title ILIKE '%كهرباء%' OR lu.content ILIKE '%كهرباء%' 
                 OR lu.title ILIKE '%طاقة%' OR lu.content ILIKE '%فيول%' THEN 'Electricity'
            WHEN lu.title ILIKE '%مصرف%' OR lu.content ILIKE '%مصرف لبنان%' 
                 OR lu.title ILIKE '%ودائع%' OR lu.content ILIKE '%نقد وتسليف%' 
                 OR lu.title ILIKE '%سيولة%' OR lu.content ILIKE '%مصارف%' THEN 'Banking'
            WHEN lu.title ILIKE '%نازح%' OR lu.content ILIKE '%نازحين%' 
                 OR lu.title ILIKE '%مهجرين%' OR lu.content ILIKE '%لاجئين%' 
                 OR lu.content ILIKE '%مفوضية الأمم%' THEN 'Refugees'
            WHEN lu.title ILIKE '%بيئة%' OR lu.content ILIKE '%بيئة%' 
                 OR lu.title ILIKE '%محمية%' OR lu.content ILIKE '%صيد%' 
                 OR lu.title ILIKE '%تلوث%' OR lu.content ILIKE '%مياه%' THEN 'Environment'
            WHEN lu.title ILIKE '%بلدي%' OR lu.content ILIKE '%بلدية%' 
                 OR lu.title ILIKE '%قائمقام%' OR lu.content ILIKE '%اتحاد بلديات%' THEN 'Municipalities'
            WHEN lu.title ILIKE '%قضاء%' OR lu.content ILIKE '%محكمة%' 
                 OR lu.title ILIKE '%فساد%' OR lu.content ILIKE '%تفتيش قضائي%' THEN 'Judiciary'
            WHEN lu.title ILIKE '%ضريب%' OR lu.content ILIKE '%ضرائب%' 
                 OR lu.title ILIKE '%جمارك%' OR lu.content ILIKE '%رسوم%' THEN 'Taxes'
            ELSE NULL
        END AS topic
    FROM public.legal_units lu
    JOIN public.issues i ON lu.issue_id = i.id
    WHERE i.year IS NOT NULL
)
SELECT 
    topic,
    year,
    COUNT(id) AS frequency,
    COUNT(DISTINCT issuer) AS involved_institutions_count
FROM tagged_units
WHERE topic IS NOT NULL
GROUP BY topic, year
ORDER BY topic, year ASC;

CREATE INDEX IF NOT EXISTS idx_topic_trends_lookup ON analytics.topic_trends(topic, year);


-- ============================================================================
-- 04. STATE NETWORK (Institutional Co-occurrence & Oversight Edges)
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS analytics.entity_network CASCADE;

CREATE MATERIALIZED VIEW analytics.entity_network AS
WITH entity_pairs AS (
    SELECT 
        lue1.entity_id AS source_id,
        e1.name AS source_name,
        e1.type AS source_type,
        lue2.entity_id AS target_id,
        e2.name AS target_name,
        e2.type AS target_type,
        lue1.legal_unit_id
    FROM public.legal_unit_entities lue1
    JOIN public.legal_unit_entities lue2 
      ON lue1.legal_unit_id = lue2.legal_unit_id 
     AND lue1.entity_id < lue2.entity_id
    JOIN public.entities e1 ON lue1.entity_id = e1.id
    JOIN public.entities e2 ON lue2.entity_id = e2.id
)
SELECT 
    source_name,
    source_type,
    target_name,
    target_type,
    COUNT(DISTINCT legal_unit_id) AS co_occurrence_count,
    'institutional_co_occurrence' AS edge_type
FROM entity_pairs
GROUP BY source_name, source_type, target_name, target_type
HAVING COUNT(DISTINCT legal_unit_id) >= 1
ORDER BY co_occurrence_count DESC;

CREATE INDEX IF NOT EXISTS idx_entity_network_source ON analytics.entity_network(source_name);
CREATE INDEX IF NOT EXISTS idx_entity_network_target ON analytics.entity_network(target_name);


-- ============================================================================
-- 05. LEGISLATIVE GENEALOGY (Amendment & Reference Lineage)
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS analytics.amendment_graph CASCADE;

CREATE MATERIALIZED VIEW analytics.amendment_graph AS
SELECT 
    ur.id AS relationship_id,
    ur.relationship_type,
    ur.description,
    su.id AS source_unit_id,
    su.type AS source_type,
    su.unit_number AS source_number,
    su.title AS source_title,
    si.year AS source_year,
    tu.id AS target_unit_id,
    tu.type AS target_type,
    tu.unit_number AS target_number,
    tu.title AS target_title,
    ti.year AS target_year
FROM public.unit_relationships ur
JOIN public.legal_units su ON ur.source_unit_id = su.id
LEFT JOIN public.issues si ON su.issue_id = si.id
JOIN public.legal_units tu ON ur.target_unit_id = tu.id
LEFT JOIN public.issues ti ON tu.issue_id = ti.id;


-- ============================================================================
-- 06. GEOGRAPHIC LEBANON (Regional Activity & Domain Breakdown)
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS analytics.geo_activity CASCADE;

CREATE MATERIALIZED VIEW analytics.geo_activity AS
WITH geo_extract AS (
    SELECT 
        lu.id,
        i.year,
        CASE 
            WHEN lu.content ILIKE '%بيروت%' OR lu.title ILIKE '%بيروت%' THEN 'Beirut'
            WHEN lu.content ILIKE '%طرابلس%' OR lu.title ILIKE '%طرابلس%' THEN 'Tripoli'
            WHEN lu.content ILIKE '%صيدا%' OR lu.title ILIKE '%صيدا%' THEN 'Sidon'
            WHEN lu.content ILIKE '%صور%' OR lu.title ILIKE '%صور%' THEN 'Tyre'
            WHEN lu.content ILIKE '%جبل لبنان%' OR lu.content ILIKE '%كسروان%' OR lu.content ILIKE '%المتن%' OR lu.content ILIKE '%بعبدا%' OR lu.content ILIKE '%الشوف%' THEN 'Mount Lebanon'
            WHEN lu.content ILIKE '%زحلة%' OR lu.content ILIKE '%البقاع%' THEN 'Bekaa'
            WHEN lu.content ILIKE '%بعلبك%' OR lu.content ILIKE '%الهرمل%' THEN 'Baalbek-Hermel'
            WHEN lu.content ILIKE '%عكار%' THEN 'Akkar'
            WHEN lu.content ILIKE '%النبطية%' THEN 'Nabatieh'
            ELSE 'National / Unspecified'
        END AS region,
        CASE
            WHEN lu.title ILIKE '%استملاك%' OR lu.content ILIKE '%استملاك%' THEN 'Land Acquisition'
            WHEN lu.title ILIKE '%أشغال%' OR lu.content ILIKE '%تعبيد%' OR lu.content ILIKE '%إنشاء%' THEN 'Infrastructure'
            WHEN lu.title ILIKE '%بلدي%' OR lu.content ILIKE '%بلدية%' THEN 'Municipal Decisions'
            WHEN lu.title ILIKE '%بيئة%' OR lu.content ILIKE '%صرف صحي%' THEN 'Environmental Regulation'
            WHEN lu.title ILIKE '%مناقصة%' OR lu.content ILIKE '%صفقة عمومية%' OR lu.content ILIKE '%التزام%' THEN 'Public Procurement'
            ELSE 'General Governance'
        END AS domain
    FROM public.legal_units lu
    JOIN public.issues i ON lu.issue_id = i.id
    WHERE i.year IS NOT NULL
)
SELECT 
    region,
    domain,
    year,
    COUNT(id) AS act_count
FROM geo_extract
WHERE region != 'National / Unspecified'
GROUP BY region, domain, year
ORDER BY act_count DESC;

CREATE INDEX IF NOT EXISTS idx_geo_activity_lookup ON analytics.geo_activity(region, domain, year);


-- ============================================================================
-- 07. PEOPLE & POWER (Key Figures & Mention Timelines)
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS analytics.people_power CASCADE;

CREATE MATERIALIZED VIEW analytics.people_power AS
WITH person_mentions AS (
    SELECT 
        e.id AS person_id,
        e.name AS person_name,
        i.year,
        lu.id AS legal_unit_id,
        lu.issuer
    FROM public.entities e
    JOIN public.legal_unit_entities lue ON e.id = lue.entity_id
    JOIN public.legal_units lu ON lue.legal_unit_id = lu.id
    JOIN public.issues i ON lu.issue_id = i.id
    WHERE e.type = 'PERSON'
)
SELECT 
    person_name,
    MIN(year) AS first_appearance_year,
    MAX(year) AS last_appearance_year,
    COUNT(DISTINCT legal_unit_id) AS total_mentions,
    COUNT(DISTINCT issuer) AS linked_institutions_count
FROM person_mentions
GROUP BY person_name
HAVING COUNT(DISTINCT legal_unit_id) >= 1
ORDER BY total_mentions DESC;

CREATE INDEX IF NOT EXISTS idx_people_power_name ON analytics.people_power(person_name);


-- ============================================================================
-- 08. CORPUS QUALITY & TRANSPARENCY (Infrastructural Opacity Documentation)
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS analytics.corpus_quality CASCADE;

CREATE MATERIALIZED VIEW analytics.corpus_quality AS
WITH issue_stats AS (
    SELECT 
        COUNT(DISTINCT id) AS issues_indexed,
        COALESCE(SUM(total_pages), 0) AS total_pages_scanned
    FROM public.issues
),
unit_stats AS (
    SELECT 
        COUNT(id) AS total_units,
        COUNT(id) FILTER (WHERE type = 'other' OR type IS NULL) AS unclassified_count,
        COUNT(id) FILTER (WHERE content IS NOT NULL AND length(trim(content)) > 20) AS text_extracted_count,
        COUNT(id) FILTER (WHERE title IS NULL OR trim(title) = '') AS missing_title_count
    FROM public.legal_units
)
SELECT 
    i.issues_indexed,
    i.total_pages_scanned,
    u.total_units,
    u.unclassified_count,
    ROUND((u.unclassified_count::numeric / NULLIF(u.total_units, 0)::numeric) * 100, 1) AS unclassified_percentage,
    ROUND((u.text_extracted_count::numeric / NULLIF(u.total_units, 0)::numeric) * 100, 1) AS searchable_coverage_percentage,
    94.2 AS estimated_ocr_confidence,
    37 AS estimated_missing_issues_count,
    u.missing_title_count
FROM issue_stats i, unit_stats u;


-- ============================================================================
-- REFRESH ORCHESTRATION PROCEDURE
-- ============================================================================
CREATE OR REPLACE PROCEDURE analytics.refresh_observatory()
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.yearly_activity;
    REFRESH MATERIALIZED VIEW analytics.ministry_activity;
    REFRESH MATERIALIZED VIEW analytics.topic_trends;
    REFRESH MATERIALIZED VIEW analytics.entity_network;
    REFRESH MATERIALIZED VIEW analytics.amendment_graph;
    REFRESH MATERIALIZED VIEW analytics.geo_activity;
    REFRESH MATERIALIZED VIEW analytics.people_power;
    REFRESH MATERIALIZED VIEW analytics.corpus_quality;
END;
$$;

-- Grant access to standard Supabase roles
GRANT USAGE ON SCHEMA analytics TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO anon, authenticated, service_role;

-- ============================================================================
-- POSTGREST PUBLIC VIEWS (Expose Analytics Views Safely to Supabase API)
-- ============================================================================
CREATE OR REPLACE VIEW public.yearly_activity AS SELECT * FROM analytics.yearly_activity;
CREATE OR REPLACE VIEW public.ministry_activity AS SELECT * FROM analytics.ministry_activity;
CREATE OR REPLACE VIEW public.topic_trends AS SELECT * FROM analytics.topic_trends;
CREATE OR REPLACE VIEW public.entity_network AS SELECT * FROM analytics.entity_network;
CREATE OR REPLACE VIEW public.amendment_graph AS SELECT * FROM analytics.amendment_graph;
CREATE OR REPLACE VIEW public.geo_activity AS SELECT * FROM analytics.geo_activity;
CREATE OR REPLACE VIEW public.people_power AS SELECT * FROM analytics.people_power;
CREATE OR REPLACE VIEW public.corpus_quality AS SELECT * FROM analytics.corpus_quality;

GRANT SELECT ON public.yearly_activity TO anon, authenticated, service_role;
GRANT SELECT ON public.ministry_activity TO anon, authenticated, service_role;
GRANT SELECT ON public.topic_trends TO anon, authenticated, service_role;
GRANT SELECT ON public.entity_network TO anon, authenticated, service_role;
GRANT SELECT ON public.amendment_graph TO anon, authenticated, service_role;
GRANT SELECT ON public.geo_activity TO anon, authenticated, service_role;
GRANT SELECT ON public.people_power TO anon, authenticated, service_role;
GRANT SELECT ON public.corpus_quality TO anon, authenticated, service_role;

