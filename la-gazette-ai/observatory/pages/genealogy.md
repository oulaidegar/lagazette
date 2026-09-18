---
title: "05 — Legislative Genealogy"
description: "Tracking legal amendments, decrees, and implementation lineages"
---

# 05 — Legislative Genealogy

Explore how major Lebanese laws are amended, referenced, and executed over time.

```sql lineage_data
select * from gazette.amendment_graph;
```

## Case Study: Anti-Money Laundering Framework (Law 44 / 2015)

```mermaid
graph TD
    L44["Law 44 / 2015<br/>Anti-Money Laundering & Counter-Terrorism"]
    L55["Law 55 / 2016<br/>Exchange of Tax Information"]
    D1024["Decree 1024 / 2018<br/>Compliance Standards"]
    DEC781["Decision 781 / 2019<br/>Special Investigation Commission"]
    L189["Law 189 / 2020<br/>Illicit Wealth Declaration"]

    L44 -->|amended by| L55
    L44 -->|referenced by| D1024
    D1024 -->|implemented by| DEC781
    L44 -->|amended by| L189
```

---

## Registered Legislative Relationships

<DataTable data={lineage_data} search="true" pagination="true">
    <Column id="source_title" title="Original Act" />
    <Column id="relationship_type" title="Relation" />
    <Column id="target_title" title="Modifying Act" />
    <Column id="source_year" title="Year" />
    <Column id="description" title="Context" />
</DataTable>
