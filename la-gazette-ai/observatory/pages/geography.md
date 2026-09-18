---
title: "06 — Geographic Lebanon"
description: "Geographic footprint of Lebanese Official Gazette decrees and decisions"
---

# 06 — Geographic Lebanon

Where does the state act? Regional mapping of land acquisitions, public works, and municipal decisions.

```sql geo_data
select * from gazette.geo_activity;
```

## Regional Distribution

<BarChart 
    data={geo_data}
    x="region"
    y="act_count"
    series="domain"
    title="Published Acts by Governorate / Major City"
    xAxisTitle="Region"
    yAxisTitle="Legal Units"
/>

---

## Domain Breakdown by Territory

<DataTable data={geo_data} search="true" pagination="true">
    <Column id="region" title="Region / City" />
    <Column id="domain" title="Domain" />
    <Column id="year" title="Year" />
    <Column id="act_count" title="Act Count" fmt="#,##0" />
</DataTable>
