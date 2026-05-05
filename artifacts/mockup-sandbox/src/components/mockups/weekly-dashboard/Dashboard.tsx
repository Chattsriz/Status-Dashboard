import { useState } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Plus, Trash2, ArrowLeft, Calendar, MessageSquare,
  ChevronRight, AlertTriangle, FileText, Users, BarChart2,
} from "lucide-react";

/* ── Types ── */
type Status    = "not-started" | "in-progress" | "completed" | "on-hold" | "delayed";
type Priority  = "p1" | "p2" | "p3";
type DrillRisk = "extreme" | "high" | "moderate" | "low" | "insignificant";

interface ChartValues {
  extreme: number; high: number; moderate: number; low: number; insignificant: number;
}

interface Item {
  id: string;
  title: string;
  status: Status;
  priority?: Priority;
  startDate: string;
  dueDate: string;
  comment: string;
  riskCategory?: string;
  chartValues?: ChartValues;
}

interface Category {
  id: string;
  name: string;
  icon: "doc" | "risk" | "align";
  items: Item[];
}

/* ── Config ── */
const STATUS_STYLES: Record<Status, { label: string; bg: string; text: string; dot: string; selectBg: string }> = {
  "not-started": { label: "Not Started", bg: "bg-gray-100",  text: "text-gray-400",  dot: "bg-gray-300",  selectBg: "#f3f4f6" },
  "in-progress": { label: "In Progress", bg: "bg-green-50",  text: "text-green-700", dot: "bg-green-500", selectBg: "#f0fdf4" },
  "completed":   { label: "Completed",   bg: "bg-blue-50",   text: "text-blue-700",  dot: "bg-blue-500",  selectBg: "#eff6ff" },
  "on-hold":     { label: "On Hold",     bg: "bg-gray-200",  text: "text-gray-600",  dot: "bg-gray-500",  selectBg: "#e5e7eb" },
  "delayed":     { label: "Delayed",     bg: "bg-amber-50",  text: "text-amber-700", dot: "bg-amber-400", selectBg: "#fffbeb" },
};

const STATUS_CHART_COLOR: Record<Status, string> = {
  "not-started": "#d1d5db",
  "in-progress": "#22c55e",
  "completed":   "#3b82f6",
  "on-hold":     "#6b7280",
  "delayed":     "#f59e0b",
};

const PRIORITY_STYLES: Record<Priority, { label: string; bg: string; text: string; border: string }> = {
  p1: { label: "P1", bg: "bg-red-100",    text: "text-red-700",    border: "border-red-300"    },
  p2: { label: "P2", bg: "bg-amber-100",  text: "text-amber-700",  border: "border-amber-300"  },
  p3: { label: "P3", bg: "bg-blue-100",   text: "text-blue-700",   border: "border-blue-300"   },
};

const DRILL_RISK_CONFIG: Record<DrillRisk, { label: string; color: string; bg: string; text: string }> = {
  extreme:     { label: "Extreme",     color: "#b91c1c", bg: "bg-red-100",    text: "text-red-800"    },
  high:        { label: "High",        color: "#ef4444", bg: "bg-red-50",     text: "text-red-700"    },
  moderate:    { label: "Moderate",    color: "#f59e0b", bg: "bg-amber-50",   text: "text-amber-700"  },
  low:         { label: "Low",         color: "#22c55e", bg: "bg-green-50",   text: "text-green-700"  },
  insignificant:{ label: "Insignificant", color: "#94a3b8", bg: "bg-slate-100", text: "text-slate-500" },
};

const DRILL_RISK_KEYS: DrillRisk[] = ["extreme", "high", "moderate", "low", "insignificant"];

const CAT_STYLES = {
  doc:   { gradient: "from-violet-600 to-indigo-500", border: "border-l-violet-500" },
  risk:  { gradient: "from-rose-600 to-orange-500",   border: "border-l-rose-500"   },
  align: { gradient: "from-teal-600 to-cyan-500",     border: "border-l-teal-500"   },
};

const RISK_CATEGORIES = ["Infrastructure", "Compliance", "Vendor", "Security", "Operational"];

const DEFAULT_CHART: ChartValues = { extreme: 1, high: 2, moderate: 3, low: 2, insignificant: 1 };

