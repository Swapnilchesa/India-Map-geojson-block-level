/**
 * India drill-down map (State → District → CD Block).
 * Angular 16+, standalone component, signals, OnPush.
 * Leaflet 1.9 + topojson-client 3.
 *
 * Under Angular Universal, this component checks `isPlatformBrowser` before initialising.
 */
import {
  AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Inject, Input, OnDestroy,
  PLATFORM_ID, signal, ViewChild,
} from "@angular/core";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import * as L from "leaflet";
import { feature as topoFeature } from "topojson-client";

import { PALETTES, colorFor, quantileBins, PaletteKey } from "../palettes";
import { fmtMetric, fmtByKey, MetricFormat } from "../formatting";

export type DrillLevel = "country" | "state" | "district";
export interface MapRow {
  key: string; metric: number | null; disbursed?: number | null;
  grantees?: number; grants_count?: number;
  portfolios?: { name: string; count: number }[];
  aspirational?: boolean; last_disbursed_on?: string | null;
}
export interface HoverField { key: string; label: string; }
export interface DrillContext {
  state_lgd?: string; state_name?: string; district_lgd?: string; district_name?: string;
}

@Component({
  selector: "india-drill-map",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./india-drill-map.component.html",
  styleUrl: "./india-drill-map.component.scss",
})
export class IndiaDrillMapComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) geoBase!: string;
  @Input({ required: true }) fetchRows!: (level: DrillLevel, ctx: DrillContext) => Promise<MapRow[]>;
  @Input({ required: true }) metricLabel!: string;
  @Input() metricFormat: MetricFormat = "cr";
  @Input() scheme: PaletteKey = "Blues";
  @Input() hoverFields: Record<DrillLevel, HoverField[]> = { country: [], state: [], district: [] };
  @Input() height = 520;

  @ViewChild("host", { static: true }) hostRef!: ElementRef<HTMLDivElement>;

  ctx = signal<{ level: DrillLevel } & DrillContext>({ level: "country" });
  hovered = signal<{ props: any; row: MapRow } | null>(null);

  private map?: L.Map;
  private renderer?: L.Canvas;
  private layer?: L.GeoJSON;
  private topoCache: Record<string, any> = {};
  private browser: boolean;

  PALETTES = PALETTES;
  fmtMetric = fmtMetric;
  fmtByKey = fmtByKey;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.browser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit() {
    if (!this.browser) return;
    this.map = L.map(this.hostRef.nativeElement, { preferCanvas: true, zoomControl: false, attributionControl: false })
      .setView([22.5, 80], 4);
    // One shared canvas renderer — reuse for every layer. Never call L.canvas() per layer;
    // stacked canvases in the overlay pane eat pointer events on layers beneath. See REFERENCE.md §5.
    this.renderer = L.canvas();
    this.render();
  }

  ngOnDestroy() { this.map?.remove(); }

  async render() {
    const c = this.ctx();
    const topoName = c.level === "country" ? "states" : c.level === "state" ? "districts" : "blocks";
    if (!this.topoCache[topoName]) {
      this.topoCache[topoName] = await fetch(`${this.geoBase}/${topoName}.json`).then(r => r.json());
    }
    const rows = await this.fetchRows(c.level, c);
    const topo = this.topoCache[topoName];
    let gj: any = topoFeature(topo, topo.objects[topoName]);
    if (c.level === "state")    gj.features = gj.features.filter((f: any) => f.properties.state_lgd === c.state_lgd);
    if (c.level === "district") gj.features = gj.features.filter((f: any) => f.properties.state_lgd === c.state_lgd && f.properties.district_lgd === c.district_lgd);

    const byKey: Record<string, MapRow> = Object.fromEntries(rows.map(r => [r.key, r]));
    const thr = quantileBins(rows.map(r => r.metric));
    const keyProp = c.level === "district" ? "block_shape_id" : c.level === "state" ? "district_lgd" : "state_lgd";
    const weight = c.level === "country" ? 1.5 : c.level === "state" ? 0.8 : 0.3;

    if (this.layer) this.map!.removeLayer(this.layer);
    this.layer = L.geoJSON(gj, {
      renderer: this.renderer,
      style: (f: any) => ({
        fillColor: colorFor(byKey[f.properties[keyProp]]?.metric ?? null, thr, this.scheme),
        fillOpacity: 0.85, color: "#fff", weight,
      }),
      onEachFeature: (f: any, lyr) => {
        lyr.on("mouseover", () => {
          (lyr as L.Path).setStyle({ color: "#111827", weight: 2 });
          this.hovered.set({ props: f.properties, row: byKey[f.properties[keyProp]] ?? { key: "", metric: null } });
        });
        lyr.on("mouseout",  () => this.layer?.resetStyle(lyr as any));
        lyr.on("click",     () => this.drill(f.properties));
      },
    }).addTo(this.map!);
    this.map!.fitBounds(this.layer.getBounds());
  }

  drill(props: any) {
    const c = this.ctx();
    if (c.level === "country") this.ctx.set({ level: "state", state_lgd: props.state_lgd, state_name: props.state_name });
    else if (c.level === "state") this.ctx.set({ level: "district", state_lgd: props.state_lgd, state_name: props.state_name, district_lgd: props.district_lgd, district_name: props.district_name });
    this.render();
  }
  back() {
    const c = this.ctx();
    if (c.level === "district") this.ctx.set({ level: "state", state_lgd: c.state_lgd, state_name: c.state_name });
    else if (c.level === "state") this.ctx.set({ level: "country" });
    this.render();
  }
}
