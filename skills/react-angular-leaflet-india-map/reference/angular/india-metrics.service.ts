import { Injectable } from "@angular/core";
import type { DrillLevel, DrillContext, MapRow } from "./india-drill-map.component";

/**
 * Example service. Replace the endpoint + auth with your app's pattern
 * (HttpClient interceptor, NgRx effect, etc.).
 */
@Injectable({ providedIn: "root" })
export class IndiaMetricsService {
  constructor() {}

  async fetchMetrics(endpoint: string, level: DrillLevel, ctx: DrillContext): Promise<MapRow[]> {
    const qs = new URLSearchParams({
      level,
      ...(ctx.state_lgd ? { state_lgd: ctx.state_lgd } : {}),
      ...(ctx.district_lgd ? { district_lgd: ctx.district_lgd } : {}),
    }).toString();
    const res = await fetch(`${endpoint}?${qs}`);
    if (!res.ok) throw new Error(`metrics fetch failed: ${res.status}`);
    return res.json();
  }
}
