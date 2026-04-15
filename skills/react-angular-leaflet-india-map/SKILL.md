---
name: react-angular-leaflet-india-map
description: Build a State → District → CD Block drill-down India map component in React or Angular using Leaflet + topojson-client. Trigger on "India map in React", "Angular India map", "Leaflet India drill-down", "LGD choropleth component", "block-level map React", "Next.js India map", or any request to embed an interactive India admin choropleth inside a web app. Framework-agnostic core (Leaflet API); framework-specific wrappers in React (functional component + hooks) and Angular (standalone component + signals). Covers TopoJSON loading, quantile binning, ColorBrewer palettes, en-IN formatting, shadow-DOM-free DOM rendering, SSR pitfalls, and tree-shakeable bundling. Not for Frappe CHBs (see `frappe-chb-india-map`) or Power BI (see `powerbi-india-map`). Component only — no full app scaffold.
license: MIT
---

# React / Angular + Leaflet — India drill-down map component

Drop-in component that renders a 3-level India choropleth (State → District → CD Block) in any React or Angular app. Canvas-accelerated via Leaflet's `preferCanvas`; loads 36/780/6,803-feature TopoJSON from this repo's `/data/topo/` (or jsDelivr).

## When to use

- Embedding an interactive India map inside a Next.js / Vite-React / Angular dashboard.
- Replacing a static `<img>` choropleth with a drill-hover-click component.
- Building a self-hosted analytics UI where Power BI / Frappe aren't options.

## When NOT to use

- Inside a Frappe Workspace → use `frappe-chb-india-map` (shadow DOM rules differ).
- Inside Power BI → use `powerbi-india-map`.
- You need full basemap tiles + routing + geocoding → Leaflet works but Mapbox GL / MapLibre is a better fit.
- Static pre-rendered at build time → a d3-geo SVG in an MDX file is lighter.

## Phase 1 — Clarify

1. **Framework.** React (18+ with hooks) / Angular (16+ with signals) / something else?
2. **SSR.** Next.js App Router / Pages Router / Vite SPA / Angular Universal? Leaflet requires `window`; SSR needs a guard.
3. **Drill depth.** State only / +District / +Block?
4. **Data source for the metric.** REST endpoint returning `[{key, metric, ...}]` per level — URL(s)? Or client-side JSON?
5. **Hover-card fields.** Same menu as other skills (metric, disbursed, grantees, grants_count, portfolios, aspirational, last_disbursed_on, custom).
6. **ColorBrewer scheme.** See REFERENCE.md §1 for the picker.
7. **Styling system.** Tailwind / CSS Modules / styled-components / Angular SCSS component styles?
8. **TopoJSON hosting.** jsDelivr (this repo's URL, good for prototypes) or your CDN (production).
9. **Package manager + bundler.** npm/pnpm/yarn; Vite/webpack/Next/Angular CLI. Determines how Leaflet CSS import is wired.

## Phase 2 — Implementation contract (hard rules)

- **Leaflet needs `window`.** Under SSR, wrap in `dynamic(() => import(...), { ssr: false })` (Next) or an `isPlatformBrowser` guard (Angular).
- **Canvas, not SVG.** `L.map(el, { preferCanvas: true })`. SVG crashes on the block layer.
- **Leaflet CSS must be imported.** `import 'leaflet/dist/leaflet.css'` in the component (or global styles). Missing CSS → zero-size pane, map invisible.
- **`topojson-client` is the decoder.** `feature(topo, topo.objects.states).features`. Don't try to manually decode arc arrays.
- **Join on LGD, never name.**
- **Quantile bins over 5 classes.** Long-tail-robust for grant data.
- **en-IN currency.** `Intl.NumberFormat('en-IN')` + `₹ Cr/L` post-processing.
- **No localStorage for drill state.** Keep drill level in component state; parent can persist if needed.
- **Tree-shake TopoJSON loader.** `import { feature } from 'topojson-client'` — don't bundle the full `topojson`.
- **Preet Vihar caveat** — filter null district_lgd or hardcode `0174`.
- **Dispose on unmount.** `map.remove()` in the cleanup; `ngOnDestroy` in Angular. Otherwise memory leaks after route changes.

## Phase 3 — Files to produce

The skill ships a minimal, dependency-light component in both frameworks. No full app scaffold.

### React
- `reference/react/IndiaDrillMap.tsx` — functional component, typed props, hooks. Tailwind classes.
- `reference/react/useIndiaMetrics.ts` — optional hook to fetch `[{key,metric,...}]` per level.
- `reference/react/types.ts` — `HoverField`, `DrillLevel`, `MapRow`.

### Angular
- `reference/angular/india-drill-map.component.ts` — standalone component, signals, OnPush.
- `reference/angular/india-drill-map.component.html` — template.
- `reference/angular/india-drill-map.component.scss` — styles (Tailwind-parity tokens).
- `reference/angular/india-metrics.service.ts` — injectable, `fetchMetrics(level, ctx)`.

### Shared
- `reference/palettes.ts` — 30 ColorBrewer 5-class palettes, framework-agnostic.
- `reference/formatting.ts` — `fmtMetric`, `fmtDate`, `fmtByKey`, `inEN`.
- `reference/demo.html` — runnable single-file HTML mount to verify wiring without a full app.

## Phase 4 — Verify

- `npm run dev` / `ng serve` renders the map within 2 s on cold load.
- State click drills; district click drills; breadcrumb returns without refetch.
- No console errors re: `window is not defined` (SSR guard works).
- Unmount then remount — no Leaflet "map already initialised" error (cleanup ok).
- Hover KPI card keys match `HOVER_FIELDS` prop.
- `tsc` / `ng build --configuration production` passes with no type errors.
- Bundle analyzer: `topojson-client` under 10 KB; `leaflet` ~40 KB gzipped — acceptable for dashboards.

## References

- `REFERENCE.md` — palette table, formatting tokens, SSR guide, framework comparison, failure modes.
- `reference/react/*`, `reference/angular/*`, `reference/demo.html`, `reference/palettes.ts`, `reference/formatting.ts`.
- `evals/evals.md` — 10 test prompts + rubric.

## Data asset

`../../data/topo/{states,districts,blocks}.json` — 36 / 780 / 6,803 features. Schema in `../../data/README.md`. Use via jsDelivr at prototype stage, your CDN in prod.
