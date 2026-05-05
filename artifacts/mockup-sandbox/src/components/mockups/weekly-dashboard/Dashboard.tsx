import { useState } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Plus, Trash2, ArrowLeft, Calendar, MessageSquare,
  ChevronRight, AlertTriangle, FileText, Users, BarChart2,
} from "lucide-react";

/* ─── Palette ─────────────────────────────────────────────────────────────── */
const P = {
  bg:       "#E2D4B0",   // sandy beige – dashboard background
  brown:    "#7A5230",   // warm medium brown
  dark:     "#2C2C2E",   // dark charcoal
  deepBrown:"#5C3820",   // dark reddish-brown
  card:     "#FFFFFF",
  cardBorder:"#D9C9A2",
  muted:    "#8C7A5E",   // muted warm text
};

/* ─── Types ────────────────────────────────────────────────────────────────── */
type Status    = "not-started" | "in-progress" | "completed" | "on-hold" | "delayed";
type Priority  = "p1" | "p2" | "p3";
type DrillRisk = "extreme" | "high" | "moderate" | "low" | "insignificant";

interface ChartValues {
  extreme: number; high: number; moderate: number; low: number; insignificant: number;
}
interface Item {
  id: string; title: string; status: Status; priority?: Priority;
  startDate: string; dueDate: string; comment: string;
  riskCategory?: string; chartValues?: ChartValues;
}
interface Category {
  id: string; name: string; icon: "doc" | "risk" | "align"; items: Item[];
}

/* ─── Status config (unchanged colours per brief) ─────────────────────────── */
const STATUS_STYLES: Record<Status, { label: string; bg: string; text: string; dot: string; selectBg: string }> = {
  "not-started": { label: "Not Started", bg: "bg-gray-100",  text: "text-gray-400",  dot: "bg-gray-300",  selectBg: "#f3f4f6" },
  "in-progress": { label: "In Progress", bg: "bg-green-50",  text: "text-green-700", dot: "bg-green-500", selectBg: "#f0fdf4" },
  "completed":   { label: "Completed",   bg: "bg-blue-50",   text: "text-blue-700",  dot: "bg-blue-500",  selectBg: "#eff6ff" },
  "on-hold":     { label: "On Hold",     bg: "bg-gray-200",  text: "text-gray-600",  dot: "bg-gray-500",  selectBg: "#e5e7eb" },
  "delayed":     { label: "Delayed",     bg: "bg-amber-50",  text: "text-amber-700", dot: "bg-amber-400", selectBg: "#fffbeb" },
};
const STATUS_CHART_COLOR: Record<Status, string> = {
  "not-started": "#d1d5db", "in-progress": "#22c55e",
  "completed":   "#3b82f6", "on-hold":     "#6b7280", "delayed": "#f59e0b",
};

