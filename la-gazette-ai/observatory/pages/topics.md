---
title: "03 — Topic Observatory"
description: "Tracking shifts in state focus across national policy topics"
---

# 03 — Topic Observatory

What has the Lebanese state been talking about? Monitor topic intensities, peak legislative interventions, and institutional ownership.

```sql all_topics
select * from gazette.topic_trends;
```

## National Policy Trajectories

<LineChart 
    data={all_topics}
    x="year"
    y="frequency"
    series="topic"
    title="Mentions Over Time by Topic (2014–2026)"
    yAxisTitle="Indexed Legal Acts"
    xAxisTitle="Year"
/>

---

## Topic Deep Dive

<Dropdown 
    name="active_topic" 
    title="Select Topic" 
    defaultValue="Banking"
>
    <DropdownOption value="Banking" label="Banking & Monetary (المصارف والنقد)" />
    <DropdownOption value="Electricity" label="Electricity & Energy (الكهرباء والطاقة)" />
    <DropdownOption value="Refugees" label="Refugees & Displaced (النازحون واللاجئون)" />
    <DropdownOption value="Environment" label="Environment & Water (البيئة والمياه)" />
    <DropdownOption value="Municipalities" label="Municipalities & Local Gov (البلديات)" />
    <DropdownOption value="Taxes" label="Customs & Taxes (الضرائب والرسوم)" />
    <DropdownOption value="Judiciary" label="Judiciary & Anti-Corruption (القضاء)" />
</Dropdown>

```sql selected_topic_timeline
select 
    year,
    frequency,
    involved_institutions_count
from ${all_topics}
where topic = '${inputs.active_topic.value}'
order by year asc;
```

<Grid cols={2}>
    <AreaChart 
        data={selected_topic_timeline}
        x="year"
        y="frequency"
        title="Activity Trend: ${inputs.active_topic.value}"
        yAxisTitle="Acts Mentioning Topic"
        fillColor="#3b82f6"
    />
    <BarChart 
        data={selected_topic_timeline}
        x="year"
        y="involved_institutions_count"
        title="Involved State Institutions"
        yAxisTitle="Distinct Authorities"
        fillColor="#10b981"
    />
</Grid>
