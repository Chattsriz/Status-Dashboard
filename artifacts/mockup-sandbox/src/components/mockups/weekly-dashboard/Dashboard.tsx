import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ChevronDown, ChevronUp, Calendar, CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";

type Status = "on-track" | "at-risk" | "delayed" | "complete" | "not-started";

interface Item {
  id: string;
  title: string;
  status: Status;
  dueDate: string;
  notes: string;
}

interface Category {
  id: string;
  name: string;
  weeklyStatus: Status;
  notes: string;
  items: Item[];
  collapsed: boolean;
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; icon: React.ReactNode }> = {
  "on-track": {
    label: "On Track",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  "at-risk": {
    label: "At Risk",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  delayed: {
    label: "Delayed",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
  complete: {
    label: "Complete",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  "not-started": {
    label: "Not Started",
    color: "bg-gray-100 text-gray-600 border-gray-200",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
};

const CATEGORY_ACCENT: Record<string, { header: string; dot: string; border: string }> = {
  doc: { header: "from-violet-600 to-indigo-600", dot: "bg-violet-500", border: "border-l-violet-500" },
  risk: { header: "from-rose-600 to-orange-500", dot: "bg-rose-500", border: "border-l-rose-500" },
  align: { header: "from-teal-600 to-cyan-500", dot: "bg-teal-500", border: "border-l-teal-500" },
};

const initialCategories: Category[] = [
  {
    id: "doc",
    name: "Documentation",
    weeklyStatus: "on-track",
    notes: "",
    collapsed: false,
    items: [
      { id: "d1", title: "Update API reference docs", status: "on-track", dueDate: "2026-05-09", notes: "" },
      { id: "d2", title: "Write onboarding guide", status: "at-risk", dueDate: "2026-05-12", notes: "Waiting on design assets" },
      { id: "d3", title: "Release notes for v2.4", status: "not-started", dueDate: "2026-05-16", notes: "" },
    ],
  },
  {
    id: "risk",
    name: "Risk Assessment",
    weeklyStatus: "at-risk",
    notes: "",
    collapsed: false,
    items: [
      { id: "r1", title: "Vendor dependency review", status: "delayed", dueDate: "2026-05-07", notes: "Awaiting vendor response" },
      { id: "r2", title: "Security audit Q2", status: "on-track", dueDate: "2026-05-20", notes: "" },
    ],
  },
  {
    id: "align",
    name: "Alignment & Others",
    weeklyStatus: "on-track",
    notes: "",
    collapsed: false,
    items: [
      { id: "a1", title: "Cross-team sync with product", status: "complete", dueDate: "2026-05-05", notes: "Done — notes shared in Confluence" },
      { id: "a2", title: "OKR mid-cycle review", status: "on-track", dueDate: "2026-05-14", notes: "" },
      { id: "a3", title: "Stakeholder update deck", status: "not-started", dueDate: "2026-05-19", notes: "" },
    ],
  },
];

function StatusPill({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function StatusSelect({ value, onChange }: { value: Status; onChange: (v: Status) => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Status)}>
      <SelectTrigger className="h-8 text-xs w-36 border-gray-200 bg-white">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(STATUS_CONFIG) as Status[]).map((s) => (
          <SelectItem key={s} value={s} className="text-xs">
            <span className="flex items-center gap-2">
              {STATUS_CONFIG[s].icon}
              {STATUS_CONFIG[s].label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function newItem(): Item {
  return {
    id: `item-${Date.now()}`,
    title: "",
    status: "not-started",
    dueDate: "",
    notes: "",
  };
}

export function Dashboard() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const updateCategory = (catId: string, patch: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, ...patch } : c))
    );
  };

  const updateItem = (catId: string, itemId: string, patch: Partial<Item>) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId
          ? { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) }
          : c
      )
    );
  };

  const addItem = (catId: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, items: [...c.items, newItem()] } : c))
    );
  };

  const removeItem = (catId: string, itemId: string) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c
      )
    );
  };

  const toggleCollapse = (catId: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, collapsed: !c.collapsed } : c))
    );
  };

  const weekLabel = (() => {
    const now = new Date(2026, 4, 5);
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + 1);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `Week of ${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  })();

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter']">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Weekly Status Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {weekLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {categories.map((c) => {
            const accent = CATEGORY_ACCENT[c.id];
            return (
              <div key={c.id} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700">
                <span className={`w-2 h-2 rounded-full ${accent.dot}`} />
                {c.name.split(" ")[0]}
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_CONFIG[c.weeklyStatus].color}`}>
                  {STATUS_CONFIG[c.weeklyStatus].label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      <div className="px-8 py-6 space-y-5 max-w-6xl mx-auto">
        {categories.map((cat) => {
          const accent = CATEGORY_ACCENT[cat.id];
          return (
            <div key={cat.id} className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden border-l-4 ${accent.border}`}>
              {/* Category header */}
              <div className={`bg-gradient-to-r ${accent.header} px-6 py-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleCollapse(cat.id)}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      {cat.collapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                    </button>
                    <h2 className="text-white font-semibold text-lg">{cat.name}</h2>
                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                      {cat.items.length} items
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/80 text-xs font-medium">Weekly status:</span>
                    <StatusSelect
                      value={cat.weeklyStatus}
                      onChange={(v) => updateCategory(cat.id, { weeklyStatus: v })}
                    />
                  </div>
                </div>
              </div>

              {!cat.collapsed && (
                <div className="p-6">
                  {/* Items table */}
                  {cat.items.length > 0 && (
                    <div className="mb-5">
                      <div className="grid grid-cols-[1fr_140px_140px_48px] gap-x-3 pb-2 mb-1 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        <span>Item</span>
                        <span>Status</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Due Date</span>
                        <span></span>
                      </div>
                      <div className="space-y-2 mt-2">
                        {cat.items.map((item) => (
                          <div key={item.id} className="space-y-1.5">
                            <div className="grid grid-cols-[1fr_140px_140px_48px] gap-x-3 items-center">
                              <Input
                                value={item.title}
                                onChange={(e) => updateItem(cat.id, item.id, { title: e.target.value })}
                                placeholder="Item title..."
                                className="h-8 text-sm border-gray-200 bg-gray-50 focus:bg-white"
                              />
                              <StatusSelect
                                value={item.status}
                                onChange={(v) => updateItem(cat.id, item.id, { status: v })}
                              />
                              <Input
                                type="date"
                                value={item.dueDate}
                                onChange={(e) => updateItem(cat.id, item.id, { dueDate: e.target.value })}
                                className="h-8 text-xs border-gray-200 bg-gray-50 focus:bg-white"
                              />
                              <button
                                onClick={() => removeItem(cat.id, item.id)}
                                className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {/* Per-item notes */}
                            <div className="ml-0 pl-0">
                              <Input
                                value={item.notes}
                                onChange={(e) => updateItem(cat.id, item.id, { notes: e.target.value })}
                                placeholder="Add a note for this item..."
                                className="h-7 text-xs text-gray-500 border-transparent bg-transparent hover:bg-gray-50 focus:bg-white focus:border-gray-200 transition-all pl-1"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add item */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addItem(cat.id)}
                    className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 gap-1.5 text-xs h-8 px-3 mb-4"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add item
                  </Button>

                  {/* Category notes */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Category notes</p>
                    <Textarea
                      value={cat.notes}
                      onChange={(e) => updateCategory(cat.id, { notes: e.target.value })}
                      placeholder={`Write any notes, blockers, or updates for ${cat.name} this week...`}
                      className="text-sm border-gray-200 bg-gray-50 focus:bg-white resize-none min-h-[80px] text-gray-700 placeholder:text-gray-300"
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
