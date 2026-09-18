---
title: "02 — Government Activity"
description: "Distribution of legislative and executive acts by Lebanese ministries and authorities"
---

# 02 — Government Activity

An empirical instrument tracking state output across ministries, councils, and executive departments.

```sql raw_ministries
select * from gazette.ministry_activity;
```

## Filters

<Dropdown 
    name="selected_type" 
    title="Act Type" 
    defaultValue="all"
>
    <DropdownOption value="all" label="All Types" />
    <DropdownOption value="decrees" label="Decrees (مراسيم)" />
    <DropdownOption value="laws" label="Laws (قوانين)" />
    <DropdownOption value="decisions" label="Decisions (قرارات)" />
    <DropdownOption value="appointments" label="Appointments (تعيينات وترقيات)" />
</Dropdown>

<Slider 
    name="selected_year" 
    title="Year Focus" 
    min=2014 
    max=2026 
    step=1 
    defaultValue=2025 
/>

```sql filtered_ranking
select 
    issuer,
    sum(
        case 
            when '${inputs.selected_type.value}' = 'decrees' then decrees
            when '${inputs.selected_type.value}' = 'laws' then laws
            when '${inputs.selected_type.value}' = 'decisions' then decisions
            when '${inputs.selected_type.value}' = 'appointments' then appointments
            else total_acts
        end
    ) as output_count
from ${raw_ministries}
where year = ${inputs.selected_year.value}
group by issuer
order by output_count desc
limit 15;
```

## Ministry Rankings (${inputs.selected_year.value})

<BarChart 
    data={filtered_ranking}
    x="issuer"
    y="output_count"
    layout="horizontal"
    title="Output by Issuing Authority"
    xAxisTitle="Number of Published Acts"
    fillColor="#2563eb"
/>

---

## Detailed Ministry Registry

<DataTable data={raw_ministries} search="true" pagination="true">
    <Column id="issuer" title="Authority / Ministry" />
    <Column id="year" title="Year" />
    <Column id="total_acts" title="Total Acts" fmt="#,##0" />
    <Column id="decrees" title="Decrees" fmt="#,##0" />
    <Column id="laws" title="Laws" fmt="#,##0" />
    <Column id="decisions" title="Decisions" fmt="#,##0" />
    <Column id="appointments" title="Appointments" fmt="#,##0" />
</DataTable>
