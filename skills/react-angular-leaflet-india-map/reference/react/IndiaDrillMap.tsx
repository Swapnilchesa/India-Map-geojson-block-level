"use client";
/**
 * India drill-down map (State → District → CD Block).
 * React 18+, Leaflet 1.9, topojson-client 3.
 *
 * IMPORTANT: Under Next.js App Router, import this component via:
 *   const IndiaDrillMap = dynamic(() => import("./IndiaDrillMap"), { ssr: false });
 * Leaflet requires `window`.
 */
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { feature as topoFeature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";

import { PALETTES, colorFor, quantileBins, type PaletteKey } from "../palettes";
import { fmtMetric, fmtByKey, type MetricFormat } from "../formatting";
import type { DrillLevel, MapRow, HoverField, DrillContext } from "./types";

export interface IndiaDrillMapProps {
  geoBase: string;                       // e.g. "https://cdn.jsdelivr.net/gh/Swapnilchesa/India-Map-geojson-block-level@main/data/topo"
  fetchRows: (level: DrillLevel, ctx: DrillContext) => Promise<MapRow[]>;
  metricLabel: string;                   // "Sanctioned"
  metricFormat?: MetricFormat;           // "cr"
  scheme?: PaletteKey;                   // "Blues"
  hoverFields: Record<DrillLevel, HoverField[]>;
  height?: number;                       // 520
}

export default function IndiaDrillMap({
  geoBase, fetchRows, metricLabel, metricFormat = "cr", scheme = "Blues", hoverFields, height = 520
}: IndiaDrillMapProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const rendererRef = useRef<L.Canvas | null>(null);
  const layerRef = useRef<L.GeoJSON | null>(null);
  const topoCache = useRef<Record<string, Topology>>({});
  const [ctx, setCtx] = useState<{ level: DrillLevel } & DrillContext>({ level: "country" });
  const [hovered, setHovered] = useState<{ props: any; row: MapRow } | null>(null);

  useEffect(() => {
    if (!hostRef.current || mapRef.current) return;
    mapRef.current = L.map(hostRef.current, { preferCanvas: true, zoomControl: false, attributionControl: false })
      .setView([22.5, 80], 4);
    // One shared canvas renderer, reused across every layer. Never call L.canvas() per layer —
    // stacked canvases in the overlay pane swallow pointer events on layers beneath. See REFERENCE.md §5.
    rendererRef.current = L.canvas();
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    let cancelled = false;
    (async () => {
      const topoName = ctx.level === "country" ? "states" : ctx.level === "state" ? "districts" : "blocks";
      if (!topoCache.current[topoName]) {
        topoCache.current[topoName] = await fetch(`${geoBase}/${topoName}.json`).then(r => r.json());
      }
      const rows = await fetchRows(ctx.level, ctx);
      if (cancelled) return;

      const topo = topoCache.current[topoName];
      const objName = topoName;
      let gj = topoFeature(topo, topo.objects[objName] as GeometryCollection) as GeoJSON.FeatureCollection;
      if (ctx.level === "state")    gj.features = gj.features.filter((f: any) => f.properties.state_lgd === ctx.state_lgd);
      if (ctx.level === "district") gj.features = gj.features.filter((f: any) => f.properties.state_lgd === ctx.state_lgd && f.properties.district_lgd === ctx.district_lgd);

      const byKey: Record<string, MapRow> = Object.fromEntries(rows.map(r => [r.key, r]));
      const thr = quantileBins(rows.map(r => r.metric));
      const keyProp = ctx.level === "district" ? "block_shape_id" : ctx.level === "state" ? "district_lgd" : "state_lgd";
      const weight = ctx.level === "country" ? 1.5 : ctx.level === "state" ? 0.8 : 0.3;

      if (layerRef.current) mapRef.current!.removeLayer(layerRef.current);
      layerRef.current = L.geoJSON(gj, {
        renderer: rendererRef.current!,
        style: (f: any) => ({
          fillColor: colorFor(byKey[f.properties[keyProp]]?.metric ?? null, thr, scheme),
          fillOpacity: 0.85, color: "#fff", weight
        }),
        onEachFeature: (f: any, lyr) => {
          lyr.on("mouseover", () => {
            (lyr as L.Path).setStyle({ color: "#111827", weight: 2 });
            (lyr as any).bringToFront?.();
            setHovered({ props: f.properties, row: byKey[f.properties[keyProp]] ?? { key: "", metric: null } });
          });
          lyr.on("mouseout", () => { layerRef.current?.resetStyle(lyr as any); });
          lyr.on("click", () => drill(f.properties));
        }
      }).addTo(mapRef.current!);
      mapRef.current!.fitBounds(layerRef.current.getBounds());
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.level, ctx.state_lgd, ctx.district_lgd]);

  function drill(props: any) {
    if (ctx.level === "country") setCtx({ level: "state",    state_lgd: props.state_lgd, state_name: props.state_name });
    else if (ctx.level === "state") setCtx({ level: "district", state_lgd: props.state_lgd, state_name: props.state_name, district_lgd: props.district_lgd, district_name: props.district_name });
  }
  function back() {
    if (ctx.level === "district") setCtx({ level: "state", state_lgd: ctx.state_lgd, state_name: ctx.state_name });
    else if (ctx.level === "state") setCtx({ level: "country" });
  }

  const fields = hoverFields[ctx.level] ?? [];

  return (
    <div className="relative rounded-md overflow-hidden border border-gray-200 bg-white" style={{ height }}>
      <div ref={hostRef} className="absolute inset-0" />
      <button onClick={back} className="absolute top-3 left-3 bg-white border border-gray-200 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
        {ctx.level === "country" ? "India" :
         ctx.level === "state"   ? `India / ${ctx.state_name}` :
                                    `India / ${ctx.state_name} / ${ctx.district_name}`}
      </button>
      {hovered && (
        <div className="absolute top-3 right-3 w-64 bg-white border border-gray-200 rounded-md shadow-sm p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{ctx.level}</div>
          <div className="text-2xl font-semibold text-gray-900 tabular-nums mt-1">
            {hovered.props.block_name ?? hovered.props.district_name ?? hovered.props.state_name}
          </div>
          {fields.map(f => (
            f.key === "portfolios" ? (
              <div key="portfolios" className="mt-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{f.label}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(hovered.row.portfolios ?? []).slice(0, 3).map(p => (
                    <span key={p.name} className="text-[11px] font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{p.name}</span>
                  ))}
                  {(hovered.row.portfolios ?? []).length > 3 && (
                    <span className="text-[11px] font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-full">+{(hovered.row.portfolios?.length ?? 0) - 3}</span>
                  )}
                </div>
              </div>
            ) : (
              <div key={f.key} className="flex justify-between mt-2 text-sm text-gray-700">
                <span>{f.label}</span>
                <b className="tabular-nums">{fmtByKey(f.key, (hovered.row as any)[f.key], metricFormat)}</b>
              </div>
            )
          ))}
        </div>
      )}
      {ctx.level !== "district" && (
        <div className="absolute bottom-3 left-3 bg-white border border-gray-200 rounded-md p-2 text-[11px]">
          <div className="text-gray-500 font-semibold uppercase tracking-wider mb-1">{metricLabel}</div>
          <div className="flex flex-col gap-0.5">
            {PALETTES[scheme].map((c, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="inline-block w-3.5 h-2.5" style={{ background: c }} />
                <span className="text-gray-700">{i === 0 ? "≤ " : ""}{fmtMetric(i < 4 ? 0 : null, metricFormat)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
