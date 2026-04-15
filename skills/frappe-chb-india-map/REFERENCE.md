# Frappe CHB India Map — Reference

## 1. Design tokens

| Element | Token |
|---|---|
| Card radius | `6px` |
| Card padding | `16px` |
| Card shadow | `0 1px 2px rgba(0,0,0,.06)` |
| Card border | `1px solid #e5e7eb` |
| Label typo | `11px / 600 / letter-spacing .04em / uppercase / #6b7280` |
| Value typo | `24px / 600 / tabular-nums / #111827` |
| Stroke (state) | `#ffffff`, weight `1.5` |
| Stroke (district) | `#ffffff`, weight `0.8` |
| Stroke (block) | `#ffffff`, weight `0.3` |
| Hover stroke | `#111827`, weight `2` |
| No-data fill | `#f3f4f6` |
| Aspirational stripe | `repeating-linear-gradient(45deg, rgba(239,68,68,.15) 0 4px, transparent 4px 8px)` |

## 2. ColorBrewer picker (ship all 25 as a const)

Grouped default-nudge rules:
- **Sequential single-hue** — `Blues`, `Greens`, `Greys`, `Oranges`, `Purples`, `Reds`. Use when metric is positive monotonic and interpretation should be "more = darker".
- **Sequential multi-hue** — `BuGn`, `BuPu`, `GnBu`, `OrRd`, `PuBu`, `PuBuGn`, `PuRd`, `RdPu`, `YlGn`, `YlGnBu`, `YlOrBr`, `YlOrRd`. Use for wider dynamic range; reads better at 6–7 bins.
- **Diverging** — `BrBG`, `PiYG`, `PRGn`, `PuOr`, `RdBu`, `RdGy`, `RdYlBu`, `RdYlGn`, `Spectral`. Use for signed metrics (over/under target, YoY growth).
- **Qualitative** — `Set2`, `Set3`, `Pastel1`. Only for categorical (e.g. "dominant portfolio per block"), never for magnitude.

Default if unsure: `Blues` (5-class) for sanctioned amount; `RdYlGn` for variance-from-target.

## 3. Binning

Quantile binning (5 classes) is the default — robust to long-tail distributions common in grant data. Equal-interval only when the metric is known-uniform (rare). Jenks natural breaks is tempting but adds a dependency; skip.

## 4. Hover-card field menu

Per level, pick any subset. Every chosen key MUST appear in `map_metrics` response or the card shows blanks.

| Key | Label | Format | Notes |
|---|---|---|---|
| `metric` | (user-supplied, e.g. "Sanctioned") | `₹ {Cr\|L\|en-IN}` | Main metric; always shown. |
| `disbursed` | "Disbursed" | `₹ {Cr\|L\|en-IN}` | Requires `DISBURSED_FIELD` in api.py. |
| `grantees` | "Grantees" | `en-IN` | Distinct count. |
| `grants_count` | "Grants" | `en-IN` | Row count. |
| `portfolios` | "Portfolios" | chips | Top 3 by count, overflow `+N`. |
| `aspirational` | "Aspirational" | badge | State/district levels only. |
| `last_disbursed_on` | "Last disbursed" | `DD MMM YYYY` | Requires `LAST_DISBURSED_FIELD`. |

## 5. Failure modes + fixes

| Symptom | Root cause | Fix |
|---|---|---|
| Blank CHB, no error | Style field empty | Add `.map{height:520px}` to CHB Style field |
| Blank CHB, console shows `document.getElementById(...) is null` | Queried light DOM, not shadow | Use the `root` handle from `frappe.create_shadow_element` |
| State fills but clicks don't drill | Label ≠ CHB name | Rename CHB to match Workspace label; save Workspace |
| Blocks render un-styled | `preferCanvas` false | `L.map(el, {preferCanvas: true})` |
| Numbers show as `1,000,000` | `en-US` locale | `new Intl.NumberFormat('en-IN')` |
| Preet Vihar block disappears on district drill | Null `district_lgd` in source | Filter `f.properties.district_lgd != null` or hardcode `0174` |
| Wire bytes 5.7 MB for blocks | `.topojson` extension | Rename `.topojson` → `.json` (jsDelivr/CF gzip by MIME) or fix nginx `gzip_types` |
| State changes but KPI card empty | `HOVER_FIELDS` keys missing from API response | Audit `map_metrics` return dict vs. `HOVER_FIELDS` config |
| Map vanishes after Workspace save | CHB child-table sync dropped widget | Re-add via Edit → Custom HTML Block; confirm label match |
| Developer mode off, edit not reflected | v16 cache | `bench clear-cache && bench clear-website-cache` + hard reload |
| Clicks on districts/blocks do nothing after drill-down | Multiple canvas renderers stacked (someone called `L.canvas()` per layer, e.g. for a parent-state outline). Topmost canvas has `interactive: false` features; its hit-test swallows the click and the layer below never hears it | Use a single shared renderer: either rely solely on `preferCanvas: true` with no per-layer `renderer` option, OR hold one `const sharedRenderer = L.canvas()` at map init and pass it to every layer. Check: `document.querySelectorAll('.leaflet-overlay-pane canvas').length` — should be 1 |

## 6. API response shape (contract)

```json
[
  {
    "key": "23",
    "metric": 125000000,
    "disbursed": 98000000,
    "grantees": 14,
    "grants_count": 37,
    "portfolios": [{"name": "Education", "count": 20}, {"name": "Health", "count": 12}],
    "aspirational": false,
    "last_disbursed_on": "2026-03-18"
  }
]
```

`key` = LGD code at country/state level, `block_shape_id` at block level.
