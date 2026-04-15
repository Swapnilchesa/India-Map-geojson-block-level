# India Map — GeoJSON / TopoJSON (block level) + multi-stack skills

LGD-keyed TopoJSON for India's State → District → CD Block hierarchy, bundled with three AI-agent skills that build drill-down maps across three very different stacks.

## What's inside

```
india-map-geojson-block-level/
├── data/
│   ├── topo/
│   │   ├── states.json       (36 features,  198 KB)
│   │   ├── districts.json    (780 features, 1.66 MB)
│   │   └── blocks.json       (6,803 features, 5.59 MB)
│   ├── version.json
│   └── README.md             — schema, install, provenance, license
├── skills/
│   ├── frappe-chb-india-map/              — Frappe v15/v16 Custom HTML Block
│   ├── powerbi-india-map/                 — Power BI (PBIP generator + manual Desktop)
│   └── react-angular-leaflet-india-map/   — React or Angular + Leaflet component
└── LICENSE                   — MIT for skills/code, ODbL-1.0 for data (see data/README.md)
```

## Skills

Each skill is self-contained under `skills/<name>/`:

- `SKILL.md` — Anthropic-style skill manifest with YAML frontmatter, trigger description, phases (Clarify → Contract → Files → Verify).
- `REFERENCE.md` — design tokens, failure-mode table, contract details.
- `reference/` — drop-in code files (Python, HTML, TS/TSX, Angular component, PBIP config, DAX).
- `evals/evals.md` — 10 test prompts + rubric per skill.

| Skill | Target | Core pattern | Path |
|---|---|---|---|
| **frappe-chb-india-map** | Frappe v15/v16 Workspace dashboard | Shadow-DOM CHB + whitelisted `map_metrics` + Leaflet canvas | `skills/frappe-chb-india-map/` |
| **powerbi-india-map** | Power BI report page | Icon Map Pro custom visual + star schema + DAX + optional PBIP generator | `skills/powerbi-india-map/` |
| **react-angular-leaflet-india-map** | Next.js / Vite-React / Angular app | Component with SSR guard + canvas Leaflet + named-import topojson-client | `skills/react-angular-leaflet-india-map/` |

Tableau is intentionally out of scope in this version.

## Installation (skills)

Place each `skills/<name>/` folder into your Claude Code / Cowork skills directory (typically `~/.claude/skills/` or `plugins/<plugin>/skills/`). Each skill's frontmatter `description:` field drives trigger matching.

## Data

See `data/README.md` for schema, install-time copy instructions, jsDelivr URLs, provenance, and known residual gaps (Preet Vihar etc.).

jsDelivr URL pattern:
```
https://cdn.jsdelivr.net/gh/Swapnilchesa/India-Map-geojson-block-level@main/data/topo/{states,districts,blocks}.json
```

Pin a tag in production (`@v1.0.0` or a short SHA) — `@main` is fine for prototypes.

## Evals

Every skill carries a `evals/evals.md` with 10 test prompts and a per-prompt rubric. Pass = ≥80% of rubric bullets. Format is intentionally markdown, not a runner — the rubric is for human review or for any eval harness you already use.

## License

- **Skill documentation + code** (`skills/`, this `README.md`, `LICENSE`) — MIT.
- **Geo data** (`data/topo/*.json`) — ODbL-1.0, derived from geoBoundaries (ODbL-1.0) and Survey of India (open). Attribution required.
