// ColorBrewer 5-class palettes. Framework-agnostic.
export type PaletteKey = keyof typeof PALETTES;

export const PALETTES = {
  // Sequential single-hue
  Blues:   ["#eff3ff","#bdd7e7","#6baed6","#3182bd","#08519c"],
  Greens:  ["#edf8e9","#bae4b3","#74c476","#31a354","#006d2c"],
  Greys:   ["#f7f7f7","#cccccc","#969696","#636363","#252525"],
  Oranges: ["#feedde","#fdbe85","#fd8d3c","#e6550d","#a63603"],
  Purples: ["#f2f0f7","#cbc9e2","#9e9ac8","#756bb1","#54278f"],
  Reds:    ["#fee5d9","#fcae91","#fb6a4a","#de2d26","#a50f15"],
  // Sequential multi-hue
  BuGn:    ["#edf8fb","#b2e2e2","#66c2a4","#2ca25f","#006d2c"],
  BuPu:    ["#edf8fb","#b3cde3","#8c96c6","#8856a7","#810f7c"],
  GnBu:    ["#f0f9e8","#bae4bc","#7bccc4","#43a2ca","#0868ac"],
  OrRd:    ["#fef0d9","#fdcc8a","#fc8d59","#e34a33","#b30000"],
  PuBu:    ["#f1eef6","#bdc9e1","#74a9cf","#2b8cbe","#045a8d"],
  PuBuGn:  ["#f6eff7","#bdc9e1","#67a9cf","#1c9099","#016c59"],
  PuRd:    ["#f1eef6","#d7b5d8","#df65b0","#dd1c77","#980043"],
  RdPu:    ["#feebe2","#fbb4b9","#f768a1","#c51b8a","#7a0177"],
  YlGn:    ["#ffffcc","#c2e699","#78c679","#31a354","#006837"],
  YlGnBu:  ["#ffffcc","#a1dab4","#41b6c4","#2c7fb8","#253494"],
  YlOrBr:  ["#ffffd4","#fed98e","#fe9929","#d95f0e","#993404"],
  YlOrRd:  ["#ffffb2","#fecc5c","#fd8d3c","#f03b20","#bd0026"],
  // Diverging
  BrBG:    ["#a6611a","#dfc27d","#f5f5f5","#80cdc1","#018571"],
  PiYG:    ["#d01c8b","#f1b6da","#f7f7f7","#b8e186","#4dac26"],
  PRGn:    ["#7b3294","#c2a5cf","#f7f7f7","#a6dba0","#008837"],
  PuOr:    ["#e66101","#fdb863","#f7f7f7","#b2abd2","#5e3c99"],
  RdBu:    ["#ca0020","#f4a582","#f7f7f7","#92c5de","#0571b0"],
  RdGy:    ["#ca0020","#f4a582","#ffffff","#bababa","#404040"],
  RdYlBu:  ["#d7191c","#fdae61","#ffffbf","#abd9e9","#2c7bb6"],
  RdYlGn:  ["#d7191c","#fdae61","#ffffbf","#a6d96a","#1a9641"],
  Spectral:["#d7191c","#fdae61","#ffffbf","#abdda4","#2b83ba"],
  // Qualitative
  Set2:    ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854"],
  Set3:    ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3"],
  Pastel1: ["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6"],
} as const;

export function colorFor(value: number | null | undefined, thresholds: number[], scheme: PaletteKey = "Blues"): string {
  const pal = PALETTES[scheme] ?? PALETTES.Blues;
  if (value == null || Number.isNaN(value)) return "#f3f4f6";
  for (let i = 0; i < thresholds.length; i++) if (value <= thresholds[i]) return pal[i];
  return pal[pal.length - 1];
}

export function quantileBins(values: (number | null | undefined)[]): number[] {
  const v = values.filter((x): x is number => x != null && !Number.isNaN(x)).sort((a, b) => a - b);
  if (!v.length) return [0, 0, 0, 0];
  return [0.2, 0.4, 0.6, 0.8].map(p => v[Math.floor(p * (v.length - 1))]);
}
