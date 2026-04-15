# Page layout — drill map report page

Target page: `Geographic view`. 1280×720 canvas, 16:9.

```
┌──────────────────────────────────────────────────────────────────────┐
│ Title bar: "Sanctioned — Country view"  (Map Title measure)          │
├───────────────────────────────────────────────┬──────────────────────┤
│                                               │ KPI strip (right)    │
│                                               │ ┌──────────────────┐ │
│                                               │ │ Sanctioned Cr    │ │
│                                               │ │ ₹ X.XX Cr        │ │
│                                               │ └──────────────────┘ │
│                  Icon Map Pro                 │ ┌──────────────────┐ │
│             (70% width, 80% height)           │ │ Disbursed Cr     │ │
│                                               │ │ ₹ X.XX Cr        │ │
│                                               │ └──────────────────┘ │
│                                               │ ┌──────────────────┐ │
│                                               │ │ Grantees         │ │
│                                               │ │ X,XXX            │ │
│                                               │ └──────────────────┘ │
│                                               │ ┌──────────────────┐ │
│                                               │ │ Grants           │ │
│                                               │ │ X,XXX            │ │
│                                               │ └──────────────────┘ │
├───────────────────────────────────────────────┴──────────────────────┤
│ Breadcrumb: Country › State › District    Back ← (bookmark)          │
└──────────────────────────────────────────────────────────────────────┘
```

Cross-filter confirmed: click a state on the map → KPI strip refilters. Click district → refilters. No explicit filter pane shown; use Sync Slicers if any external slicers exist.
