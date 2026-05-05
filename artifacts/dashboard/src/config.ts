import type { ChartValues, Status, Priority, DrillRisk } from "./types";

export const PALETTE = {
  bg:        "#E2D4B0",
  brown:     "#7A5230",
  dark:      "#2C2C2E",
  deepBrown: "#5C3820",
  card:      "#FFFFFF",
  border:    "#D9C9A2",
  muted:     "#8C7A5E",
  warm:      "#FAF7F0",
};

export const STATUS_STYLES: Record<Status, {
  label: string; bg: string; text: string; dot: string; selectBg: string; color: string;
}> = {
  "not-started": { label: "Not Started", bg: "bg-gray-100",  text: "text-gray-400",  dot: "bg-gray-300",  selectBg: "#f3f4f6", color: "#9ca3af" },
  "in-progress": { label: "In Progress", bg: "bg-green-50",  text: "text-green-700", dot: "bg-green-500", selectBg: "#f0fdf4", color: "#22c55e" },
  "completed":   { label: "Completed",   bg: "bg-blue-50",   text: "text-blue-700",  dot: "bg-blue-500",  selectBg: "#eff6ff", color: "#3b82f6" },
  "on-hold":     { label: "On Hold",     bg: "bg-gray-200",  text: "text-gray-600",  dot: "bg-gray-500",  selectBg: "#e5e7eb", color: "#6b7280" },
  "delayed":     { label: "Delayed",     bg: "bg-amber-50",  text: "text-amber-700", dot: "bg-amber-400", selectBg: "#fffbeb", color: "#f59e0b" },
};

export const PRIORITY_STYLES: Record<Priority, {
  label: string; bg: string; text: string; border: string; color: string;
}> = {
  p1: { label: "P1", bg: "bg-red-100",    text: "text-red-700",    border: "border-red-300",    color: "#ef4444" },
  p2: { label: "P2", bg: "bg-amber-100",  text: "text-amber-700",  border: "border-amber-300",  color: "#f59e0b" },
  p3: { label: "P3", bg: "bg-blue-100",   text: "text-blue-700",   border: "border-blue-300",   color: "#3b82f6" },
  p4: { label: "P4", bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300", color: "#8b5cf6" },
  p5: { label: "P5", bg: "bg-teal-100",   text: "text-teal-700",   border: "border-teal-300",   color: "#14b8a6" },
};

export const DRILL_RISK_CONFIG: Record<DrillRisk, {
  label: string; color: string; lightBg: string; textColor: string;
}> = {
  extreme:       { label: "Extreme",       color: "#CC0000", lightBg: "#FDECEA", textColor: "#990000" },
  high:          { label: "High",          color: "#FF8C00", lightBg: "#FFF3E0", textColor: "#B35C00" },
  moderate:      { label: "Moderate",      color: "#FFD600", lightBg: "#FFFDE7", textColor: "#8A7200" },
  low:           { label: "Low",           color: "#8DB84A", lightBg: "#F1F8E9", textColor: "#4A6B1A" },
  insignificant: { label: "Insignificant", color: "#2E7D32", lightBg: "#E8F5E9", textColor: "#1B4D1E" },
};

export const DRILL_RISK_KEYS: DrillRisk[] = ["extreme", "high", "moderate", "low", "insignificant"];

export const CAT_STYLES: Record<string, { gradFrom: string; gradTo: string }> = {
  doc:   { gradFrom: PALETTE.brown,     gradTo: PALETTE.deepBrown },
  risk:  { gradFrom: PALETTE.deepBrown, gradTo: PALETTE.dark      },
  align: { gradFrom: PALETTE.dark,      gradTo: "#1A1A1C"         },
};

export const RISK_CAT_SUGGESTIONS = ["Infrastructure", "Compliance", "Vendor", "Security", "Operational"];
export const DEFAULT_CHART: ChartValues = { extreme: 1, high: 2, moderate: 3, low: 2, insignificant: 1 };