/* ── Initial data ── */
const initialCategories: Category[] = [
  {
    id: "doc", name: "Documentation", icon: "doc",
    items: [
      { id: "d1", title: "API Reference Docs",   status: "in-progress", priority: "p2", startDate: "2026-05-01", dueDate: "2026-05-09", comment: "" },
      { id: "d2", title: "Onboarding Guide",     status: "on-hold",     priority: "p1", startDate: "2026-05-03", dueDate: "2026-05-12", comment: "Waiting on design assets from the UX team." },
      { id: "d3", title: "Release Notes v2.4",   status: "not-started", priority: "p3", startDate: "",           dueDate: "2026-05-16", comment: "" },
      { id: "d4", title: "Internal Wiki Update", status: "completed",   priority: "p3", startDate: "2026-04-28", dueDate: "2026-05-05", comment: "Merged and published." },
    ],
  },
  {
    id: "risk", name: "Risk Assessment", icon: "risk",
    items: [
      { id: "r1", title: "Vendor Dependency",   status: "on-hold",     priority: "p1", startDate: "2026-04-28", dueDate: "2026-05-07", comment: "Awaiting vendor SLA response.", riskCategory: "Vendor",         chartValues: { extreme: 3, high: 2, moderate: 1, low: 1, insignificant: 0 } },
      { id: "r2", title: "Security Audit Q2",   status: "in-progress", priority: "p1", startDate: "2026-05-01", dueDate: "2026-05-20", comment: "",                              riskCategory: "Security",       chartValues: { extreme: 1, high: 3, moderate: 2, low: 1, insignificant: 0 } },
      { id: "r3", title: "Compliance Review",   status: "delayed",     priority: "p2", startDate: "2026-04-30", dueDate: "2026-05-14", comment: "Policy update still pending.",  riskCategory: "Compliance",     chartValues: { extreme: 0, high: 2, moderate: 4, low: 2, insignificant: 1 } },
      { id: "r4", title: "Infra Capacity Plan", status: "in-progress", priority: "p2", startDate: "2026-05-02", dueDate: "2026-05-18", comment: "",                              riskCategory: "Infrastructure", chartValues: { extreme: 0, high: 1, moderate: 3, low: 3, insignificant: 2 } },
      { id: "r5", title: "Ops Runbook",         status: "not-started", priority: "p3", startDate: "",           dueDate: "2026-05-22", comment: "",                              riskCategory: "Operational",    chartValues: { extreme: 0, high: 0, moderate: 2, low: 3, insignificant: 4 } },
    ],
  },
  {
    id: "align", name: "Alignment & Others", icon: "align",
    items: [
      { id: "a1", title: "Cross-Team Sync",      status: "completed",   priority: "p2", startDate: "2026-04-29", dueDate: "2026-05-05", comment: "Notes shared in Confluence." },
      { id: "a2", title: "OKR Mid-Cycle Review", status: "in-progress", priority: "p1", startDate: "2026-05-04", dueDate: "2026-05-14", comment: "" },
      { id: "a3", title: "Stakeholder Deck",     status: "not-started", priority: "p3", startDate: "",           dueDate: "2026-05-19", comment: "" },
    ],
  },
];

