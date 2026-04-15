# Evals — frappe-chb-india-map

Markdown spec. Each case: **Prompt**, **Expected behavior**, **Rubric**. Score 0/1 per rubric bullet; pass = ≥80%.

## E1 — Clarify-before-code

**Prompt:** "Build an India map in my Frappe dashboard that shows grant amount by district."

**Expected:** Skill activates. Agent asks Phase 1 questions one at a time (drill depth, state filter, DocType+field, LGD plumbing, hover fields, scheme, delivery mode, app+workspace, perm enforcement) BEFORE writing any code. Does not assume defaults silently.

**Rubric:**
- [ ] No code in first turn
- [ ] ≥6 of 9 Phase-1 questions asked
- [ ] Questions asked serially (not a single megablock)
- [ ] Does not pick a ColorBrewer scheme without confirming metric polarity

## E2 — LGD anti-pattern flag

**Prompt:** "Join the map features on `state_name` since that's cleaner."

**Expected:** Agent refuses, names the crux (diacritics/casing collisions), points at LGD as the only join key.

**Rubric:**
- [ ] Explicitly rejects `state_name` join
- [ ] Cites diacritics or casing as why
- [ ] Reaffirms `state_lgd` / `district_lgd` / `block_shape_id` as the join keys

## E3 — Shadow DOM awareness

**Prompt:** "The map renders blank. Console says `document.getElementById('map') is null`."

**Expected:** Diagnoses as shadow-DOM scope miss. Points at `frappe.create_shadow_element` pattern and querying the `root` handle, not `document`.

**Rubric:**
- [ ] Identifies shadow DOM as the cause
- [ ] Names `frappe.create_shadow_element` or equivalent
- [ ] Provides a 1–3 line fix snippet

## E4 — ColorBrewer picker invoked

**Prompt:** "Metric is variance from target (can be negative). Pick a palette."

**Expected:** Picks a *diverging* palette (RdYlGn, RdBu, PuOr, etc.), not sequential or qualitative. Explains the default-nudge rule.

**Rubric:**
- [ ] Palette is from diverging group
- [ ] Rule explained ("signed metric → diverging")
- [ ] Mentions that diverging needs a meaningful midpoint

## E5 — Hover-field contract

**Prompt:** "Add 'Disbursed' and 'Last disbursed on' to the hover card at state level."

**Expected:** Updates `HOVER_FIELDS.state` in the CHB and confirms `DISBURSED_FIELD` + `LAST_DISBURSED_FIELD` in `api.py` are non-None. Names the contract: every HOVER_FIELDS key must exist in API response.

**Rubric:**
- [ ] Touches both files (CHB + api.py)
- [ ] States the contract explicitly
- [ ] Uses correct date format `DD MMM YYYY` / en-IN

## E6 — en-IN formatting

**Prompt:** "Numbers show as 1,000,000. Fix."

**Expected:** Replaces `Intl.NumberFormat('en-US')` with `Intl.NumberFormat('en-IN')` and/or adds `₹ Cr` / `₹ L` post-processing.

**Rubric:**
- [ ] Uses `en-IN` locale
- [ ] For amounts >1 Cr, formats as `₹ X.XX Cr` not raw integer
- [ ] Mentions `tabular-nums` for alignment

## E7 — Topojson extension fix

**Prompt:** "My `blocks.topojson` is downloading at 5.7 MB even though jsDelivr says it serves gzipped."

**Expected:** Renames `.topojson` → `.json`. Explains jsDelivr/Cloudflare gzip by MIME, derived from extension. Verifies with curl.

**Rubric:**
- [ ] Rename proposed
- [ ] Explains the MIME→gzip path
- [ ] Offers a curl verification command

## E8 — Preet Vihar edge case

**Prompt:** "One block in Delhi is missing after drill-down."

**Expected:** Identifies the null `district_lgd` for Preet Vihar. Offers two fixes: hardcode override to East Delhi (`0174`) or filter out.

**Rubric:**
- [ ] Names the block by name
- [ ] Explains null parent (Nazul has no LGD)
- [ ] Offers both fix options

## E9 — Workspace label-match

**Prompt:** "I saved the CHB but it doesn't show in the Workspace."

**Expected:** Diagnoses label ≠ CHB name. Fix: rename CHB to match the Workspace label exactly, re-add, Save+Update.

**Rubric:**
- [ ] Names the label-match rule
- [ ] Correct fix sequence
- [ ] Mentions child-table sync

## E10 — Perm enforcement question

**Prompt:** "Does my map respect Frappe role permissions?"

**Expected:** Says: raw SQL in `map_metrics` does NOT enforce perms. To enforce, switch to `frappe.get_all(..., filters=..., fields=..., group_by=...)`. Calls out the perf/correctness trade-off.

**Rubric:**
- [ ] Correct answer (raw SQL ≠ perm-enforced)
- [ ] Shows the `frappe.get_all` alternative
- [ ] Names the perf trade-off
