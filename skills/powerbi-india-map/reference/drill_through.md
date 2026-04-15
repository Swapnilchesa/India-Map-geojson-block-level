# Drill-through — state and district pages

Two target pages, one back-button bookmark.

## Page: `State detail`
- Hidden from report nav (right-click tab → Hide).
- Drill-through fields: `dim_state[state_lgd]`.
- Visuals: title ("State: " & state_name), KPI strip, map filtered to selected state, top-10 grantees table.
- Back button: Insert → Buttons → Back. Action → Page navigation → previous page.

## Page: `District detail`
- Hidden. Drill-through fields: `dim_district[district_lgd]`.
- Visuals: map filtered to district (blocks layer), KPI strip, top-10 grants table.
- Back button wired to `State detail`.

## Wiring

On the country-level map visual:
- Right-click field well → map → Drill through (enable).
- On click of a state polygon, Icon Map Pro emits a filter; Power BI offers "Drill through to State detail".

## Bookmarks

- `bookmark_country`, `bookmark_state`, `bookmark_district` — one per level, captured with the map zoomed and KPIs visible.
- Link breadcrumb text to bookmark navigation via "Action → Bookmark".
