# Evals — react-angular-leaflet-india-map

Markdown spec. Each case: **Prompt**, **Expected behavior**, **Rubric**. Score 0/1 per rubric bullet; pass = ≥80%.

## E1 — SSR guard (Next.js)

**Prompt:** "I'm getting `ReferenceError: window is not defined` when building my Next.js app with the India map."

**Expected:** Identifies SSR + Leaflet. Fix: `dynamic(() => import('./IndiaDrillMap'), { ssr: false })` at the import site. Alternatively `"use client"` at top of the component. Prefers `dynamic` if the parent is a server component.

**Rubric:**
- [ ] Names SSR as cause
- [ ] Correct `dynamic({ssr:false})` snippet
- [ ] Mentions `"use client"` as the complementary directive

## E2 — Angular platform guard

**Prompt:** "Map crashes under Angular Universal with 'window is not defined'."

**Expected:** `isPlatformBrowser(PLATFORM_ID)` guard around `L.map(...)` init. Optionally `@if (browser) { <india-drill-map ...> }` to skip rendering on server.

**Rubric:**
- [ ] `PLATFORM_ID` injection
- [ ] `isPlatformBrowser` guard
- [ ] Map init deferred to browser

## E3 — Cleanup on unmount

**Prompt:** "After navigating away and back, Leaflet throws 'Map container is already initialized'."

**Expected:** Cleanup missing. React: `useEffect` return → `map.remove()`. Angular: `ngOnDestroy` → `map.remove()`.

**Rubric:**
- [ ] Identifies missing cleanup
- [ ] Framework-correct hook
- [ ] `map.remove()` call shown

## E4 — Canvas renderer

**Prompt:** "Block layer freezes my browser."

**Expected:** `preferCanvas: true` missing. Fix: `L.map(el, { preferCanvas: true })`.

**Rubric:**
- [ ] Identifies SVG-render bottleneck
- [ ] `preferCanvas: true` added
- [ ] Confirms canvas renderer suits 6,803 polygons

## E5 — Leaflet CSS import

**Prompt:** "Map div exists but nothing renders. No errors."

**Expected:** Missing `import 'leaflet/dist/leaflet.css'` → panes have zero size. Add the import to the component file (or global styles).

**Rubric:**
- [ ] Names missing CSS import
- [ ] Provides exact import line
- [ ] Alternative: adding to `angular.json` styles / `app.css`

## E6 — Tree-shake topojson-client

**Prompt:** "My bundle added 300 KB after the India map."

**Expected:** Named import: `import { feature } from 'topojson-client'`. Avoid `import * as topojson`.

**Rubric:**
- [ ] Named-import fix
- [ ] Bundle-analyzer suggestion (`rollup-plugin-visualizer` / `webpack-bundle-analyzer`)
- [ ] Confirms ~10 KB gzipped after fix

## E7 — HOVER_FIELDS contract

**Prompt:** "My hover card shows name but no disbursed amount. API returns disbursed though."

**Expected:** Checks `hoverFields[level]` includes `{ key: 'disbursed', label: 'Disbursed' }`. Contract check: API key must match.

**Rubric:**
- [ ] Checks hoverFields prop
- [ ] Verifies API key name
- [ ] Offers diff of component props vs API

## E8 — en-IN formatting

**Prompt:** "Make numbers show Indian grouping, not American."

**Expected:** `Intl.NumberFormat('en-IN')` and `₹ X.XX Cr` for amounts; `tabular-nums` for alignment.

**Rubric:**
- [ ] `en-IN` locale
- [ ] Cr/L post-processing
- [ ] `tabular-nums` CSS

## E9 — Framework comparison question

**Prompt:** "Should I pick React or Angular for this dashboard?"

**Expected:** Skill does not take a side; surfaces the framework comparison table (mount, state, fetch, SSR guard, styling, change detection). Asks what they already use.

**Rubric:**
- [ ] Does not prescribe a framework
- [ ] Surfaces comparison table
- [ ] Asks about existing stack

## E10 — Out-of-scope redirect

**Prompt:** "Build it as a Frappe CHB instead."

**Expected:** Redirects to `frappe-chb-india-map`. Notes shadow-DOM and label-match rules differ; this skill's component is not drop-in for a Frappe CHB.

**Rubric:**
- [ ] Points at sister skill
- [ ] Names differences (shadow DOM, label match)
- [ ] Does not attempt to force-fit React component into CHB
