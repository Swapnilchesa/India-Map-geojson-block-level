# Evals — powerbi-india-map

Markdown spec. Each case: **Prompt**, **Expected behavior**, **Rubric**. Score 0/1 per rubric bullet; pass = ≥80%.

## E1 — Visual choice gate

**Prompt:** "Build an India drill-down map in Power BI down to block level using the native Shape Map visual."

**Expected:** Refuses Shape Map at block level. Recommends Icon Map Pro with TopoJSON. Explains: Shape Map is preview, >250 polygons unperformant, LGD binding unreliable.

**Rubric:**
- [ ] Rejects native Shape Map for block level
- [ ] Names Icon Map Pro as the recommendation
- [ ] Gives at least 2 reasons

## E2 — LGD text typing

**Prompt:** "My LGD columns are imported as Whole Number. Is that fine?"

**Expected:** No. "07" truncates to 7, breaks the join silently. Shows the Power Query fix: `Text.PadStart(Text.From([state_lgd]),2,"0")`.

**Rubric:**
- [ ] Answers "no" unambiguously
- [ ] Names the zero-padding failure
- [ ] Provides the M-code fix

## E3 — Star schema discipline

**Prompt:** "Should I create a direct relationship from `dim_district` to `dim_block` so I can slice blocks by district?"

**Expected:** No. Dim-to-dim direct relationships violate star-schema discipline and create ambiguous filter propagation. They cross-filter through `fact_grants` naturally.

**Rubric:**
- [ ] Answers "no"
- [ ] Explains cross-filter through fact
- [ ] Flags ambiguity / star-schema hygiene

## E4 — PBIP vs PBIX

**Prompt:** "Ship me a .pbix file for the map."

**Expected:** Offers PBIP (TMDL + report.json) for version control; explains diff readability. PBIX is binary, unreviewable.

**Rubric:**
- [ ] Recommends PBIP
- [ ] Gives diff-readability reason
- [ ] Mentions the Desktop preview-feature toggle

## E5 — en-IN currency formatting

**Prompt:** "Amounts show as `$1,000,000` in cards."

**Expected:** (a) File → Options → Regional → English (India); (b) format string `"₹"#,##0.00,,"Cr"` divides by 10M; (c) restart Desktop.

**Rubric:**
- [ ] Regional setting fix
- [ ] Correct format string or equivalent DAX
- [ ] Mentions restart

## E6 — Cross-filter trap

**Prompt:** "I made fact→dim relationships bidirectional so filters propagate everywhere."

**Expected:** Strongly advises against. Bidirectional introduces filter ambiguity and perf hits. Single-direction from fact to dims is the default.

**Rubric:**
- [ ] Advises single-direction
- [ ] Names ambiguity or perf
- [ ] Exceptions named (e.g. bridge tables)

## E7 — Drill-through vs drill-down

**Prompt:** "I want the map to zoom into a state when I click it and show a district map."

**Expected:** Clarifies: drill-down (same-page zoom/filter) vs drill-through (navigate to target page). For a single-page map that re-filters layers, drill-down + Icon Map Pro layer visibility. For a separate state detail page, drill-through.

**Rubric:**
- [ ] Names both patterns distinctly
- [ ] Matches the pattern to the ask
- [ ] References target-page drill-through setup

## E8 — Hand-off to pbip-generator

**Prompt:** "Here's my BRD and Figma wireframe. Generate the India drill map .pbip."

**Expected:** Invokes or delegates to the `pbip-generator` skill with the right payload (BRD, metric+grain, Icon Map Pro visual config, theme.json, DAX measures list).

**Rubric:**
- [ ] Recognises pbip-generator dependency
- [ ] Passes required payload items
- [ ] Does not hand-craft XML/PBIP skeleton from scratch

## E9 — Aspirational flag DAX

**Prompt:** "Add an Aspirational Yes/No flag to the hover card at district level."

**Expected:** Adds `dim_aspirational` table, single-direction fact→dim relationship, `Aspirational` measure using `RELATED` + `ISBLANK` check.

**Rubric:**
- [ ] New dim, not a calculated column on fact
- [ ] Single-direction relationship
- [ ] Correct measure pattern

## E10 — Tableau scope refusal

**Prompt:** "Same thing but in Tableau."

**Expected:** Notes Tableau is out of scope for this skill version. Points at the repo's scope (Frappe CHB, Power BI, React/Angular+Leaflet). Offers to draft a Tableau extension if requested.

**Rubric:**
- [ ] Clearly states out-of-scope
- [ ] Names the three in-scope skills
- [ ] Offers path forward without fabricating Tableau-specific advice
