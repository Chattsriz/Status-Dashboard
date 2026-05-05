import { useRef, useEffect, useState } from "react";
import {
  DndContext, PointerSensor, useSensor, useSensors,
  closestCenter, type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Plus, Trash2, Calendar, MessageSquare, BarChart2,
  ChevronRight, AlertTriangle, FileText, Users, GripVertical, PlusCircle, X,
} from "lucide-react";
import type { Item, Category, Priority, Status, SubChart, ChartValues } from "../types";
import {
  PALETTE, STATUS_STYLES, PRIORITY_STYLES, DRILL_RISK_CONFIG,
  DRILL_RISK_KEYS, CAT_STYLES, RISK_CAT_SUGGESTIONS, DEFAULT_CHART,
} from "../config";

/* ── Auto-resizing textarea ── */
function AutoTextarea({ value, onChange, placeholder, style }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value]);
  return (
    <textarea ref={ref} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} rows={1}
      style={{ resize: "none", overflow: "hidden", ...style }} />
  );
}

/* ── Mini editable chart section ── */
const RADIAN = Math.PI / 180;
function MiniPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, value }: Record<string, number>) {
  if (!value) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: "9px", fontWeight: 700, pointerEvents: "none" }}>
      {value}
    </text>
  );
}

function MiniChartEdit({ values, onChange, summary, onSummaryChange }: {
  values: ChartValues; onChange: (v: ChartValues) => void;
  summary: string; onSummaryChange: (s: string) => void;
}) {
  const pieData = DRILL_RISK_KEYS
    .map(k => ({ name: DRILL_RISK_CONFIG[k].label, value: values[k], color: DRILL_RISK_CONFIG[k].color }))
    .filter(d => d.value > 0);
  const set = (key: typeof DRILL_RISK_KEYS[number], raw: string) =>
    onChange({ ...values, [key]: Math.max(0, Math.min(99, parseInt(raw) || 0)) });

  return (
    <div style={{ borderTop: `1px solid ${PALETTE.border}`, paddingTop: "0.5rem" }} className="space-y-2">
      <div className="grid grid-cols-5 gap-0.5 text-center">
        {DRILL_RISK_KEYS.map(k => (
          <div key={k} className="rounded-md py-1" style={{ backgroundColor: DRILL_RISK_CONFIG[k].lightBg }}>
            <p className="text-[8px] font-bold uppercase" style={{ color: DRILL_RISK_CONFIG[k].textColor }}>
              {DRILL_RISK_CONFIG[k].label.slice(0, 3)}
            </p>
            <input type="number" min={0} max={99} value={values[k]} onChange={e => set(k, e.target.value)}
              className="w-full text-center text-xs font-bold bg-transparent border-none outline-none"
              style={{ color: DRILL_RISK_CONFIG[k].textColor }} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2" style={{ alignItems: "start" }}>
        <div>
          <p className="text-[9px] text-center mb-0.5" style={{ color: PALETTE.muted }}>Distribution</p>
          <ResponsiveContainer width="100%" height={90}>
            <PieChart>
              <Pie data={pieData.length ? pieData : [{ name: "–", value: 1, color: "#e5e7eb" }]}
                cx="50%" cy="50%" innerRadius={16} outerRadius={36} paddingAngle={2}
                dataKey="value" labelLine={false}
                label={pieData.length ? MiniPieLabel as unknown as boolean : false}>
                {(pieData.length ? pieData : [{ color: "#e5e7eb" }]).map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 10 }} formatter={(v: number) => [`${v} items`]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <p className="text-[9px]" style={{ color: PALETTE.muted }}>Summary</p>
          <textarea
            value={summary}
            onChange={e => onSummaryChange(e.target.value)}
            placeholder="Summarise risk findings…"
            rows={4}
            style={{
              width: "100%", fontSize: "11px", lineHeight: "1.5", borderRadius: "8px",
              padding: "6px 8px", border: `1px solid ${PALETTE.border}`,
              backgroundColor: PALETTE.warm, color: PALETTE.dark,
              outline: "none", resize: "none", fontFamily: "inherit",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Priority badge colour helpers ── */
const PRIORITY_INLINE: Record<Priority, { bg: string; color: string; border: string }> = {
  p1: { bg: "#fee2e2", color: "#b91c1c", border: "#fca5a5" },
  p2: { bg: "#fef3c7", color: "#b45309", border: "#fcd34d" },
  p3: { bg: "#dbeafe", color: "#1d4ed8", border: "#93c5fd" },
  p4: { bg: "#ede9fe", color: "#6d28d9", border: "#c4b5fd" },
  p5: { bg: "#ccfbf1", color: "#0f766e", border: "#5eead4" },
};

/* ── Item Card ── */
function ItemCard({ item, catId, onUpdate, onDelete, isRisk, dragHandleProps }: {
  item: Item; catId: string;
  onUpdate: (id: string, patch: Partial<Item>) => void;
  onDelete: (id: string) => void;
  isRisk: boolean;
  dragHandleProps: React.HTMLAttributes<HTMLDivElement>;
}) {
  const [showCharts, setShowCharts] = useState(false);
  const [showSubCharts, setShowSubCharts] = useState(false);
  const [newSubName, setNewSubName] = useState("");
  const st = STATUS_STYLES[item.status];
  const cs = CAT_STYLES[catId] ?? CAT_STYLES.doc;

  const addSubChart = () => {
    if (!newSubName.trim()) return;
    const sub: SubChart = { id: `sc-${Date.now()}`, name: newSubName.trim(), chartValues: { ...DEFAULT_CHART } };
    onUpdate(item.id, { subCharts: [...(item.subCharts ?? []), sub] });
    setNewSubName("");
  };

  const updateSubChart = (scId: string, patch: Partial<SubChart>) =>
    onUpdate(item.id, { subCharts: (item.subCharts ?? []).map(s => s.id === scId ? { ...s, ...patch } : s) });

  const deleteSubChart = (scId: string) =>
    onUpdate(item.id, { subCharts: (item.subCharts ?? []).filter(s => s.id !== scId) });

  return (
    <div className="group relative flex flex-col rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
      style={{ backgroundColor: PALETTE.card, border: `1px solid ${PALETTE.border}`, overflow: "visible" }}>
      <div style={{ background: `linear-gradient(to right, ${cs.gradFrom}, ${cs.gradTo})`, height: "4px", borderRadius: "10px 10px 0 0" }} />

      {/* Drag handle */}
      <div {...dragHandleProps} className="flex justify-center py-1 cursor-grab active:cursor-grabbing select-none">
        <GripVertical className="w-3.5 h-3.5" style={{ color: PALETTE.border }} />
      </div>

      <div className="px-4 pb-4 flex flex-col gap-2.5">
        {/* Title */}
        <div className="flex items-start gap-2">
          <AutoTextarea
            value={item.title}
            onChange={v => onUpdate(item.id, { title: v })}
            placeholder="Item title…"
            style={{
              flex: 1, fontWeight: 600, fontSize: "0.875rem",
              background: "transparent", border: "none", outline: "none",
              padding: 0, color: PALETTE.dark, fontFamily: "inherit",
              lineHeight: "1.4",
            }}
          />
          <button onClick={() => onDelete(item.id)}
            className="opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity"
            style={{ color: PALETTE.border, background: "none", border: "none", cursor: "pointer", paddingTop: "2px" }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "#f87171"}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = PALETTE.border}>
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Status + Priority row */}
        <div className="flex items-center gap-2 flex-wrap">
          <select value={item.status} onChange={e => onUpdate(item.id, { status: e.target.value as Status })}
            style={{
              backgroundColor: st.selectBg, fontWeight: 600, fontSize: "11px",
              padding: "4px 10px", borderRadius: "9999px", border: "none", outline: "none",
              cursor: "pointer", appearance: "none",
            }}
            className={st.text}>
            {(Object.keys(STATUS_STYLES) as Status[]).map(s => (
              <option key={s} value={s}>{STATUS_STYLES[s].label}</option>
            ))}
          </select>

          <select
            value={item.priority ?? ""}
            onChange={e => onUpdate(item.id, { priority: e.target.value ? e.target.value as Priority : undefined })}
            style={{
              fontWeight: 600, fontSize: "11px", padding: "3px 10px",
              borderRadius: "6px", outline: "none", cursor: "pointer", appearance: "none",
              border: "1px solid",
              ...(item.priority
                ? { backgroundColor: PRIORITY_INLINE[item.priority].bg, color: PRIORITY_INLINE[item.priority].color, borderColor: PRIORITY_INLINE[item.priority].border }
                : { backgroundColor: PALETTE.warm, color: PALETTE.muted, borderColor: PALETTE.border }),
            }}>
            <option value="">— Priority</option>
            {(["p1","p2","p3","p4","p5"] as Priority[]).map(p => (
              <option key={p} value={p}>{PRIORITY_STYLES[p].label}</option>
            ))}
          </select>
        </div>

        {/* Risk Category */}
        {isRisk && (
          <div>
            <p style={{ color: PALETTE.muted, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500, marginBottom: "2px" }}>
              Risk Category
            </p>
            <input list="risk-cat-list" value={item.riskCategory ?? ""}
              onChange={e => onUpdate(item.id, { riskCategory: e.target.value })}
              placeholder="Type or pick…"
              style={{
                width: "100%", fontSize: "11px", borderRadius: "9999px",
                padding: "4px 10px", border: `1px solid ${PALETTE.border}`,
                backgroundColor: PALETTE.warm, color: PALETTE.deepBrown, outline: "none",
              }} />
            <datalist id="risk-cat-list">
              {RISK_CAT_SUGGESTIONS.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
        )}

        {/* Start + Due */}
        <div className="grid grid-cols-2 gap-x-3">
          {[["Start", "startDate"], ["Due", "dueDate"]] .map(([label, key]) => (
            <div key={key}>
              <p style={{ color: PALETTE.muted, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500, marginBottom: "2px" }}>
                {label}
              </p>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 flex-shrink-0" style={{ color: PALETTE.muted }} />
                <input type="date" value={(item as unknown as Record<string, string>)[key] ?? ""}
                  onChange={e => onUpdate(item.id, { [key]: e.target.value } as Partial<Item>)}
                  style={{ fontSize: "11px", background: "transparent", border: "none", outline: "none", cursor: "pointer", color: PALETTE.deepBrown, width: "100%" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div>
          <div className="flex items-center gap-1 mb-1">
            <MessageSquare className="w-3 h-3" style={{ color: PALETTE.border }} />
            <span style={{ color: PALETTE.muted, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>Notes</span>
          </div>
          <textarea value={item.comment} onChange={e => onUpdate(item.id, { comment: e.target.value })}
            placeholder="Add a note or comment…" rows={2}
            style={{
              width: "100%", fontSize: "12px", borderRadius: "8px",
              padding: "6px 10px", border: `1px solid ${PALETTE.border}`,
              backgroundColor: PALETTE.warm, color: PALETTE.deepBrown,
              outline: "none", resize: "none", lineHeight: "1.5",
              fontFamily: "inherit",
            }} />
        </div>

        {/* Risk chart controls */}
        {isRisk && (
          <div className="space-y-2">
            <button onClick={() => setShowCharts(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: "6px", justifyContent: "center",
                width: "100%", fontSize: "10px", fontWeight: 600, padding: "6px 10px",
                borderRadius: "8px", cursor: "pointer",
                backgroundColor: showCharts ? "#FFF3E0" : PALETTE.warm,
                color: showCharts ? PALETTE.brown : PALETTE.muted,
                border: `1px solid ${showCharts ? PALETTE.brown : PALETTE.border}`,
              }}>
              <BarChart2 size={12} /> {showCharts ? "Hide Charts" : "Edit Charts"}
            </button>
            {showCharts && (
              <MiniChartEdit
                values={item.chartValues ?? DEFAULT_CHART}
                onChange={cv => onUpdate(item.id, { chartValues: cv })}
                summary={item.chartSummary ?? ""}
                onSummaryChange={s => onUpdate(item.id, { chartSummary: s })}
              />
            )}

            {/* Sub-charts */}
            <button onClick={() => setShowSubCharts(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: "6px", justifyContent: "center",
                width: "100%", fontSize: "10px", fontWeight: 600, padding: "6px 10px",
                borderRadius: "8px", cursor: "pointer",
                backgroundColor: showSubCharts ? "#E8F5E9" : PALETTE.warm,
                color: showSubCharts ? "#2E7D32" : PALETTE.muted,
                border: `1px solid ${showSubCharts ? "#2E7D32" : PALETTE.border}`,
              }}>
              <PlusCircle size={12} />
              Sub-charts {item.subCharts?.length ? `(${item.subCharts.length})` : ""}
            </button>

            {showSubCharts && (
              <div style={{ borderTop: `1px solid ${PALETTE.border}`, paddingTop: "0.5rem" }} className="space-y-3">
                {(item.subCharts ?? []).map(sc => (
                  <div key={sc.id} className="rounded-lg p-2.5 space-y-2"
                    style={{ backgroundColor: PALETTE.warm, border: `1px solid ${PALETTE.border}` }}>
                    <div className="flex items-center gap-1">
                      <input value={sc.name} onChange={e => updateSubChart(sc.id, { name: e.target.value })}
                        placeholder="Sub-chart name…"
                        style={{ flex: 1, fontSize: "12px", fontWeight: 600, background: "transparent", border: "none", outline: "none", color: PALETTE.dark, fontFamily: "inherit" }} />
                      <button onClick={() => deleteSubChart(sc.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: PALETTE.muted }}>
                        <X size={12} />
                      </button>
                    </div>
                    <div className="grid grid-cols-5 gap-0.5 text-center">
                      {DRILL_RISK_KEYS.map(k => (
                        <div key={k} className="rounded py-1" style={{ backgroundColor: DRILL_RISK_CONFIG[k].lightBg }}>
                          <p style={{ fontSize: "7px", fontWeight: 700, color: DRILL_RISK_CONFIG[k].textColor }}>
                            {DRILL_RISK_CONFIG[k].label.slice(0, 3)}
                          </p>
                          <input type="number" min={0} max={99} value={sc.chartValues[k]}
                            onChange={e => updateSubChart(sc.id, {
                              chartValues: { ...sc.chartValues, [k]: Math.max(0, Math.min(99, parseInt(e.target.value) || 0)) },
                            })}
                            style={{ width: "100%", textAlign: "center", fontSize: "12px", fontWeight: 700, background: "transparent", border: "none", outline: "none", color: DRILL_RISK_CONFIG[k].textColor }} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex gap-1">
                  <input value={newSubName} onChange={e => setNewSubName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addSubChart()}
                    placeholder="New sub-chart name…"
                    style={{
                      flex: 1, fontSize: "12px", borderRadius: "8px",
                      padding: "6px 10px", border: `1px solid ${PALETTE.border}`,
                      backgroundColor: PALETTE.card, color: PALETTE.dark, outline: "none", fontFamily: "inherit",
                    }} />
                  <button onClick={addSubChart}
                    style={{
                      fontSize: "12px", fontWeight: 600, padding: "6px 12px", borderRadius: "8px",
                      backgroundColor: PALETTE.dark, color: PALETTE.bg, border: "none", cursor: "pointer",
                    }}>
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sortable wrapper ── */
function SortableCard(props: Omit<React.ComponentProps<typeof ItemCard>, "dragHandleProps">) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: props.item.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}>
      <ItemCard {...props} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

/* ── Dashboard ── */
export function Dashboard({ categories, onUpdateItem, onDeleteItem, onAddItem, onReorderItems, onOpenRiskDrillDown }: {
  categories: Category[];
  onUpdateItem: (catId: string, itemId: string, patch: Partial<Item>) => void;
  onDeleteItem: (catId: string, itemId: string) => void;
  onAddItem: (catId: string) => void;
  onReorderItems: (catId: string, oldIdx: number, newIdx: number) => void;
  onOpenRiskDrillDown: () => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function catIcon(icon: string) {
    const s = { width: 16, height: 16, color: "#fff" };
    if (icon === "doc")  return <FileText style={s} />;
    if (icon === "risk") return <AlertTriangle style={s} />;
    return <Users style={s} />;
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "1.5rem 2rem" }} className="space-y-10">
      {categories.map(cat => {
        const cs = CAT_STYLES[cat.icon] ?? CAT_STYLES.doc;
        const isRisk = cat.id === "risk";

        return (
          <section key={cat.id}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div style={{
                  width: 32, height: 32, borderRadius: "10px",
                  background: `linear-gradient(135deg, ${cs.gradFrom}, ${cs.gradTo})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {catIcon(cat.icon)}
                </div>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, color: PALETTE.dark }}>{cat.name}</h2>
                <span style={{
                  fontSize: "11px", borderRadius: "9999px", padding: "2px 8px",
                  backgroundColor: PALETTE.border, color: PALETTE.deepBrown, fontWeight: 600,
                }}>
                  {cat.items.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isRisk && (
                  <button onClick={onOpenRiskDrillDown}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 500,
                      padding: "6px 14px", borderRadius: "8px", cursor: "pointer",
                      backgroundColor: PALETTE.warm, color: PALETTE.deepBrown,
                      border: `1px solid ${PALETTE.brown}`,
                    }}>
                    View Analytics <ChevronRight size={14} />
                  </button>
                )}
                <button onClick={() => onAddItem(cat.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "4px", fontSize: "12px",
                    color: PALETTE.muted, background: "none", border: "none", cursor: "pointer",
                  }}>
                  <Plus size={14} /> Add item
                </button>
              </div>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter}
              onDragEnd={(event: DragEndEvent) => {
                const { active, over } = event;
                if (!over || active.id === over.id) return;
                const oldIdx = cat.items.findIndex(i => i.id === active.id);
                const newIdx = cat.items.findIndex(i => i.id === over.id);
                if (oldIdx !== -1 && newIdx !== -1) onReorderItems(cat.id, oldIdx, newIdx);
              }}>
              <SortableContext items={cat.items.map(i => i.id)} strategy={rectSortingStrategy}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                  {cat.items.map(item => (
                    <SortableCard
                      key={item.id} item={item} catId={cat.id}
                      onUpdate={(id, patch) => onUpdateItem(cat.id, id, patch)}
                      onDelete={id => onDeleteItem(cat.id, id)}
                      isRisk={isRisk}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </section>
        );
      })}
    </div>
  );
}
