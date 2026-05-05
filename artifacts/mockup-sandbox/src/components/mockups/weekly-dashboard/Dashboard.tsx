import { useState } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Plus, Trash2, ArrowLeft, Calendar, MessageSquare,
  ChevronRight, AlertTriangle, FileText, Users, BarChart2,
} from "lucide-react";

type Status = "not-started" | "in-progress" | "completed" | "on-hold" | "delayed";
type RiskLevel = "high" | "medium" | "low";

interface ChartValues { high: number; medium: number; low: number }

interface Item {
  id: string;
  title: string;
  status: Status;
  dueDate: string;
  comment: string;
  riskLevel?: RiskLevel;
  riskCategory?: string;
  chartValues?: ChartValues;
}

interface Category {
  id: string;
  name: string;
  icon: "doc" | "risk" | "align";
  items: Item[];
}

const STATUS_STYLES: Record<Status, { label: string; bg: string; text: string; dot: string; selectBg: string }> = {
  "not-started": { label: "Not Started", bg: "bg-gray-100",    text: "text-gray-400",   dot: "bg-gray-300",  selectBg: "#f3f4f6" },
  "in-progress": { label: "In Progress", bg: "bg-green-50",    text: "text-green-700",  dot: "bg-green-500", selectBg: "#f0fdf4" },
  "completed":   { label: "Completed",   bg: "bg-blue-50",     text: "text-blue-700",   dot: "bg-blue-500",  selectBg: "#eff6ff" },
  "on-hold":     { label: "On Hold",     bg: "bg-gray-200",    text: "text-gray-600",   dot: "bg-gray-500",  selectBg: "#e5e7eb" },
  "delayed":     { label: "Delayed",     bg: "bg-amber-50",    text: "text-amber-700",  dot: "bg-amber-400", selectBg: "#fffbeb" },
};

const STATUS_CHART_COLOR: Record<Status, string> = {
  "not-started": "#d1d5db",
  "in-progress": "#22c55e",
  "completed":   "#3b82f6",
  "on-hold":     "#6b7280",
  "delayed":     "#f59e0b",
};

const RISK_STYLES: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  high:   { label: "High",   color: "#ef4444", bg: "bg-red-100 text-red-700"     },
  medium: { label: "Medium", color: "#f59e0b", bg: "bg-amber-100 text-amber-700" },
  low:    { label: "Low",    color: "#22c55e", bg: "bg-green-100 text-green-700"  },
};

const RISK_COLORS = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };

const CAT_STYLES = {
  doc:   { gradient: "from-violet-600 to-indigo-500", border: "border-l-violet-500"  },
  risk:  { gradient: "from-rose-600 to-orange-500",   border: "border-l-rose-500"    },
  align: { gradient: "from-teal-600 to-cyan-500",     border: "border-l-teal-500"    },
};

const RISK_CATEGORIES = ["Infrastructure", "Compliance", "Vendor", "Security", "Operational"];

const DEFAULT_CHART: ChartValues = { high: 2, medium: 3, low: 1 };

const initialCategories: Category[] = [
  {
    id: "doc", name: "Documentation", icon: "doc",
    items: [
      { id: "d1", title: "API Reference Docs",   status: "in-progress", dueDate: "2026-05-09", comment: "" },
      { id: "d2", title: "Onboarding Guide",     status: "on-hold",     dueDate: "2026-05-12", comment: "Waiting on design assets from the UX team." },
      { id: "d3", title: "Release Notes v2.4",   status: "not-started", dueDate: "2026-05-16", comment: "" },
      { id: "d4", title: "Internal Wiki Update", status: "completed",   dueDate: "2026-05-05", comment: "Merged and published." },
    ],
  },
  {
    id: "risk", name: "Risk Assessment", icon: "risk",
    items: [
      { id: "r1", title: "Vendor Dependency",   status: "on-hold",     dueDate: "2026-05-07", comment: "Awaiting vendor SLA response.", riskLevel: "high",   riskCategory: "Vendor",         chartValues: { high: 4, medium: 2, low: 1 } },
      { id: "r2", title: "Security Audit Q2",   status: "in-progress", dueDate: "2026-05-20", comment: "",                              riskLevel: "high",   riskCategory: "Security",       chartValues: { high: 3, medium: 4, low: 2 } },
      { id: "r3", title: "Compliance Review",   status: "delayed",     dueDate: "2026-05-14", comment: "Policy update still pending.",  riskLevel: "medium", riskCategory: "Compliance",     chartValues: { high: 1, medium: 5, low: 3 } },
      { id: "r4", title: "Infra Capacity Plan", status: "in-progress", dueDate: "2026-05-18", comment: "",                              riskLevel: "medium", riskCategory: "Infrastructure", chartValues: { high: 2, medium: 3, low: 4 } },
      { id: "r5", title: "Ops Runbook",         status: "not-started", dueDate: "2026-05-22", comment: "",                              riskLevel: "low",    riskCategory: "Operational",    chartValues: { high: 0, medium: 2, low: 5 } },
    ],
  },
  {
    id: "align", name: "Alignment & Others", icon: "align",
    items: [
      { id: "a1", title: "Cross-Team Sync",      status: "completed",   dueDate: "2026-05-05", comment: "Notes shared in Confluence." },
      { id: "a2", title: "OKR Mid-Cycle Review", status: "in-progress", dueDate: "2026-05-14", comment: "" },
      { id: "a3", title: "Stakeholder Deck",     status: "not-started", dueDate: "2026-05-19", comment: "" },
    ],
  },
];

