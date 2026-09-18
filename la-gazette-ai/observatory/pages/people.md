---
title: "07 — People & Power"
description: "Named entity intelligence tracking public officials across the gazette archive"
---

# 07 — People & Power

Investigative entity tracking across appointments, decrees, judicial delegations, and board nominations.

```sql people_data
select * from gazette.people_power
order by total_mentions desc;
```

## Most-Mentioned Public Figures

<BarChart 
    data={people_data}
    x="person_name"
    y="total_mentions"
    layout="horizontal"
    title="Official Mentions in Decrees and Decisions"
    xAxisTitle="Gazette Mentions"
    fillColor="#8b5cf6"
/>

---

## Entity Intelligence Index

<DataTable data={people_data} search="true" pagination="true">
    <Column id="person_name" title="Full Name" />
    <Column id="first_appearance_year" title="First Appearance" />
    <Column id="last_appearance_year" title="Latest Appearance" />
    <Column id="total_mentions" title="Total Mentions" fmt="#,##0" />
    <Column id="linked_institutions_count" title="Linked Institutions" />
</DataTable>
