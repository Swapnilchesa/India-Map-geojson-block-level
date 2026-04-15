# Frappe whitelisted server method — data for India drill-down map CHB.
# Copy into: apps/<app>/<app>/api.py
# CHB calls: frappe.call({method:"<app>.api.map_metrics", args:{level, state_lgd?, district_lgd?}})
#
# Edit the CONFIG block below to match your DocType schema. Every key the
# CHB's HOVER_FIELDS references must appear in the returned dicts.

import frappe
from frappe import _

# ============ CONFIG — edit these ============
GRANT_DOCTYPE        = "Grant"
STATE_LGD_FIELD      = "state_lgd"          # zero-padded string
DISTRICT_LGD_FIELD   = "district_lgd"
BLOCK_KEY_FIELD      = "block_shape_id"     # matches block_shape_id in blocks.json
METRIC_FIELD         = "sanctioned_amount"
METRIC_AGG           = "sum"                # sum | count | count_distinct | avg
GRANTEE_FIELD        = "grantee"
PORTFOLIO_FIELD      = "programme_area"
DISBURSED_FIELD      = "disbursed_amount"   # None to skip
LAST_DISBURSED_FIELD = "last_disbursed_on"  # None to skip
ASPIRATIONAL_DOCTYPE = "Aspirational District"  # None to skip
# =============================================


def _agg(field, alias):
    if METRIC_AGG == "sum":            return f"COALESCE(SUM(`{field}`),0) AS {alias}"
    if METRIC_AGG == "count":          return f"COUNT(*) AS {alias}"
    if METRIC_AGG == "count_distinct": return f"COUNT(DISTINCT `{field}`) AS {alias}"
    if METRIC_AGG == "avg":            return f"COALESCE(AVG(`{field}`),0) AS {alias}"
    raise ValueError("bad METRIC_AGG")


@frappe.whitelist()
def map_metrics(level, state_lgd=None, district_lgd=None):
    """Aggregated rows per geography at the requested level."""
    tbl = f"`tab{GRANT_DOCTYPE}`"
    conds, params = ["1=1"], {}

    if level == "country":
        group_field = STATE_LGD_FIELD
    elif level == "state":
        group_field = DISTRICT_LGD_FIELD
        conds.append(f"`{STATE_LGD_FIELD}` = %(state_lgd)s")
        params["state_lgd"] = state_lgd
    elif level == "district":
        group_field = BLOCK_KEY_FIELD
        conds.append(f"`{STATE_LGD_FIELD}` = %(state_lgd)s")
        conds.append(f"`{DISTRICT_LGD_FIELD}` = %(district_lgd)s")
        params["state_lgd"] = state_lgd
        params["district_lgd"] = district_lgd
    else:
        frappe.throw(_("Bad level"))

    where = " AND ".join(conds)
    extra = ""
    if DISBURSED_FIELD:
        extra += f", {_agg(DISBURSED_FIELD, 'disbursed')}"
    if LAST_DISBURSED_FIELD:
        extra += f", MAX(`{LAST_DISBURSED_FIELD}`) AS last_disbursed_on"

    rows = frappe.db.sql(f"""
        SELECT `{group_field}` AS `key`,
               {_agg(METRIC_FIELD, 'metric')},
               COUNT(DISTINCT `{GRANTEE_FIELD}`) AS grantees,
               COUNT(*) AS grants_count
               {extra}
        FROM {tbl}
        WHERE {where} AND `{group_field}` IS NOT NULL
        GROUP BY `{group_field}`
    """, params, as_dict=True)

    portfolios = frappe.db.sql(f"""
        SELECT `{group_field}` AS `key`, `{PORTFOLIO_FIELD}` AS name, COUNT(*) AS count
        FROM {tbl}
        WHERE {where} AND `{group_field}` IS NOT NULL AND `{PORTFOLIO_FIELD}` IS NOT NULL
        GROUP BY `{group_field}`, `{PORTFOLIO_FIELD}`
        ORDER BY count DESC
    """, params, as_dict=True)

    asp_set = set()
    if ASPIRATIONAL_DOCTYPE and level in ("state", "district"):
        try:
            asp_set = {r.district_lgd for r in frappe.get_all(
                ASPIRATIONAL_DOCTYPE, fields=["district_lgd"])}
        except Exception:
            pass

    by_key = {r["key"]: {**r, "portfolios": [], "aspirational": False} for r in rows}
    for p in portfolios:
        if p["key"] in by_key:
            by_key[p["key"]]["portfolios"].append({"name": p["name"], "count": p["count"]})

    if level == "state":
        for k, v in by_key.items():
            v["aspirational"] = k in asp_set

    return list(by_key.values())
