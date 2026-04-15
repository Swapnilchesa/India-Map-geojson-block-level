# Data model — Power BI India drill-down map

Star schema. One fact, three dims, one optional reference dim.

## Tables

### `dim_state`
| Column | Type | Notes |
|---|---|---|
| `state_lgd` | Text | PK, zero-padded ("23") |
| `state_name` | Text |  |

### `dim_district`
| Column | Type | Notes |
|---|---|---|
| `district_lgd` | Text | PK, zero-padded |
| `state_lgd` | Text | FK to dim_state |
| `district_name` | Text |  |

### `dim_block`
| Column | Type | Notes |
|---|---|---|
| `block_shape_id` | Text | PK |
| `district_lgd` | Text | FK to dim_district |
| `block_name` | Text |  |

### `dim_aspirational` (optional)
| Column | Type | Notes |
|---|---|---|
| `district_lgd` | Text | PK |
| `programme` | Text | e.g. "ADP 2018" |

### `fact_grants` (example)
| Column | Type | Notes |
|---|---|---|
| `grant_id` | Text | PK |
| `state_lgd` | Text | FK |
| `district_lgd` | Text | FK |
| `block_shape_id` | Text | FK |
| `grantee` | Text |  |
| `portfolio` | Text |  |
| `sanctioned_amount` | Decimal |  |
| `disbursed_amount` | Decimal |  |
| `date_sanctioned` | Date |  |

## Relationships

| From | To | Cardinality | Cross-filter |
|---|---|---|---|
| fact_grants[state_lgd] | dim_state[state_lgd] | Many-to-one | Single |
| fact_grants[district_lgd] | dim_district[district_lgd] | Many-to-one | Single |
| fact_grants[block_shape_id] | dim_block[block_shape_id] | Many-to-one | Single |
| fact_grants[district_lgd] | dim_aspirational[district_lgd] | Many-to-one | Single |

No dim-to-dim direct relationships.
