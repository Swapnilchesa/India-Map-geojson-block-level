export type DrillLevel = "country" | "state" | "district";

export interface MapRow {
  key: string;
  metric: number | null;
  disbursed?: number | null;
  grantees?: number;
  grants_count?: number;
  portfolios?: { name: string; count: number }[];
  aspirational?: boolean;
  last_disbursed_on?: string | null;
}

export interface HoverField {
  key: string;
  label: string;
}

export interface DrillContext {
  state_lgd?: string;
  state_name?: string;
  district_lgd?: string;
  district_name?: string;
}