/* ── helpers ── */

function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function CategoryIcon({ icon }: { icon: "doc" | "risk" | "align" }) {
  const cls = "w-5 h-5 text-white";
  if (icon === "doc")  return <FileText className={cls} />;
  if (icon === "risk") return <AlertTriangle className={cls} />;
  return <Users className={cls} />;
}

/* ── Mini editable chart for risk cards ── */
function MiniRiskCharts({
  values,
  onChange,
}: {
  values: ChartValues;
  onChange: (v: ChartValues) => void;
}) {
  const pieData = (["high", "medium", "low"] as RiskLevel[])
    .map(k => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: values[k], color: RISK_COLORS[k] }))
    .filter(d => d.value > 0);

  const barData = [
    { name: "H", value: values.high,   fill: RISK_COLORS.high   },
    { name: "M", value: values.medium, fill: RISK_COLORS.medium },
    { name: "L", value: values.low,    fill: RISK_COLORS.low    },
  ];

  const set = (key: keyof ChartValues, raw: string) => {
    const n = Math.max(0, Math.min(99, parseInt(raw) || 0));
    onChange({ ...values, [key]: n });
  };

  return (
    <div className="mt-1 space-y-2">
      {/* Editable inputs */}
      <div className="grid grid-cols-3 gap-1 text-center">
        {(["high", "medium", "low"] as RiskLevel[]).map(k => (
          <div key={k} className={`rounded-lg px-1.5 py-1.5 ${RISK_STYLES[k].bg}`}>
            <p className="text-[9px] font-bold uppercase tracking-wide opacity-70 mb-0.5">{RISK_STYLES[k].label}</p>
            <input
              type="number"
              min={0}
              max={99}
              value={values[k]}
              onChange={e => set(k, e.target.value)}
              className="w-full text-center text-sm font-bold bg-transparent border-none outline-none"
            />
          </div>
        ))}
      </div>

      {/* Charts side-by-side */}
      <div className="grid grid-cols-2 gap-1">
        {/* Pie */}
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
        {/* Bar */}
        <div>
          <p className="text-[9px] text-gray-400 uppercase tracking-wide text-center mb-0.5">Breakdown</p>
          <ResponsiveContainer width="100%" height={90}>
            <BarChart data={barData} barSize={14} margin={{ top: 4, right: 2, left: -28, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
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
function ItemCard({
  item, catId, onUpdate, onDelete, isRisk,
}: {
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

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Title + delete */}
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

        {/* Status */}
        <select
          value={item.status}
          onChange={e => onUpdate(item.id, { status: e.target.value as Status })}
          style={{ backgroundColor: st.selectBg }}
          className={`self-start text-[11px] font-semibold px-2.5 py-1 rounded-full border-none outline-none cursor-pointer appearance-none ${st.text}`}
        >
          {(Object.keys(STATUS_STYLES) as Status[]).map(s => (
            <option key={s} value={s}>{STATUS_STYLES[s].label}</option>
          ))}
        </select>

        {/* Risk level + category */}
        {isRisk && (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={item.riskLevel ?? "low"}
              onChange={e => onUpdate(item.id, { riskLevel: e.target.value as RiskLevel })}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border-none outline-none cursor-pointer appearance-none ${RISK_STYLES[item.riskLevel ?? "low"].bg}`}
            >
              {(Object.keys(RISK_STYLES) as RiskLevel[]).map(r => (
                <option key={r} value={r}>{RISK_STYLES[r].label} Risk</option>
              ))}
            </select>
            <select
              value={item.riskCategory ?? ""}
              onChange={e => onUpdate(item.id, { riskCategory: e.target.value })}
              className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2 py-1 outline-none cursor-pointer"
            >
              <option value="">Category…</option>
              {RISK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        {/* Due date */}
        <div className="flex items-center gap-1.5 text-gray-400">
          <Calendar className="w-3 h-3 flex-shrink-0" />
          <input
            type="date"
            value={item.dueDate}
            onChange={e => onUpdate(item.id, { dueDate: e.target.value })}
            className="text-[11px] text-gray-500 bg-transparent border-none outline-none cursor-pointer"
          />
        </div>

        {/* Comment */}
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

        {/* Editable charts toggle (risk only) */}
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
  const high   = items.filter(i => i.riskLevel === "high").length;
  const medium = items.filter(i => i.riskLevel === "medium").length;
  const low    = items.filter(i => i.riskLevel === "low").length;

  const pieData = [
    { name: "High",   value: high,   color: "#ef4444" },
    { name: "Medium", value: medium, color: "#f59e0b" },
    { name: "Low",    value: low,    color: "#22c55e" },
  ].filter(d => d.value > 0);

  const catMap: Record<string, { high: number; medium: number; low: number }> = {};
  items.forEach(item => {
    const cat = item.riskCategory || "Uncategorised";
    if (!catMap[cat]) catMap[cat] = { high: 0, medium: 0, low: 0 };
    catMap[cat][item.riskLevel ?? "low"]++;
  });
  const barData = Object.entries(catMap).map(([name, v]) => ({ name, ...v }));

  const statusCounts = {} as Record<Status, number>;
  (Object.keys(STATUS_STYLES) as Status[]).forEach(s => { statusCounts[s] = 0; });
  items.forEach(i => { statusCounts[i.status]++; });
  const statusBarData = (Object.keys(STATUS_STYLES) as Status[])
    .filter(s => statusCounts[s] > 0)
    .map(s => ({ name: STATUS_STYLES[s].label, count: statusCounts[s], fill: STATUS_CHART_COLOR[s] }));

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
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "High Risk",   value: high,   color: "text-red-600",   bg: "bg-red-50",   border: "border-red-200"   },
            { label: "Medium Risk", value: medium, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
            { label: "Low Risk",    value: low,    color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
          ].map(k => (
            <div key={k.label} className={`rounded-2xl border ${k.border} ${k.bg} p-5 flex items-center gap-4`}>
              <span className={`text-4xl font-black ${k.color}`}>{k.value}</span>
              <div>
                <p className={`text-sm font-semibold ${k.color}`}>{k.label}</p>
                <p className="text-xs text-gray-400">items</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Risk Level Distribution</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} items`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Status Breakdown</h2>
            <ResponsiveContainer width="100%" height={240}>
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

        {/* Category breakdown */}
        {barData.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Risk by Category</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="high"   name="High"   fill="#ef4444" radius={[3,3,0,0]} stackId="a" />
                <Bar dataKey="medium" name="Medium" fill="#f59e0b" radius={[3,3,0,0]} stackId="a" />
                <Bar dataKey="low"    name="Low"    fill="#22c55e" radius={[3,3,0,0]} stackId="a" />
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
              const pd = (["high", "medium", "low"] as RiskLevel[])
                .map(k => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: cv[k], color: RISK_COLORS[k] }))
                .filter(d => d.value > 0);
              const bd = [
                { name: "H", value: cv.high,   fill: RISK_COLORS.high   },
                { name: "M", value: cv.medium, fill: RISK_COLORS.medium },
                { name: "L", value: cv.low,    fill: RISK_COLORS.low    },
              ];
              return (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-800 leading-snug">{item.title || "Untitled"}</p>
                    {item.riskLevel && (
                      <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${RISK_STYLES[item.riskLevel].bg}`}>
                        {RISK_STYLES[item.riskLevel].label}
                      </span>
                    )}
                  </div>
                  <StatusBadge status={item.status} />
                  {item.riskCategory && <p className="text-xs text-gray-400">{item.riskCategory}</p>}

                  {/* Mini charts */}
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
                      <p className="text-[9px] text-gray-400 uppercase tracking-wide text-center mb-0.5">H / M / L</p>
                      <ResponsiveContainer width="100%" height={80}>
                        <BarChart data={bd} barSize={12} margin={{ top: 4, right: 2, left: -30, bottom: 0 }}>
                          <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
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
          title: "", status: "not-started", dueDate: "", comment: "",
          ...(isRisk ? { riskLevel: "low" as RiskLevel, riskCategory: "", chartValues: { ...DEFAULT_CHART } } : {}),
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
