# React / Angular + Leaflet India Map — Reference

## 1. Palette picker

Same 30 ColorBrewer 5-class palettes as sibling skills. Source of truth: `reference/palettes.ts`.

Default-nudge:
- **Sequential** (Blues, Reds, YlGnBu, ...) — positive monotonic metric.
- **Diverging** (RdYlGn, RdBu, PuOr, ...) — signed / over-under target.
- **Qualitative** (Set2, Set3, Pastel1) — categorical (e.g. dominant portfolio).

## 2. Formatting tokens

```ts
const inEN = new Intl.NumberFormat("en-IN");
const fmtMetric = (v, fmt) => {
  if (v == null) return "—";
  if (fmt === "cr")   return `₹${(v/1e7).toFixed(2)} Cr`;
  if (fmt === "lakh") return `₹${(v/1e5).toFixed(2)} L`;
  return `₹${inEN.format(Math.round(v))}`;
};
```

CSS tokens (Tailwind-class equivalents):
- Card: `rounded-md border border-gray-200 shadow-sm p-4 bg-white`
- Label: `text-[11px] font-semibold uppercase tracking-wider text-gray-500`
- Value: `text-2xl font-semibold text-gray-900 tabular-nums`
- Stroke weights: country 1.5, state 0.8, block 0.3.

## 3. Framework comparison

| Concern | React | Angular |
|---|---|---|
| Mount | `useEffect(() => { const m = L.map(...); return () => m.remove() }, [])` | `ngAfterViewInit` + `ngOnDestroy` |
| State | `useState` / `useReducer` | `signal()` (16+) or service |
| Fetch | `useEffect` + `fetch`; or TanStack Query | `HttpClient` + RxJS / `toSignal` |
| SSR guard | Next: `dynamic(..., {ssr:false})` | `isPlatformBrowser(this.platformId)` |
| Styling | Tailwind / CSS Modules | Component SCSS (scoped) |
| Change detection | N/A (React renders on state) | `ChangeDetectionStrategy.OnPush` |

## 4. SSR pitfalls

- **Next.js App Router.** `"use client"` at top of the component file. Use `dynamic(() => import('./IndiaDrillMap'), { ssr: false })` at the import site if the parent is a server component.
- **Next.js Pages Router.** Same `dynamic({ ssr: false })` pattern at the import site.
- **Vite SPA.** No SSR; nothing to do.
- **Angular Universal.** `PLATFORM_ID` injection + `isPlatformBrowser` guard around map init. Use `@if (browser)` (control flow) to skip rendering on server.

## 5. Failure modes

| Symptom | Root cause | Fix |
|---|---|---|
| `ReferenceError: window is not defined` on build | SSR runs component | `dynamic({ssr:false})` / `isPlatformBrowser` |
| Map renders as 0×0 | Leaflet CSS not imported or container has no height | `import 'leaflet/dist/leaflet.css'` + `h-[520px]` |
| "Map container is already initialized" | Component remounted without `map.remove()` | Cleanup in `useEffect` return / `ngOnDestroy` |
| Blocks sluggish / frame drops | `preferCanvas: false` | `L.map(el, {preferCanvas: true})` |
| Hover card empty | API response missing `HOVER_FIELDS` keys | Contract check; align API to `HOVER_FIELDS` |
| State fills but click doesn't drill | Feature prop name mismatch (`state_lgd` vs `STATE_LGD`) | TopoJSON props are `state_lgd` / `district_lgd` / `block_shape_id` — lowercase |
| Numbers show `1,000,000` | `en-US` locale | `Intl.NumberFormat('en-IN')` |
| Bundle 400 KB | `import * as topojson from 'topojson-client'` | `import { feature } from 'topojson-client'` |
| Marker icons 404 | Default Leaflet icon URLs broken in bundlers | Not relevant — this map has no markers; ignore |

## 6. API contract

Same as Frappe CHB:

```json
[
  { "key": "23", "metric": 125000000, "disbursed": 98000000, "grantees": 14,
    "grants_count": 37,
    "portfolios": [{"name":"Education","count":20},{"name":"Health","count":12}],
    "aspirational": false, "last_disbursed_on": "2026-03-18" }
]
```

`key` = `state_lgd` at country, `district_lgd` at state, `block_shape_id` at district.

## 7. Package deps

```json
{
  "leaflet": "^1.9.4",
  "topojson-client": "^3.1.0",
  "@types/leaflet": "^1.9.12"
}
```

No d3, no plotly, no recharts. Component is dependency-light by design.
