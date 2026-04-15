---
name: powerbi-india-map
description: Build a State → District → CD Block drill-down India map inside Power BI. Covers two authoring paths — (a) PBIP generator scaffold from a BRD/wireframe, and (b) manual Power BI Desktop using the Icon Map Pro custom visual with TopoJSON. Trigger on "India map in Power BI", "Power BI drill-down map", "PBIP India", "LGD Power BI", "shape map India", "block-level map in Power BI", or any Power BI + Indian admin geography request. Handles LGD keying, custom visual choice (native shape map fails at district/block), page-level drill-through vs bookmarks, DAX for aggregation, and data-model shape. Not for Tableau (scoped out) or non-Power-BI stacks — see sister skills `frappe-chb-india-map` and `react-angular-leaflet-india-map`.
license: MIT
---

# Power BI — India drill-down map

Self-contained skill for a 3-level (State → District → CD Block) choropleth in Power BI. Two paths:

1. **PBIP-generator path** — scaffolding a full `.pbip` project from a BRD/wireframe (interop with the existing `pbip-generator` skill).
2. **Manual Power BI Desktop path** — a dataset + page design a user can build in Desktop, using the `Icon Map Pro` custom visual for TopoJSON.

## When to use

- A business user needs an India drill-down map as a visual inside a Power BI report page that already carries KPIs/cards.
- Switching a dashboard from static state-level PNG to an interactive drill.
- Converting an existing Figma/BRD spec for an India map into a working `.pbip`.

## When NOT to use

- Non-Power-BI stack → `frappe-chb-india-map` or `react-angular-leaflet-india-map`.
- Map is the ONLY visual on the report and real-time interactivity is critical → a web-native Leaflet page performs better.
- User wants Tableau → out of scope for this skill version.

## Phase 1 — Clarify

Ask one at a time via AskUserQuestion:

1. **Authoring path.** Generate `.pbip` from a BRD/wireframe, or document the manual Power BI Desktop steps?
2. **Drill depth.** State / State+District / State+District+Block?
3. **Fact table.** What table carries the metric + LGD columns? Grain (one row per grant / beneficiary / transaction)?
4. **LGD columns.** Are `state_lgd`, `district_lgd`, `block_shape_id` present and zero-padded? If not, add a Power Query step.
5. **Metric + aggregation.** Sum / count / distinctcount / avg of which column?
6. **Visual choice.** `Icon Map Pro` (supports TopoJSON, polygon + point, recommended) vs `Azure Maps` (point-only for blocks, won't choropleth blocks) vs `Shape Map` (preview, native, limited).
7. **Color scheme.** ColorBrewer family (pass through to the custom visual's JSON config).
8. **Cross-filter.** Should KPI cards on the page cross-filter when a state/district is clicked on the map? (Power BI's default is yes; explicit confirmation avoids surprises.)
9. **Row-level security.** Does the metric need RLS? (Affects the data-model filter direction.)

## Phase 2 — Implementation contract (hard rules)

- **Native `Shape Map` does NOT handle district or block polygons at scale.** Use `Icon Map Pro` (or `Synoptic Panel` as fallback).
- **One table per level is an anti-pattern.** Use a single fact table + three dimension tables (`dim_state`, `dim_district`, `dim_block`) keyed on LGD, with bidirectional relationships only where justified.
- **Never join on name.** Always LGD.
- **TopoJSON path.** Icon Map Pro accepts TopoJSON via its JSON config; point at this repo's jsDelivr URL or host alongside the pbix.
- **Drill-through, not drill-down, for cross-page navigation.** Drill-down stays on the page (map zooms/refilters). Drill-through opens a target page filtered by the clicked geography.
- **Locale.** Report locale to `en-IN`; Power Query regional format English (India).
- **Currency formatting.** Custom format string `"₹"#,##0.00,,"Cr"` (divides by 10M) or `,"L"` (lakhs). Don't use `en-US` `$`.
- **PBIP, not PBIX, for version control.** Use `.pbip` (TMDL + report.json) so diffs are reviewable.

## Phase 3 — Files to produce

### Path A — PBIP generator

Hand off to the `pbip-generator` skill with this payload:
- BRD or wireframe (required)
- Metric + grain (from Phase 1)
- Visual: Icon Map Pro with TopoJSON from this repo
- DAX measures list (see `reference/dax_measures.dax`)
- Theme JSON (see `reference/theme.json`)

### Path B — Manual Desktop

Produce the following artefacts:

1. `reference/data_model.md` — 4 tables + relationships + column types + role-play dims.
2. `reference/power_query.m` — the M code that loads the fact table, normalises LGD to zero-padded text, and joins to dims.
3. `reference/dax_measures.dax` — measures for metric, disbursed, grantees, grants count, aspirational flag.
4. `reference/icon_map_pro_config.json` — the JSON the custom visual consumes: TopoJSON URL, object names, join field, color palette.
5. `reference/theme.json` — Power BI theme with ColorBrewer-derived palette, en-IN number formats, card tokens.
6. `reference/page_layout.md` — map at left-70%, KPI strip right-30%, cross-filter confirmed.
7. `reference/drill_through.md` — drill-through pages per level, back button, bookmarks.

## Phase 4 — Verify

- `Icon Map Pro` imported as a `.pbiviz` (Marketplace) — Desktop shows "Certified" tick; if not, download from AppSource manually.
- LGD columns typed as `Text` (not Whole Number) — a "07" truncated to 7 silently breaks the join.
- DAX `SELECTEDVALUE` used for drill-through filters, not `VALUES`.
- Theme JSON applied; card radius 6, padding 16, label 11/600/upper, value 24/600/tabular.
- Cross-filter tested: click state → KPI updates; click district → KPI updates.
- Map renders at <2 s on cold open; block layer (5.6 MB) gzipped.

## References

- `REFERENCE.md` — visual-choice decision tree, DAX patterns, theme spec, failure modes.
- `reference/data_model.md`, `power_query.m`, `dax_measures.dax`, `icon_map_pro_config.json`, `theme.json`, `page_layout.md`, `drill_through.md`.
- `evals/evals.md` — 10 test prompts + rubric.

## Data asset

`../../data/topo/{states,districts,blocks}.json` — 36 / 780 / 6,803 features. Schema and provenance in `../../data/README.md`.
