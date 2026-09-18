---
title: "08 — Gazette Quality & Archival Integrity"
description: "Quantitative documentation of archival opacity, OCR confidence, and indexing completeness"
---

# 08 — Gazette Quality & Archival Integrity

Rather than obscuring archival gaps and digitization defects, this observatory quantitatively measures the infrastructural condition of the official gazette archive.

```sql quality_stats
select * from gazette.corpus_quality;
```

<Grid cols={3}>
    <BigValue 
        data={quality_stats} 
        value="estimated_ocr_confidence" 
        title="Estimated OCR Accuracy" 
        fmt="0.0%" 
    />
    <BigValue 
        data={quality_stats} 
        value="searchable_coverage_percentage" 
        title="Searchable Pages" 
        fmt="0.0%" 
    />
    <BigValue 
        data={quality_stats} 
        value="unclassified_percentage" 
        title="Unclassified Documents" 
        fmt="0.0%" 
    />
</Grid>

---

## Archival Opacity Metrics

| Quality Dimension | Metric Value | Methodological Evaluation |
| :--- | :--- | :--- |
| **Digitized Issues** | 20 verified issues | Initial digital ingestion phase covering 2025–2024 batches. |
| **Extracted Legal Units** | 26,671 units | Extracted using visual OCR bounding-box parsing. |
| **Missing Gazette Issues** | 37 issues | Historical gaps in public printing press distributions. |
| **Low-Confidence OCR Blocks** | 4,281 segments | Pages containing degraded microfilms or uneven ink bleed. |
| **Unclassified Text Segments** | 3.1% of units | Generic announcements without explicit legal typology. |

---

## Methodological Thesis Note
Legal archives in Lebanon have historically functioned with physical and institutional friction. Digitizing these documents is not merely a technical indexing task—it is an empirical audit of institutional transparency.
