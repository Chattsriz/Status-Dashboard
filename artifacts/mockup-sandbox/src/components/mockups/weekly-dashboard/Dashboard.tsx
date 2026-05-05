import { useState } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Plus, Trash2, ArrowLeft, Calendar, MessageSquare, ChevronRight, AlertTriangle, FileText, Users } from "lucide-react";

type Status = "on-track" | "at-risk" | "delayed" | "complete" | "not-started";
type RiskLevel = "high" | "medium" | "low";

interface Item {
  id: string;
  title: string;
  status: Status;
  dueDate: string;
  comment: string;
  riskLevel?: RiskLevel;
  riskCategory?: string;
}

interface Category {
  id: string;
  name: string;
  icon: "doc" | "risk" | "align";
  items: Item[];
}

const STATUS_STYLES: Record<Status, { label: string; bg: string; text: string; dot: string }> = {
  "on-track":    { label: "On Track",    bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500" },
  "at-risk":     { label: "At Risk",     bg: "bg-amber-50",    text: "text-amber-700",   dot: "bg-amber-400"  },
  "delayed":     { label: "Delayed",     bg: "bg-red-50",      text: "text-red-700",     dot: "bg-red-500"    },
  "complete":    { label: "Complete",    bg: "bg-blue-50",     text: "text-blue-700",    dot: "bg-blue-500"   },
  "not-started": { label: "Not Started", bg: "bg-gray-100",    text: "text-gray-500",    dot: "bg-gray-400"   },
};

const RISK_STYLES: Record<RiskLevel, { label: string; color: string; bg: string; bar: string }> = {
  high:   { label: "High",   color: "#ef4444", bg: "bg-red-100 text-red-700",     bar: "#ef4444" },
  medium: { label: "Medium", color: "#f59e0b", bg: "bg-amber-100 text-amber-700", bar: "#f59e0b" },
  low:    { label: "Low",    color: "#22c55e", bg: "bg-green-100 text-green-700",  bar: "#22c55e" },
};

const CAT_STYLES = {
  doc:   { gradient: "from-violet-600 to-indigo-500",  light: "bg-violet-50",  border: "border-violet-200", accent: "#7c3aed" },
  risk:  { gradient: "from-rose-600 to-orange-500",    light: "bg-rose-50",    border: "border-rose-200",   accent: "#e11d48" },
  align: { gradient: "from-teal-600 to-cyan-500",      light: "bg-teal-50",    border: "border-teal-200",   accent: "#0d9488" },
};

const RISK_CATEGORIES = ["Infrastructure", "Compliance", "Vendor", "Security", "Operational"];

const initialCategories: Category[] = [
  {
    id: "doc", name: "Documentation", icon: "doc",
    items: [
      { id: "d1", title: "API Reference Docs",    status: "on-track",    dueDate: "2026-05-09", comment: "" },
      { id: "d2", title: "Onboarding Guide",      status: "at-risk",     dueDate: "2026-05-12", comment: "Waiting on design assets from the UX team." },
      { id: "d3", title: "Release Notes v2.4",    status: "not-started", dueDate: "2026-05-16", comment: "" },
      { id: "d4", title: "Internal Wiki Update",  status: "complete",    dueDate: "2026-05-05", comment: "Merged and published." },
    ],
  },
  {
    id: "risk", name: "Risk Assessment", icon: "risk",
    items: [
      { id: "r1", title: "Vendor Dependency",   status: "delayed",     dueDate: "2026-05-07", comment: "Awaiting vendor SLA response.", riskLevel: "high",   riskCategory: "Vendor"         },
      { id: "r2", title: "Security Audit Q2",   status: "on-track",    dueDate: "2026-05-20", comment: "",                              riskLevel: "high",   riskCategory: "Security"       },
      { id: "r3", title: "Compliance Review",   status: "at-risk",     dueDate: "2026-05-14", comment: "Policy update still pending.",  riskLevel: "medium", riskCategory: "Compliance"     },
      { id: "r4", title: "Infra Capacity Plan", status: "on-track",    dueDate: "2026-05-18", comment: "",                              riskLevel: "medium", riskCategory: "Infrastructure" },
      { id: "r5", title: "Ops Runbook",         status: "not-started", dueDate: "2026-05-22", comment: "",                              riskLevel: "low",    riskCategory: "Operational"    },
    ],
  },
  {
    id: "align", name: "Alignment & Others", icon: "align",
    items: [
      { id: "a1", title: "Cross-Team Sync",      status: "complete",    dueDate: "2026-05-05", comment: "Notes shared in Confluence." },
      { id: "a2", title: "OKR Mid-Cycle Review", status: "on-track",    dueDate: "2026-05-14", comment: "" },
      { id: "a3", title: "Stakeholder Deck",     status: "not-started", dueDate: "2026-05-19", comment: "" },
    ],
  },
];

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
  if (icon === "doc")   return <FileText className={cls} />;
  if (icon === "risk")  return <AlertTriangle className={cls} />;
  return <Users className={cls} />;
}