/* ─── Priority config (unchanged colours) ─────────────────────────────────── */
const PRIORITY_STYLES: Record<Priority, { label: string; bg: string; text: string; border: string }> = {
  p1: { label: "P1", bg: "bg-red-100",   text: "text-red-700",   border: "border-red-300"   },
  p2: { label: "P2", bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300" },
  p3: { label: "P3", bg: "bg-blue-100",  text: "text-blue-700",  border: "border-blue-300"  },
};

/* ─── Risk chart colours — from the attached matrix palette ───────────────── */
const DRILL_RISK_CONFIG: Record<DrillRisk, { label: string; color: string; lightBg: string; textColor: string }> = {
  extreme:      { label: "Extreme",      color: "#CC0000", lightBg: "#FDECEA", textColor: "#990000" },
  high:         { label: "High",         color: "#FF8C00", lightBg: "#FFF3E0", textColor: "#B35C00" },
  moderate:     { label: "Moderate",     color: "#FFD600", lightBg: "#FFFDE7", textColor: "#8A7200" },
  low:          { label: "Low",          color: "#8DB84A", lightBg: "#F1F8E9", textColor: "#4A6B1A" },
  insignificant:{ label: "Insignificant",color: "#2E7D32", lightBg: "#E8F5E9", textColor: "#1B4D1E" },
};
const DRILL_RISK_KEYS: DrillRisk[] = ["extreme", "high", "moderate", "low", "insignificant"];

/* ─── Category accent colours (warm palette) ──────────────────────────────── */
const CAT_STYLES = {
  doc:   { gradFrom: P.brown,     gradTo: P.deepBrown, borderColor: P.brown    },
  risk:  { gradFrom: P.deepBrown, gradTo: P.dark,      borderColor: P.deepBrown },
  align: { gradFrom: P.dark,      gradTo: "#1A1A1C",   borderColor: P.dark     },
};

const RISK_CAT_SUGGESTIONS = ["Infrastructure", "Compliance", "Vendor", "Security", "Operational"];
const DEFAULT_CHART: ChartValues = { extreme: 1, high: 2, moderate: 3, low: 2, insignificant: 1 };

/* ─── Initial data ─────────────────────────────────────────────────────────── */
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

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
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

/* ─── Mini editable risk charts ─────────────────────────────────────────────── */
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
    <div className="mt-1 space-y-2 border-t pt-2" style={{ borderColor: P.cardBorder }}>
      <div className="grid grid-cols-5 gap-1 text-center">
        {DRILL_RISK_KEYS.map(k => (
          <div key={k} className="rounded-lg py-1.5" style={{ backgroundColor: DRILL_RISK_CONFIG[k].lightBg }}>
            <p className="text-[8px] font-bold uppercase tracking-wide mb-0.5" style={{ color: DRILL_RISK_CONFIG[k].textColor }}>
              {DRILL_RISK_CONFIG[k].label.slice(0, 3)}
            </p>
            <input
              type="number" min={0} max={99} value={values[k]}
              onChange={e => set(k, e.target.value)}
              className="w-full text-center text-sm font-bold bg-transparent border-none outline-none"
              style={{ color: DRILL_RISK_CONFIG[k].textColor }}
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1">
        <div>
          <p className="text-[9px] uppercase tracking-wide text-center mb-0.5" style={{ color: P.muted }}>Distribution</p>
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
            <div className="h-[90px] flex items-center justify-center text-[10px]" style={{ color: P.muted }}>No data</div>
          )}
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wide text-center mb-0.5" style={{ color: P.muted }}>Breakdown</p>
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

/* ─── Item card ─────────────────────────────────────────────────────────────── */
function ItemCard({ item, catId, onUpdate, onDelete, isRisk }: {
  item: Item; catId: string;
  onUpdate: (id: string, patch: Partial<Item>) => void;
  onDelete: (id: string) => void;
  isRisk: boolean;
}) {
  const [showCharts, setShowCharts] = useState(false);
  const st = STATUS_STYLES[item.status];
  const cs = CAT_STYLES[catId as keyof typeof CAT_STYLES];

  return (
    <div className="group relative rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
      style={{ backgroundColor: P.card, border: `1px solid ${P.cardBorder}` }}>
      {/* Top accent */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(to right, ${cs.gradFrom}, ${cs.gradTo})` }} />

      <div className="p-4 flex flex-col gap-2.5 flex-1">
        {/* Title + delete */}
        <div className="flex items-start gap-2">
          <input
            value={item.title}
            onChange={e => onUpdate(item.id, { title: e.target.value })}
            placeholder="Item title…"
            className="flex-1 text-sm font-semibold bg-transparent border-none outline-none leading-snug placeholder:text-gray-300"
            style={{ color: P.dark }}
          />
          <button
            onClick={() => onDelete(item.id)}
            className="opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 mt-0.5 hover:text-red-400"
            style={{ color: P.cardBorder }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Status + Priority */}
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
            className={`text-[11px] font-bold px-2 py-1 rounded-md border outline-none cursor-pointer appearance-none
              ${PRIORITY_STYLES[item.priority ?? "p3"].bg}
              ${PRIORITY_STYLES[item.priority ?? "p3"].text}
              ${PRIORITY_STYLES[item.priority ?? "p3"].border}`}
          >
            <option value="p1">P1</option>
            <option value="p2">P2</option>
            <option value="p3">P3</option>
          </select>
        </div>

        {/* Risk category – free-text + suggestions */}
        {isRisk && (
          <div>
            <p className="text-[9px] uppercase tracking-wide font-medium mb-0.5" style={{ color: P.muted }}>Risk Category</p>
            <input
              list="risk-cat-suggestions"
              value={item.riskCategory ?? ""}
              onChange={e => onUpdate(item.id, { riskCategory: e.target.value })}
              placeholder="Type or pick a category…"
              className="w-full text-[11px] rounded-full px-2.5 py-1 border outline-none focus:ring-1"
              style={{
                backgroundColor: "#FAF7F0",
                borderColor: P.cardBorder,
                color: P.deepBrown,
              }}
            />
            <datalist id="risk-cat-suggestions">
              {RISK_CAT_SUGGESTIONS.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
        )}

        {/* Start + Due dates */}
        <div className="grid grid-cols-2 gap-x-3">
          <div>
            <p className="text-[9px] uppercase tracking-wide font-medium mb-0.5" style={{ color: P.muted }}>Start</p>
            <div className="flex items-center gap-1" style={{ color: P.muted }}>
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <input
                type="date" value={item.startDate}
                onChange={e => onUpdate(item.id, { startDate: e.target.value })}
                className="text-[11px] bg-transparent border-none outline-none cursor-pointer w-full"
                style={{ color: P.deepBrown }}
              />
            </div>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wide font-medium mb-0.5" style={{ color: P.muted }}>Due</p>
            <div className="flex items-center gap-1" style={{ color: P.muted }}>
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <input
                type="date" value={item.dueDate}
                onChange={e => onUpdate(item.id, { dueDate: e.target.value })}
                className="text-[11px] bg-transparent border-none outline-none cursor-pointer w-full"
                style={{ color: P.deepBrown }}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center gap-1" style={{ color: P.cardBorder }}>
            <MessageSquare className="w-3 h-3" />
            <span className="text-[10px] uppercase tracking-wide font-medium" style={{ color: P.muted }}>Notes</span>
          </div>
          <textarea
            value={item.comment}
            onChange={e => onUpdate(item.id, { comment: e.target.value })}
            placeholder="Add a note or comment…"
            rows={2}
            className="w-full text-xs placeholder:text-gray-300 rounded-lg px-2.5 py-2 resize-none outline-none transition-colors leading-relaxed"
            style={{
              backgroundColor: "#FAF7F0",
              border: `1px solid ${P.cardBorder}`,
              color: P.deepBrown,
            }}
          />
        </div>

        {/* Edit charts (risk only) */}
        {isRisk && (
          <div>
            <button
              onClick={() => setShowCharts(v => !v)}
              className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors w-full justify-center"
              style={{
                backgroundColor: showCharts ? "#FFF3E0" : "#FAF7F0",
                color: showCharts ? P.brown : P.muted,
                border: `1px solid ${showCharts ? P.brown : P.cardBorder}`,
              }}
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

/* ─── Risk drill-down ────────────────────────────────────────────────────────── */
function RiskDrillDown({ items, onBack }: { items: Item[]; onBack: () => void }) {
  const totals: ChartValues = { extreme: 0, high: 0, moderate: 0, low: 0, insignificant: 0 };
  items.forEach(item => {
    const cv = item.chartValues ?? DEFAULT_CHART;
    DRILL_RISK_KEYS.forEach(k => { totals[k] += cv[k]; });
  });

  const pieData = DRILL_RISK_KEYS
    .map(k => ({ name: DRILL_RISK_CONFIG[k].label, value: totals[k], color: DRILL_RISK_CONFIG[k].color }))
    .filter(d => d.value > 0);

  const catMap: Record<string, ChartValues & { name: string }> = {};
  items.forEach(item => {
    const cat = item.riskCategory || "Uncategorised";
    if (!catMap[cat]) catMap[cat] = { name: cat, extreme: 0, high: 0, moderate: 0, low: 0, insignificant: 0 };
    const cv = item.chartValues ?? DEFAULT_CHART;
    DRILL_RISK_KEYS.forEach(k => { catMap[cat][k] += cv[k]; });
  });
  const catBarData = Object.values(catMap);

  const statusCounts = {} as Record<Status, number>;
  (Object.keys(STATUS_STYLES) as Status[]).forEach(s => { statusCounts[s] = 0; });
  items.forEach(i => { statusCounts[i.status]++; });
  const statusBarData = (Object.keys(STATUS_STYLES) as Status[])
    .filter(s => statusCounts[s] > 0)
    .map(s => ({ name: STATUS_STYLES[s].label, count: statusCounts[s], fill: STATUS_CHART_COLOR[s] }));

  return (
    <div className="min-h-screen" style={{ backgroundColor: P.bg, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="px-8 py-4 flex items-center gap-4 border-b" style={{ backgroundColor: P.dark, borderColor: "#1A1A1C" }}>
        <button onClick={onBack}
          className="flex items-center gap-2 text-sm rounded-lg px-3 py-2 transition-colors"
          style={{ backgroundColor: "#3A3A3C", color: "#E2D4B0" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#4A4A4C")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#3A3A3C")}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${P.deepBrown}, ${P.dark})` }}>
            <AlertTriangle className="w-5 h-5" style={{ color: P.bg }} />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: P.bg }}>Risk Assessment — Drill Down</h1>
            <p className="text-xs" style={{ color: P.muted }}>{items.length} items · Week of May 4–10, 2026</p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 max-w-6xl mx-auto space-y-6">
        {/* KPI tiles – 5 */}
        <div className="grid grid-cols-5 gap-3">
          {DRILL_RISK_KEYS.map(k => (
            <div key={k} className="rounded-2xl p-4 flex flex-col items-center gap-1"
              style={{ backgroundColor: DRILL_RISK_CONFIG[k].lightBg, border: `1px solid ${DRILL_RISK_CONFIG[k].color}44` }}>
              <span className="text-3xl font-black" style={{ color: DRILL_RISK_CONFIG[k].color }}>{totals[k]}</span>
              <p className="text-xs font-semibold text-center leading-tight" style={{ color: DRILL_RISK_CONFIG[k].textColor }}>
                {DRILL_RISK_CONFIG[k].label}
              </p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-5">
          <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: P.card, border: `1px solid ${P.cardBorder}` }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: P.dark }}>Risk Level Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value"
                  label={({ name, percent }) => `${name.slice(0,3)} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} items`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: P.card, border: `1px solid ${P.cardBorder}` }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: P.dark }}>Status Breakdown</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusBarData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE3CE" />
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
          <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: P.card, border: `1px solid ${P.cardBorder}` }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: P.dark }}>Risk by Category</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={catBarData} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE3CE" />
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
          <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: P.muted }}>Per-Item Risk Charts</h2>
          <div className="grid grid-cols-3 gap-4">
            {items.map(item => {
              const cv = item.chartValues ?? DEFAULT_CHART;
              const pd = DRILL_RISK_KEYS
                .map(k => ({ name: DRILL_RISK_CONFIG[k].label, value: cv[k], color: DRILL_RISK_CONFIG[k].color }))
                .filter(d => d.value > 0);
              const bd = DRILL_RISK_KEYS.map(k => ({
                name: DRILL_RISK_CONFIG[k].label.slice(0, 3), value: cv[k], fill: DRILL_RISK_CONFIG[k].color,
              }));
              return (
                <div key={item.id} className="rounded-xl p-4 space-y-3"
                  style={{ backgroundColor: P.card, border: `1px solid ${P.cardBorder}` }}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold leading-snug" style={{ color: P.dark }}>{item.title || "Untitled"}</p>
                    {item.priority && <PriorityBadge priority={item.priority} />}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={item.status} />
                    {item.riskCategory && (
                      <span className="text-xs rounded-full px-2 py-0.5" style={{ backgroundColor: "#FAF7F0", color: P.brown, border: `1px solid ${P.cardBorder}` }}>
                        {item.riskCategory}
                      </span>
                    )}
                  </div>
                  {(item.startDate || item.dueDate) && (
                    <div className="flex items-center gap-3 text-xs" style={{ color: P.muted }}>
                      {item.startDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Start: {new Date(item.startDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                      {item.dueDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Due: {new Date(item.dueDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-1 pt-1">
                    <div>
                      <p className="text-[9px] uppercase tracking-wide text-center mb-0.5" style={{ color: P.muted }}>Distribution</p>
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
                        <div className="h-[80px] flex items-center justify-center text-[10px]" style={{ color: P.muted }}>No data</div>
                      )}
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wide text-center mb-0.5" style={{ color: P.muted }}>Breakdown</p>
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

/* ─── Main dashboard ─────────────────────────────────────────────────────────── */
export function Dashboard() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [drillDown, setDrillDown] = useState<string | null>(null);

  const updateItem = (catId: string, itemId: string, patch: Partial<Item>) =>
    setCategories(prev => prev.map(c =>
      c.id === catId ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, ...patch } : i) } : c
    ));

  const deleteItem = (catId: string, itemId: string) =>
    setCategories(prev => prev.map(c =>
      c.id === catId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c
    ));

  const addItem = (catId: string) => {
    const isRisk = catId === "risk";
    setCategories(prev => prev.map(c =>
      c.id === catId ? {
        ...c, items: [...c.items, {
          id: `item-${Date.now()}`, title: "", status: "not-started", priority: "p3",
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
    <div className="min-h-screen" style={{ backgroundColor: P.bg, fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar */}
      <div className="px-8 py-4 border-b" style={{ backgroundColor: P.dark, borderColor: "#1A1A1C" }}>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: P.bg }}>Weekly Status Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: P.muted }}>Week of May 4–10, 2026</p>
      </div>

      <div className="px-8 py-6 space-y-8 max-w-7xl mx-auto">
        {categories.map(cat => {
          const cs = CAT_STYLES[cat.icon];
          const isRisk = cat.id === "risk";
          return (
            <div key={cat.id}>
              {/* Section header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${cs.gradFrom}, ${cs.gradTo})` }}>
                    <CategoryIcon icon={cat.icon} />
                  </div>
                  <h2 className="text-base font-bold" style={{ color: P.dark }}>{cat.name}</h2>
                  <span className="text-xs rounded-full px-2 py-0.5"
                    style={{ backgroundColor: "#D9C9A2", color: P.deepBrown }}>{cat.items.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isRisk && (
                    <button onClick={() => setDrillDown("risk")}
                      className="flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition-colors"
                      style={{ backgroundColor: "#FAF7F0", color: P.deepBrown, border: `1px solid ${P.brown}` }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F0E8D6")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#FAF7F0")}
                    >
                      View Analytics <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => addItem(cat.id)}
                    className="flex items-center gap-1 text-xs rounded-lg px-2.5 py-1.5 transition-colors"
                    style={{ color: P.muted }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#D9C9A2")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <Plus className="w-3.5 h-3.5" /> Add item
                  </button>
                </div>
              </div>

              {/* Card grid */}
              <div className="grid grid-cols-4 gap-4">
                {cat.items.map(item => (
                  <ItemCard
                    key={item.id} item={item} catId={cat.id}
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
