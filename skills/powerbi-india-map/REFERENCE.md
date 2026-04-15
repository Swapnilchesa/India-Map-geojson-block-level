# Power BI India Map — Reference

## 1. Visual choice decision tree

```
Does the report need to show block-level polygons?
├── Yes → Icon Map Pro (TopoJSON polygon support; handles 6,803 blocks on canvas)
└── No
    ├── District-level polygons? → Icon Map Pro OR Synoptic Panel (if already licensed)
    └── State-level only?
        ├── Need certified/native visual? → Shape Map (preview) with this repo's `states.json` → GeoJSON
        └── Any custom visual OK? → Icon Map Pro (future-proof for drill expansion)
```

**Why not native Shape Map at district/block:** Shape Map is preview, does not support >250 polygons performantly, and its map-region binding breaks on LGD joins where names collide. Stick to Icon Map Pro for anything past state level.

**Why not Azure Maps:** point rendering + bubble-map only; no polygon choropleth at block scale.

## 2. Data model

Star schema — one fact, three dims:

```
dim_state (state_lgd PK, state_name)
dim_district (district_lgd PK, state_lgd, district_name)
dim_block (block_shape_id PK, district_lgd, block_name)
fact_grants (grant_id, state_lgd, district_lgd, block_shape_id, grantee, portfolio, sanctioned_amount, disbursed_amount, date_sanctioned)
```

Relationships (all single-direction, many-to-one from fact → dim):
- `fact_grants[state_lgd]` → `dim_state[state_lgd]`
- `fact_grants[district_lgd]` → `dim_district[district_lgd]`
- `fact_grants[block_shape_id]` → `dim_block[block_shape_id]`

`dim_district` and `dim_block` cross-filter each other through `fact_grants` — do NOT create direct dim-to-dim relationships.

## 3. DAX patterns

```dax
-- Metric
Sanctioned :=
SUM ( fact_grants[sanctioned_amount] )

-- Metric in Cr with en-IN format
Sanctioned Cr :=
VAR v = [Sanctioned]
RETURN FORMAT ( v / 10000000, "#,##0.00\" Cr\"", "en-IN" )

-- Distinct grantees
Grantees :=
DISTINCTCOUNT ( fact_grants[grantee] )

-- Grants count
Grants :=
COUNTROWS ( fact_grants )

-- Aspirational flag (state/district)
Aspirational :=
IF (
    NOT ISBLANK ( RELATED ( dim_aspirational[district_lgd] ) ),
    "Yes", "No"
)

-- Drill-through context
Drill Level :=
SWITCH ( TRUE (),
    ISFILTERED ( dim_block[block_shape_id] ), "Block",
    ISFILTERED ( dim_district[district_lgd] ), "District",
    ISFILTERED ( dim_state[state_lgd] ), "State",
    "Country"
)
```

## 4. Theme tokens

```json
{
  "name": "India Map",
  "dataColors": ["#eff3ff","#bdd7e7","#6baed6","#3182bd","#08519c"],
  "background": "#ffffff",
  "foreground": "#111827",
  "tableAccent": "#6b7280",
  "visualStyles": {
    "*": {
      "*": {
        "title": [{ "fontFamily": "Inter", "fontSize": 11, "bold": true }],
        "labels": [{ "fontFamily": "Inter", "fontSize": 11 }],
        "values": [{ "fontFamily": "Inter", "fontSize": 12 }]
      }
    }
  }
}
```

## 5. Failure modes

| Symptom | Root cause | Fix |
|---|---|---|
| Icon Map shows blank | LGD typed as integer ("07" → 7) | Power Query: `Text.PadStart(Text.From([state_lgd]),2,"0")` |
| Drill-through filters don't apply | Target page missing drill-through field | Pages pane → target page → Drill through → add LGD field |
| Shape Map "no data to display" on districts | >250 polygons, preview limits | Switch to Icon Map Pro |
| Map loads in 15 s | Blocks TopoJSON not cached | Use jsDelivr + `@tag` pinning, or host `.json` in a CDN with gzip |
| Numbers render `$` | Theme locale `en-US` | Power BI Desktop → File → Options → Regional → `English (India)`; restart |
| Cross-filter goes state → everything | Bidirectional relationship | Set all fact→dim relationships to single-direction |
| Aspirational flag wrong at state level | `RELATED` on dim_district from fact returns first match only | Use a bridge table or replace with `CALCULATE(... FILTER(...))` |
| PBIP diff unreadable | Thin-JSON on | File → Options → Preview features → enable "Store report using TMDL" |

## 6. When to hand off to `pbip-generator`

If user provides a BRD or wireframe AND has the pbip-generator skill available, invoke it. Pass: the Phase 1 answers, a pointer to `reference/icon_map_pro_config.json`, and `reference/theme.json`. The generator scaffolds the `.pbip` directory; you then layer in the map-specific measures and visual config.