function ItemCard({
  item, catId, onUpdate, onDelete, isRisk
}: {
  item: Item;
  catId: string;
  onUpdate: (id: string, patch: Partial<Item>) => void;
  onDelete: (id: string) => void;
  isRisk: boolean;
}) {
  const st = STATUS_STYLES[item.status];
  const catStyle = CAT_STYLES[catId as keyof typeof CAT_STYLES];

  return (
    <div className={`group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col`}>
      {/* Top accent bar */}
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

        {/* Status pill */}
        <div className="flex items-center gap-2">
          <select
            value={item.status}
            onChange={e => onUpdate(item.id, { status: e.target.value as Status })}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border-none outline-none cursor-pointer appearance-none ${st.bg} ${st.text}`}
          >
            {(Object.keys(STATUS_STYLES) as Status[]).map(s => (
              <option key={s} value={s}>{STATUS_STYLES[s].label}</option>
            ))}
          </select>
        </div>

        {/* Risk level (only for risk category) */}
        {isRisk && (
          <div className="flex items-center gap-2">
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
      </div>
    </div>
  );
}

const COLORS_PIE = ["#ef4444", "#f59e0b", "#22c55e"];

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
    const level = item.riskLevel ?? "low";
    catMap[cat][level]++;
  });
  const barData = Object.entries(catMap).map(([name, vals]) => ({ name, ...vals }));

  const statusCounts: Record<Status, number> = {
    "on-track": 0, "at-risk": 0, "delayed": 0, "complete": 0, "not-started": 0,
  };
  items.forEach(i => { statusCounts[i.status]++; });
  const statusBarData = (Object.keys(STATUS_STYLES) as Status[])
    .filter(s => statusCounts[s] > 0)
    .map(s => ({ name: STATUS_STYLES[s].label, count: statusCounts[s], fill: s === "on-track" ? "#22c55e" : s === "at-risk" ? "#f59e0b" : s === "delayed" ? "#ef4444" : s === "complete" ? "#3b82f6" : "#9ca3af" }));

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter']">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
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
        {/* KPI Row */}
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

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-5">
          {/* Pie chart */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Risk Level Distribution</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} items`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Status bar chart */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Status Breakdown</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={statusBarData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusBarData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category bar chart (full width) */}
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

        {/* Item cards */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">All Risk Items</h2>
          <div className="grid grid-cols-3 gap-4">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-800 leading-snug">{item.title || "Untitled"}</p>
                  {item.riskLevel && (
                    <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${RISK_STYLES[item.riskLevel].bg}`}>
                      {RISK_STYLES[item.riskLevel].label}
                    </span>
                  )}
                </div>
                <StatusBadge status={item.status} />
                {item.riskCategory && (
                  <p className="text-xs text-gray-400">{item.riskCategory}</p>
                )}
                {item.dueDate && (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.dueDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                )}
                {item.comment && (
                  <p className="text-xs text-gray-500 italic leading-relaxed">"{item.comment}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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
      c.id === catId
        ? {
            ...c, items: [...c.items, {
              id: `item-${Date.now()}`,
              title: "",
              status: "not-started",
              dueDate: "",
              comment: "",
              ...(isRisk ? { riskLevel: "low" as RiskLevel, riskCategory: "" } : {}),
            }]
          }
        : c
    ));
  };

  const drillCat = categories.find(c => c.id === drillDown);
  if (drillCat && drillCat.id === "risk") {
    return <RiskDrillDown items={drillCat.items} onBack={() => setDrillDown(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter']">
      {/* Header */}
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
              {/* Section header */}
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
                      View Analytics
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => addItem(cat.id)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg px-2.5 py-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add item
                  </button>
                </div>
              </div>

              {/* Thumbnail grid */}
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
