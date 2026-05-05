import type { Category, SupportItem, IssueItem } from "./types";

export const initialCategories: Category[] = [
  {
    id: "doc", name: "Documentations", icon: "doc",
    items: [
      { id: "d1", title: "API Reference Docs",   status: "in-progress", priority: "p2", startDate: "2026-05-01", dueDate: "2026-05-09", comment: "" },
      { id: "d2", title: "Onboarding Guide",     status: "on-hold",     priority: "p1", startDate: "2026-05-03", dueDate: "2026-05-12", comment: "Waiting on design assets from the UX team." },
      { id: "d3", title: "Release Notes v2.4",   status: "not-started", startDate: "",  dueDate: "2026-05-16",  comment: "" },
      { id: "d4", title: "Internal Wiki Update", status: "completed",   priority: "p3", startDate: "2026-04-28", dueDate: "2026-05-05", comment: "Merged and published." },
    ],
  },
  {
    id: "risk", name: "Risk Assessments", icon: "risk",
    items: [
      {
        id: "r1", title: "Vendor Dependency", status: "on-hold", priority: "p1",
        startDate: "2026-04-28", dueDate: "2026-05-07", comment: "Awaiting vendor SLA response.",
        riskCategory: "Vendor", chartValues: { extreme: 3, high: 2, moderate: 1, low: 1, insignificant: 0 },
        subCharts: [],
      },
      {
        id: "r2", title: "Security Audit Q2", status: "in-progress", priority: "p1",
        startDate: "2026-05-01", dueDate: "2026-05-20", comment: "",
        riskCategory: "Security", chartValues: { extreme: 1, high: 3, moderate: 2, low: 1, insignificant: 0 },
        subCharts: [],
      },
      {
        id: "r3", title: "Compliance Review", status: "delayed", priority: "p2",
        startDate: "2026-04-30", dueDate: "2026-05-14", comment: "Policy update still pending.",
        riskCategory: "Compliance", chartValues: { extreme: 0, high: 2, moderate: 4, low: 2, insignificant: 1 },
        subCharts: [],
      },
      {
        id: "r4", title: "Infra Capacity Plan", status: "in-progress",
        startDate: "2026-05-02", dueDate: "2026-05-18", comment: "",
        riskCategory: "Infrastructure", chartValues: { extreme: 0, high: 1, moderate: 3, low: 3, insignificant: 2 },
        subCharts: [],
      },
      {
        id: "r5", title: "Social Media Assessment", status: "not-started", priority: "p3",
        startDate: "", dueDate: "2026-05-22", comment: "",
        riskCategory: "Operational", chartValues: { extreme: 0, high: 2, moderate: 4, low: 3, insignificant: 3 },
        subCharts: [
          { id: "sc1", name: "Instagram",  chartValues: { extreme: 0, high: 1, moderate: 2, low: 2, insignificant: 3 } },
          { id: "sc2", name: "LinkedIn",   chartValues: { extreme: 0, high: 2, moderate: 2, low: 1, insignificant: 2 } },
          { id: "sc3", name: "Twitter/X",  chartValues: { extreme: 1, high: 1, moderate: 1, low: 1, insignificant: 1 } },
        ],
      },
    ],
  },
  {
    id: "align", name: "Others", icon: "align",
    items: [
      { id: "a1", title: "Cross-Team Sync",      status: "completed",   priority: "p2", startDate: "2026-04-29", dueDate: "2026-05-05", comment: "Notes shared in Confluence." },
      { id: "a2", title: "OKR Mid-Cycle Review", status: "in-progress", priority: "p1", startDate: "2026-05-04", dueDate: "2026-05-14", comment: "" },
      { id: "a3", title: "Stakeholder Deck",     status: "not-started", startDate: "",  dueDate: "2026-05-19",  comment: "" },
    ],
  },
];

export const initialSupportItems: SupportItem[] = [
  { id: "s1", description: "Need design review for API docs layout", taggedItemId: "d1", taggedCategoryId: "doc", dateRaised: "2026-05-03", status: "not-started" },
];

export const initialIssueItems: IssueItem[] = [
  { id: "i1", description: "Onboarding guide blocked on pending UX assets", taggedItemId: "d2", taggedCategoryId: "doc", dateRaised: "2026-05-04", status: "in-progress" },
];
