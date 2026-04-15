# India Admin Hierarchy — TopoJSON

LGD-keyed, web-optimised TopoJSON for India's three-level admin hierarchy (State → District → CD Block). Bundled with this repo so the skills under `skills/` can build drill-down maps without any external data pipeline.

## Files

| File | Features | Raw size | Wire (gzip) |
|---|---:|---:|---:|
| `topo/states.json` | 36 | 198 KB | ~70 KB |
| `topo/districts.json` | 780 | 1.66 MB | ~540 KB |
| `topo/blocks.json` | 6,803 | 5.59 MB | ~1.46 MB |

jsDelivr auto-serves gzipped when served with `application/json` MIME (which `.json` triggers by extension).

## jsDelivr URLs

```
https://cdn.jsdelivr.net/gh/Swapnilchesa/India-Map-geojson-block-level@main/data/topo/states.json
https://cdn.jsdelivr.net/gh/Swapnilchesa/India-Map-geojson-block-level@main/data/topo/districts.json
https://cdn.jsdelivr.net/gh/Swapnilchesa/India-Map-geojson-block-level@main/data/topo/blocks.json
```

Pin a tag for production: replace `@main` with `@v1.0.0` (or a short SHA).

## Attribute schema

```jsonc
// states
{ "state_name": "Madhya Pradesh", "state_lgd": "23" }

// districts
{ "state_name": "Madhya Pradesh", "state_lgd": "23",
  "district_name": "Bhopal",     "district_lgd": "433" }

// blocks
{ "block_name": "Phanda", "block_shape_id": "7132399B...",
  "state_name": "Madhya Pradesh", "state_lgd": "23",
  "district_name": "Bhopal",      "district_lgd": "433" }
```

Every block carries its full LGD parent chain. Client-side drill-down is one `.filter()` per level.

TopoJSON object names: `topo.objects.states`, `topo.objects.districts`, `topo.objects.blocks`.

## Install-time copy (recommended for production)

```bash
mkdir -p <your app>/public/geo
cd <your app>/public/geo
for f in states districts blocks; do
  curl -sSL -o "${f}.json" \
    "https://cdn.jsdelivr.net/gh/Swapnilchesa/India-Map-geojson-block-level@main/data/topo/${f}.json"
done
```

Frappe: run `bench build --app <app>` afterwards. React/Angular: place under `public/` or `assets/` and reference by relative path.

## Provenance

- **State + district geometry + LGD codes.** Survey-of-India-style shapefiles reprojected from Lambert Conformal Conic to EPSG:4326. Disputed polygons removed. `UTTAR>KHAND → UTTARAKHAND` typo fixed. State-LGD dictionary applied.
- **Block geometry.** geoBoundaries-style GeoJSON re-parented onto the above districts via centroid-in-polygon spatial join (EPSG:6933 equal-area centroids → EPSG:4326 → `sjoin` within, fallback `sjoin_nearest`).
- **Simplification.** States at ~0.01° (~1 km), districts at ~0.003° (~300 m), blocks at source resolution. Fine for dashboards; use raw shapefiles for GIS work.

## Known residual gaps

1. `Preet Vihar` block in Delhi has null `district_lgd` (parent is "Nazul", no LGD in source). Either hardcode override to East Delhi (`0174`) or filter out.
2. Newly-created districts (MP's Mauganj/Pandhurna/Maihar, Rajasthan 2023 splits) — covered in the district layer (780 districts vs geoBoundaries' 735).
3. `block_shape_id` preserved for traceability; LGD is the canonical join key.

## Version

See `version.json`. Bump on any upstream data refresh or schema change.

## License

Data is a derivative of geoBoundaries (ODbL-1.0) and Survey of India (open). Redistribution under **ODbL-1.0**. Credit: geoBoundaries + Survey of India.

Skill documentation and code under `skills/` is MIT (see root `LICENSE`).