/* ── Shared helpers ── */
function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const p = PRIORITY_STYLES[priority];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${p.bg} ${p.text} ${p.border}`}>
      {p.label}
    </span>
  );
}

function CategoryIcon({ icon }: { icon: "doc" | "risk" | "align" }) {
  const cls = "w-5 h-5 text-white";
  if (icon === "doc")  return <FileText className={cls} />;
  if (icon === "risk") return <AlertTriangle className={cls} />;
  return <Users className={cls} />;
}

/* ── Mini editable risk charts (on risk cards) ── */
function MiniRiskCharts({ values, onChange }: { values: ChartValues; onChange: (v: ChartValues) => void }) {
  const pieData = DRILL_RISK_KEYS
    .map(k => ({ name: DRILL_RISK_CONFIG[k].label, value: values[k], color: DRILL_RISK_CONFIG[k].color }))
    .filter(d => d.value > 0);

  const barData = DRILL_RISK_KEYS.map(k => ({
    name: DRILL_RISK_CONFIG[k].label.slice(0, 3),
    value: values[k],
    fill: DRILL_RISK_CONFIG[k].color,
  }));

  const set = (key: DrillRisk, raw: string) => {
    const n = Math.max(0, Math.min(99, parseInt(raw) || 0));
    onChange({ ...values, [key]: n });
  };

  return (
    <div className="mt-1 space-y-2 border-t border-gray-100 pt-2">
      {/* Inputs */}
      <div className="grid grid-cols-5 gap-1 text-center">
        {DRILL_RISK_KEYS.map(k => (
          <div key={k} className={`rounded-lg py-1.5 ${DRILL_RISK_CONFIG[k].bg}`}>
            <p className={`text-[8px] font-bold uppercase tracking-wide mb-0.5 ${DRILL_RISK_CONFIG[k].text}`}>
              {DRILL_RISK_CONFIG[k].label.slice(0, 3)}
            </p>
            <input
              type="number" min={0} max={99}
              value={values[k]}
              onChange={e => set(k, e.target.value)}
              className={`w-full text-center text-sm font-bold bg-transparent border-none outline-none ${DRILL_RISK_CONFIG[k].text}`}
            />
          </div>
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-2 gap-1">
        <div>
          <p className="text-[9px] text-gray-400 uppercase tracking-wide text-center mb-0.5">Distribution</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={90}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={22} outerRadius={38} paddingAngle={2} dataKey="value">
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [v]} contentStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[90px] flex items-center justify-center text-[10px] text-gray-300">No data</div>
          )}
        </div>
        <div>
          <p className="text-[9px] text-gray-400 uppercase tracking-wide text-center mb-0.5">Breakdown</p>
          <ResponsiveContainer width="100%" height={90}>
            <BarChart data={barData} barSize={10} margin={{ top: 4, right: 2, left: -30, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 10 }} />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {barData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ── Item card ── */
function ItemCard({ item, catId, onUpdate, onDelete, isRisk }: {
  item: Item;
  catId: string;
  onUpdate: (id: string, patch: Partial<Item>) => void;
  onDelete: (id: string) => void;
  isRisk: boolean;
}) {
  const [showCharts, setShowCharts] = useState(false);
  const st = STATUS_STYLES[item.status];
  const catStyle = CAT_STYLES[catId as keyof typeof CAT_STYLES];

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      <div className={`h-1 w-full bg-gradient-to-r ${catStyle.gradient}`} />

      <div className="p-4 flex flex-col gap-2.5 flex-1">
        {/* Title + priority + delete */}
        <div className="flex items-start gap-2">
          <input
            value={item.title}
            onChange={e => onUpdate(item.id, { title: e.target.value })}
            placeholder="Item title…"
            className="flex-1 text-sm font-semibold text-gray-800 bg-transparent border-none outline-none placeholder:text-gray-300 leading-snug"
          />
          <button
            onClick={() => onDelete(item.id)}
            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all flex-shrink-0 mt-0.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Status + Priority row */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={item.status}
            onChange={e => onUpdate(item.id, { status: e.target.value as Status })}
            style={{ backgroundColor: st.selectBg }}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border-none outline-none cursor-pointer appearance-none ${st.text}`}
          >
            {(Object.keys(STATUS_STYLES) as Status[]).map(s => (
              <option key={s} value={s}>{STATUS_STYLES[s].label}</option>
            ))}
          </select>

          <select
            value={item.priority ?? "p3"}
            onChange={e => onUpdate(item.id, { priority: e.target.value as Priority })}
            className={`text-[11px] font-bold px-2 py-1 rounded-md border outline-none cursor-pointer appearance-none ${
              PRIORITY_STYLES[item.priority ?? "p3"].bg
            } ${PRIORITY_STYLES[item.priority ?? "p3"].text} ${PRIORITY_STYLES[item.priority ?? "p3"].border}`}
          >
            <option value="p1">P1</option>
            <option value="p2">P2</option>
            <option value="p3">P3</option>
          </select>
        </div>

        {/* Risk category (risk only) */}
        {isRisk && (
          <select
            value={item.riskCategory ?? ""}
            onChange={e => onUpdate(item.id, { riskCategory: e.target.value })}
            className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1 outline-none cursor-pointer self-start"
          >
            <option value="">Risk category…</option>
            {RISK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        {/* Start date + Due date */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <div>
            <p className="text-[9px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">Start</p>
            <div className="flex items-center gap-1 text-gray-400">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <input
                type="date"
                value={item.startDate}
                onChange={e => onUpdate(item.id, { startDate: e.target.value })}
                className="text-[11px] text-gray-500 bg-transparent border-none outline-none cursor-pointer w-full"
              />
            </div>
          </div>
          <div>
            <p className="text-[9px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">Due</p>
            <div className="flex items-center gap-1 text-gray-400">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <input
                type="date"
                value={item.dueDate}
                onChange={e => onUpdate(item.id, { dueDate: e.target.value })}
                className="text-[11px] text-gray-500 bg-transparent border-none outline-none cursor-pointer w-full"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center gap-1 text-gray-300">
            <MessageSquare className="w-3 h-3" />
            <span className="text-[10px] uppercase tracking-wide font-medium">Notes</span>
          </div>
          <textarea
            value={item.comment}
            onChange={e => onUpdate(item.id, { comment: e.target.value })}
            placeholder="Add a note or comment…"
            rows={2}
            className="w-full text-xs text-gray-600 placeholder:text-gray-300 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-2 resize-none outline-none focus:border-gray-300 transition-colors leading-relaxed"
          />
        </div>

        {/* Edit charts button (risk only) */}
        {isRisk && (
          <div>
            <button
              onClick={() => setShowCharts(v => !v)}
              className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors w-full justify-center ${
                showCharts
                  ? "bg-rose-50 text-rose-600 border border-rose-200"
                  : "bg-gray-50 text-gray-400 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              <BarChart2 className="w-3 h-3" />
              {showCharts ? "Hide Charts" : "Edit Charts"}
            </button>
            {showCharts && (
              <MiniRiskCharts
                values={item.chartValues ?? DEFAULT_CHART}
                onChange={cv => onUpdate(item.id, { chartValues: cv })}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Risk drill-down ── */
function RiskDrillDown({ items, onBack }: { items: Item[]; onBack: () => void }) {
  // Aggregate chartValues across all items
  const totals: ChartValues = { extreme: 0, high: 0, moderate: 0, low: 0, insignificant: 0 };
  items.forEach(item => {
    const cv = item.chartValues ?? DEFAULT_CHART;
    DRILL_RISK_KEYS.forEach(k => { totals[k] += cv[k]; });
  });

  const pieData = DRILL_RISK_KEYS
    .map(k => ({ name: DRILL_RISK_CONFIG[k].label, value: totals[k], color: DRILL_RISK_CONFIG[k].color }))
    .filter(d => d.value > 0);

  // Category bar: sum chartValues per riskCategory
  const catMap: Record<string, ChartValues & { name: string }> = {};
  items.forEach(item => {
    const cat = item.riskCategory || "Uncategorised";
    if (!catMap[cat]) catMap[cat] = { name: cat, extreme: 0, high: 0, moderate: 0, low: 0, insignificant: 0 };
    const cv = item.chartValues ?? DEFAULT_CHART;
    DRILL_RISK_KEYS.forEach(k => { catMap[cat][k] += cv[k]; });
  });
  const catBarData = Object.values(catMap);

  // Status bar
  const statusCounts = {} as Record<Status, number>;
  (Object.keys(STATUS_STYLES) as Status[]).forEach(s => { statusCounts[s] = 0; });
  items.forEach(i => { statusCounts[i.status]++; });
  const statusBarData = (Object.keys(STATUS_STYLES) as Status[])
    .filter(s => statusCounts[s] > 0)
    .map(s => ({ name: STATUS_STYLES[s].label, count: statusCounts[s], fill: STATUS_CHART_COLOR[s] }));

  const kpiRows = [
    { key: "extreme" as DrillRisk,     ...DRILL_RISK_CONFIG.extreme     },
    { key: "high" as DrillRisk,        ...DRILL_RISK_CONFIG.high        },
    { key: "moderate" as DrillRisk,    ...DRILL_RISK_CONFIG.moderate    },
    { key: "low" as DrillRisk,         ...DRILL_RISK_CONFIG.low         },
    { key: "insignificant" as DrillRisk, ...DRILL_RISK_CONFIG.insignificant },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter']">
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-orange-500 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Risk Assessment — Drill Down</h1>
            <p className="text-xs text-gray-400">{items.length} items · Week of May 4–10, 2026</p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 max-w-6xl mx-auto space-y-6">
        {/* KPI row – 5 tiles */}
        <div className="grid grid-cols-5 gap-3">
          {kpiRows.map(k => (
            <div key={k.key} className={`rounded-2xl border p-4 flex flex-col items-center gap-1 ${k.bg}`}
              style={{ borderColor: k.color + "55" }}>
              <span className="text-3xl font-black" style={{ color: k.color }}>{totals[k.key]}</span>
              <p className={`text-xs font-semibold text-center leading-tight ${k.text}`}>{k.label}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Risk Level Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value"
                  label={({ name, percent }) => `${name.slice(0,3)} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} items`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Status Breakdown</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusBarData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusBarData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category stacked bar */}
        {catBarData.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Risk by Category</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={catBarData} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                {DRILL_RISK_KEYS.map(k => (
                  <Bar key={k} dataKey={k} name={DRILL_RISK_CONFIG[k].label}
                    fill={DRILL_RISK_CONFIG[k].color} radius={[3,3,0,0]} stackId="a" />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Per-item chart cards */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Per-Item Risk Charts</h2>
          <div className="grid grid-cols-3 gap-4">
            {items.map(item => {
              const cv = item.chartValues ?? DEFAULT_CHART;
              const pd = DRILL_RISK_KEYS
                .map(k => ({ name: DRILL_RISK_CONFIG[k].label, value: cv[k], color: DRILL_RISK_CONFIG[k].color }))
                .filter(d => d.value > 0);
              const bd = DRILL_RISK_KEYS.map(k => ({
                name: DRILL_RISK_CONFIG[k].label.slice(0, 3),
                value: cv[k],
                fill: DRILL_RISK_CONFIG[k].color,
              }));
              return (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-800 leading-snug">{item.title || "Untitled"}</p>
                    {item.priority && <PriorityBadge priority={item.priority} />}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={item.status} />
                    {item.riskCategory && (
                      <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-2 py-0.5">{item.riskCategory}</span>
                    )}
                  </div>
                  {(item.startDate || item.dueDate) && (
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {item.startDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Start: {new Date(item.startDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                      {item.dueDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Due: {new Date(item.dueDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-1 pt-1">
                    <div>
                      <p className="text-[9px] text-gray-400 uppercase tracking-wide text-center mb-0.5">Distribution</p>
                      {pd.length > 0 ? (
                        <ResponsiveContainer width="100%" height={80}>
                          <PieChart>
                            <Pie data={pd} cx="50%" cy="50%" innerRadius={18} outerRadius={32} paddingAngle={2} dataKey="value">
                              {pd.map((e, i) => <Cell key={i} fill={e.color} />)}
                            </Pie>
                            <Tooltip formatter={(v: number) => [v]} contentStyle={{ fontSize: 10 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[80px] flex items-center justify-center text-[10px] text-gray-300">No data</div>
                      )}
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 uppercase tracking-wide text-center mb-0.5">Breakdown</p>
                      <ResponsiveContainer width="100%" height={80}>
                        <BarChart data={bd} barSize={9} margin={{ top: 4, right: 2, left: -30, bottom: 0 }}>
                          <XAxis dataKey="name" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ fontSize: 10 }} />
                          <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                            {bd.map((e, i) => <Cell key={i} fill={e.fill} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main dashboard ── */
export function Dashboard() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [drillDown, setDrillDown] = useState<string | null>(null);

  const updateItem = (catId: string, itemId: string, patch: Partial<Item>) => {
    setCategories(prev => prev.map(c =>
      c.id === catId
        ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, ...patch } : i) }
        : c
    ));
  };

  const deleteItem = (catId: string, itemId: string) => {
    setCategories(prev => prev.map(c =>
      c.id === catId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c
    ));
  };

  const addItem = (catId: string) => {
    const isRisk = catId === "risk";
    setCategories(prev => prev.map(c =>
      c.id === catId ? {
        ...c, items: [...c.items, {
          id: `item-${Date.now()}`,
          title: "", status: "not-started", priority: "p3",
          startDate: "", dueDate: "", comment: "",
          ...(isRisk ? { riskCategory: "", chartValues: { ...DEFAULT_CHART } } : {}),
        }],
      } : c
    ));
  };

  const drillCat = categories.find(c => c.id === drillDown);
  if (drillCat?.id === "risk") {
    return <RiskDrillDown items={drillCat.items} onBack={() => setDrillDown(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter']">
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Weekly Status Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Week of May 4–10, 2026</p>
      </div>

      <div className="px-8 py-6 space-y-8 max-w-7xl mx-auto">
        {categories.map(cat => {
          const catStyle = CAT_STYLES[cat.icon];
          const isRisk = cat.id === "risk";
          return (
            <div key={cat.id}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${catStyle.gradient} flex items-center justify-center shadow-sm`}>
                    <CategoryIcon icon={cat.icon} />
                  </div>
                  <h2 className="text-base font-bold text-gray-800">{cat.name}</h2>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{cat.items.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isRisk && (
                    <button
                      onClick={() => setDrillDown("risk")}
                      className="flex items-center gap-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg px-3 py-1.5 transition-colors"
                    >
                      View Analytics <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => addItem(cat.id)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg px-2.5 py-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add item
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {cat.items.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    catId={cat.id}
                    onUpdate={(id, patch) => updateItem(cat.id, id, patch)}
                    onDelete={id => deleteItem(cat.id, id)}
                    isRisk={isRisk}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
