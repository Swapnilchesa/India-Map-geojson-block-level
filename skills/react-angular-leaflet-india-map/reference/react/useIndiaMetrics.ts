import { useEffect, useState } from "react";
import type { DrillLevel, MapRow, DrillContext } from "./types";

/**
 * Fetch rows for the current drill level. Replace `endpoint` with your API.
 * Server must return: [{key, metric, disbursed?, grantees, grants_count, portfolios?, aspirational?, last_disbursed_on?}]
 */
export function useIndiaMetrics(endpoint: string, level: DrillLevel, ctx: DrillContext) {
  const [rows, setRows] = useState<MapRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const qs = new URLSearchParams({ level, ...(ctx.state_lgd ? { state_lgd: ctx.state_lgd } : {}),
      ...(ctx.district_lgd ? { district_lgd: ctx.district_lgd } : {}) }).toString();
    fetch(`${endpoint}?${qs}`)
      .then(r => r.json())
      .then((data: MapRow[]) => { if (!cancelled) { setRows(data); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [endpoint, level, ctx.state_lgd, ctx.district_lgd]);

  return { rows, loading };
}
