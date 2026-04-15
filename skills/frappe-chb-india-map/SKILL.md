---
name: frappe-chb-india-map
description: Build a State → District → CD Block drill-down India map inside a Frappe v15/v16 Custom HTML Block (CHB). Trigger on "India map in Frappe", "mGrant map", "CHB drill-down map", "grants map", "LGD choropleth", "block-level map in Frappe", or any request to render a choropleth of Indian admin polygons inside a Frappe Workspace dashboard. Also trigger when the user has an existing CHB dashboard and needs to add a map widget keyed on `state_lgd` / `district_lgd` / `block_shape_id`. Handles Shadow DOM rendering, label-match rules, topojson delivery, Leaflet + topojson-client wiring, quantile binning, ColorBrewer palettes, and Indian number formatting (₹ Cr / L, en-IN). Not for non-Frappe stacks — see sister skills `powerbi-india-map` and `react-angular-leaflet-india-map`.
license: MIT
---

# Frappe CHB — India drill-down map

Self-contained skill for a 3-level (State → District → CD Block) choropleth inside a Frappe Workspace Custom HTML Block. Distilled from a production mGrant deployment; see `../../data/` for the canonical TopoJSON dataset used by all three skills in this repo.

## When to use

- Adding a drill-down India map to a CHB dashboard that already carries KPIs / charts.
- Rendering grants, beneficiaries, or programme-area metrics keyed on LGD codes.
- Replacing a static PNG / single-state heatmap with a live, hover-interactive choropleth.

## When NOT to use

- Non-Frappe stack → use `powerbi-india-map` or `react-angular-leaflet-india-map`.
- Country-wide aggregate only (no drill) → a single d3-geo choropleth is lighter; this skill is over-scoped.
- Real-time routing or spatial analytics → use PostGIS + a GIS frontend, not a CHB.

## Phase 1 — Clarify (ask before writing any code)

Ask these one at a time via AskUserQuestion. Do not assume defaults.

1. **Drill depth.** State only / State → District / State → District → Block?
2. **State filter.** All-India, single state (pick one), or multi-state (pick many)?
3. **Metric.** Which DocType + field carries the number? Aggregation: sum / count / count_distinct / avg?
4. **LGD plumbing.** Does the source DocType store `state_lgd` / `district_lgd` / `block_shape_id` as zero-padded strings? If no — add a validate hook first.
5. **Hover card fields.** Pick per level from: sanctioned amount, disbursed amount, grantee count, grants count, portfolio chips, aspirational flag, last disbursed on, custom.
6. **ColorBrewer scheme.** Sequential single-hue / multi-hue / diverging / qualitative. Default-nudge: sequential for positive monotonic, diverging for signed, qualitative for dominant-category.
7. **Delivery mode.** Install-time copy into `apps/<app>/public/geo/` (recommended for prod) or jsDelivr runtime (prototypes only).
8. **App name + Workspace.** Which app does the CHB live in, and which Workspace embeds it?
9. **Perm enforcement.** Must the API method enforce Frappe permissions (use `frappe.get_all`) or is raw SQL acceptable (faster, no perm check)?

## Phase 2 — Implementation contract (hard rules)

- **Never key on `state_name`.** Diacritics/casing/abbreviations kill joins. LGD codes only, zero-padded strings.
- **Shadow DOM.** CHBs render inside a closed shadow root. Use `frappe.create_shadow_element` pattern; query selectors scope to the shadow host, not `document`.
- **Label-match rule.** The CHB name you pick must match the label used when adding to the Workspace, else the child-table sync drops it.
- **Leaflet, not D3.** Canvas-accelerated rendering (`preferCanvas: true`) for 6,803 block polygons. D3-geo crashes on blocks at block level.
- **No localStorage / sessionStorage.** Frappe's desk sandboxes may strip them; keep all state in closures.
- **Preet Vihar caveat.** One Delhi block has null `district_lgd` — either hardcode override to East Delhi (`0174`) or filter out.
- **en-IN formatting.** `Intl.NumberFormat('en-IN')` + ₹ Cr/L post-processing. Never `en-US`.
- **Style field populated.** The CHB's Style field must have at least one rule or the block renders blank.

## Phase 3 — Files to touch

1. `apps/<app>/<app>/api.py` — add the whitelisted `map_metrics(level, state_lgd?, district_lgd?)` method. See `reference/api.py`.
2. `apps/<app>/<app>/public/geo/{states,districts,blocks}.json` — copy from this repo's `/data/topo/`. Run `bench build --app <app>`.
3. Custom HTML Block `mgrant_india_map` (or caller's name) — paste `reference/custom_html_block.html`, fill placeholders `__APP_NAME__`, `__API_METHOD__`, `__METRIC_LABEL__`, `__METRIC_FORMAT__`, `__SCHEME__`, `__HOVER_FIELDS__`, `__GEO_BASE__`.
4. Workspace content JSON — add the CHB widget with `label` exactly equal to the CHB name.

## Phase 4 — Verify (before handing off)

- Network tab on cold reload: `states.json` (~70 KB gzipped), no 404s.
- First state click fetches `districts.json` once; first district click fetches `blocks.json` once.
- Hover on a state renders the KPI card with every configured `HOVER_FIELDS` key populated.
- Legend visible at country + state levels, hidden at block level.
- Breadcrumb navigates back without re-fetching topojson.
- `bench clear-cache && bench clear-website-cache` run after any CHB edit (v16 caches aggressively).

## References

- `REFERENCE.md` — design tokens, palette defaults, hover-card field menu, failure-mode table.
- `reference/api.py` — drop-in Python server method.
- `reference/custom_html_block.html` — drop-in CHB HTML + JS with all 25 ColorBrewer palettes baked in.
- `reference/deployment_checklist.md` — nginx gzip, `bench build`, rollback.
- `evals/evals.md` — 10 test prompts + rubric.

## Data asset

`../../data/topo/{states,districts,blocks}.json` — 36 / 780 / 6,803 features. Schema and provenance in `../../data/README.md`.
