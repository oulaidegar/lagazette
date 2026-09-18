---
title: "Lebanese Official Gazette — Research Observatory"
description: "Empirical observation platform for the Lebanese state legal archive (1922–2026)"
---

# 01 — Corpus Observatory
<small>Empirical archive metrics across digitized Lebanese Official Gazette publications.</small>

```sql yearly_stats
select * from gazette.yearly_activity
order by year asc;
```

```sql macro_numbers
select 
    sum(total_issues) as all_issues,
    sum(total_pages) as all_pages,
    sum(total_acts) as all_acts,
    sum(decrees_count) as all_decrees,
    sum(laws_count) as all_laws,
    sum(decisions_count) as all_decisions
from ${yearly_stats};
```

<Grid cols={3}>
    <BigValue 
        data={macro_numbers} 
        value="all_issues" 
        title="Issues Documented" 
        fmt="#,##0" 
    />
    <BigValue 
        data={macro_numbers} 
        value="all_pages" 
        title="Scanned Pages" 
        fmt="#,##0" 
    />
    <BigValue 
        data={macro_numbers} 
        value="all_acts" 
        title="Total Legal Acts Indexed" 
        fmt="#,##0" 
    />
</Grid>

---

## Publication Volume Over Time

Explore legal output across years. Click any bar to inspect specific annual distribution:

<BarChart 
    data={yearly_stats}
    x="year"
    y="total_acts"
    series="type"
    title="Annual Legal Output (Laws, Decrees, Decisions)"
    yAxisTitle="Indexed Acts"
    xAxisTitle="Publication Year"
    fillColor="#3b82f6"
/>

<Grid cols={3}>
    <Value 
        data={macro_numbers} 
        value="all_laws" 
        title="Total Laws (قوانين)" 
        fmt="#,##0"
    />
    <Value 
        data={macro_numbers} 
        value="all_decrees" 
        title="Total Decrees (مراسيم)" 
        fmt="#,##0"
    />
    <Value 
        data={macro_numbers} 
        value="all_decisions" 
        title="Total Decisions (قرارات)" 
        fmt="#,##0"
    />
</Grid>

---

## Yearly Breakdown Table

<DataTable data={yearly_stats} search="true" pagination="true">
    <Column id="year" title="Year" />
    <Column id="total_issues" title="Issues" fmt="#,##0" />
    <Column id="total_pages" title="Pages" fmt="#,##0" />
    <Column id="total_acts" title="Total Acts" fmt="#,##0" />
    <Column id="laws_count" title="Laws" fmt="#,##0" />
    <Column id="decrees_count" title="Decrees" fmt="#,##0" />
    <Column id="decisions_count" title="Decisions" fmt="#,##0" />
    <Column id="circulars_count" title="Circulars" fmt="#,##0" />
</DataTable>

---

### Observatory Sections
- [02 — Government Activity](/government)
- [03 — Topic Observatory](/topics)
- [04 — State Network](/network)
- [05 — Legislative Genealogy](/genealogy)
- [06 — Geographic Lebanon](/geography)
- [07 — People & Power](/people)
- [08 — Gazette Quality & Transparency](/integrity)
