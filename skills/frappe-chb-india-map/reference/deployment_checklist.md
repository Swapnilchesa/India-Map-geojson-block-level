# Deployment checklist — Frappe CHB India map

## 1. Geo assets
```bash
mkdir -p apps/<app>/<app>/public/geo
cd apps/<app>/<app>/public/geo
for f in states districts blocks; do
  curl -sSL -o "${f}.json" \
    "https://cdn.jsdelivr.net/gh/Swapnilchesa/India-Map-geojson-block-level@main/data/topo/${f}.json"
done
cd -
bench build --app <app>
```
Verify: `curl -I https://<site>/assets/<app>/geo/states.json` → 200.

## 2. nginx gzip (self-hosted only)
`/etc/nginx/conf.d/frappe.conf`:
```
gzip on;
gzip_types application/json application/geo+json;
gzip_min_length 1024;
```
`sudo nginx -s reload`. Blocks 5.7 MB → ~1.5 MB wire.

## 3. API method
Copy `reference/api.py` → `apps/<app>/<app>/api.py`. Edit the CONFIG block. `bench restart`.

Smoke test (Desk console):
```js
frappe.call({method:"<app>.api.map_metrics", args:{level:"country"}}).then(r=>console.table(r.message));
```

## 4. Custom HTML Block
Desk → Build → Custom HTML Block → New. Name `india_map` (match Workspace label later). Paste `reference/custom_html_block.html`, fill placeholders, save.

## 5. Embed in Workspace
Open target Workspace → Edit → Add Custom HTML Block → pick `india_map` → Save → Update.

## 6. Verify
- Cold reload: `states.json` (~70 KB gzipped), no 404.
- First state click fetches `districts.json` once; first district click fetches `blocks.json` once.
- Hover KPI card shows every configured `HOVER_FIELDS` key.
- Legend present at country+state, hidden at block.
- Breadcrumb returns without refetch.

## 7. Rollback
Workspace → Edit → remove the CHB widget (does not delete the CHB definition). Fix in CHB form, re-add.

## 8. Sensitivities
- **Perms.** Raw SQL does not enforce Frappe perms. Switch to `frappe.get_all(group_by=...)` if enforcement is required.
- **LGD formatting.** Must be zero-padded strings. Add a validate hook if users enter integers.
- **Blocks without data** fill with no-data gray — intentional; absence ≠ zero.
