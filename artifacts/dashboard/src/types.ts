export type Status = "not-started" | "in-progress" | "completed" | "on-hold" | "delayed";
export type Priority = "p1" | "p2" | "p3" | "p4" | "p5";
export type DrillRisk = "extreme" | "high" | "moderate" | "low" | "insignificant";
export type SupportStatus = "unresolved" | "resolved";

export interface ChartValues {
  extreme: number;
  high: number;
  moderate: number;
  low: number;
  insignificant: number;
}

export interface SubChart {
  id: string;
  name: string;
  chartValues: ChartValues;
}

export interface Item {
  id: string;
  title: string;
  status: Status;
  priority?: Priority;
  startDate: string;
  dueDate: string;
  comment: string;
  riskCategory?: string;
  chartValues?: ChartValues;
  chartSummary?: string;
  subCharts?: SubChart[];
}

export interface Category {
  id: string;
  name: string;
  icon: "doc" | "risk" | "align";
  items: Item[];
}

export interface SupportItem {
  id: string;
  description: string;
  taggedItemId?: string;
  taggedCategoryId?: string;
  dateRaised: string;
  status: SupportStatus;
  resolution?: string;
}

export interface IssueItem {
  id: string;
  description: string;
  taggedItemId?: string;
  taggedCategoryId?: string;
  dateRaised: string;
  status: SupportStatus;
  resolution?: string;
}

export type PageView = "dashboard" | "support" | "filter-status" | "filter-priority";
