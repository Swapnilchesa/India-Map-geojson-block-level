// en-IN formatting, shared across React + Angular.
export const inEN = new Intl.NumberFormat("en-IN");

export type MetricFormat = "cr" | "lakh" | "enIN";

export function fmtMetric(v: number | null | undefined, fmt: MetricFormat = "cr"): string {
  if (v == null) return "—";
  if (fmt === "cr")   return `₹${(v / 1e7).toFixed(2)} Cr`;
  if (fmt === "lakh") return `₹${(v / 1e5).toFixed(2)} L`;
  return `₹${inEN.format(Math.round(v))}`;
}

export function fmtDate(s: string | null | undefined): string {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtCount(n: number | null | undefined): string {
  return inEN.format(n ?? 0);
}

export function fmtByKey(key: string, value: unknown, fmt: MetricFormat = "cr"): string {
  if (key === "metric" || key === "disbursed") return fmtMetric(value as number, fmt);
  if (key === "grantees" || key === "grants_count") return fmtCount(value as number);
  if (key === "last_disbursed_on") return fmtDate(value as string);
  if (key === "aspirational") return value ? "Yes" : "No";
  return value == null ? "—" : String(value);
}
