---
title: "04 — State Network"
description: "Network analysis of government ministries, regulatory bodies, and public authorities"
---

# 04 — State Network

An observable model of the Lebanese state structure based on legal co-occurrences, joint decrees, and institutional oversight.

```sql network_edges
select 
    source_name,
    target_name,
    co_occurrence_count
from gazette.entity_network
where co_occurrence_count >= 1
order by co_occurrence_count desc
limit 25;
```

## Top Institutional Intersections

<BarChart 
    data={network_edges}
    x="source_name"
    y="co_occurrence_count"
    series="target_name"
    title="Co-occurrence Frequency Across Legal Units"
    yAxisTitle="Shared Documents"
/>

---

## Edge Registry

<DataTable data={network_edges} search="true">
    <Column id="source_name" title="Primary Authority" />
    <Column id="target_name" title="Co-appearing Body" />
    <Column id="co_occurrence_count" title="Shared Decrees / Decisions" fmt="#,##0" />
</DataTable>
