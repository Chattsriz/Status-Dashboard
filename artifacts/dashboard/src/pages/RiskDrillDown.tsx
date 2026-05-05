import { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { Item } from "../types";
import type { Priority } from "../types";
import {
  PALETTE, STATUS_STYLES, PRIORITY_STYLES,
  DRILL_RISK_CONFIG, DRILL_RISK_KEYS,
} from "../config";

const PRIORITY_INLINE: Record<Priority, { bg: string; color: string; border: string }> = {
  p1: { bg: "#fee2e2", color: "#b91c1c", border: "#fca5a5" },
  p2: { bg: "#fef3c7", color: "#b45309", border: "#fcd34d" },
  p3: { bg: "#dbeafe", color: "#1d4ed8", border: "#93c5fd" },
  p4: { bg: "#ede9fe", color: "#6d28d9", border: "#c4b5fd" },
  p5: { bg: "#ccfbf1", color: "#0f766e", border: "#5eead4" },
};

/* Custom label for big pie chart */
const RADIAN = Math.PI / 180;
function PieLabel({ cx, cy, midAngle, outerRadius, name, value, percent }: Record<string, number> & { name: string }) {
  if (value === 0) return null;
  const r = outerRadius + 28;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill={PALETTE.dark} textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central" style={{ fontSize: "11px", fontWeight: 600, fontFamily: "Inter, sans-serif" }}>
      {name}: {value} ({(percent * 100).toFixed(0)}%)
    </text>
  );
}

/* Always-visible slice label for mini pies */
const RADIAN_MINI = Math.PI / 180;
function SliceLabel({ cx, cy, midAngle, innerRadius, outerRadius, value }: Record<string, number>) {
  if (!value) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN_MINI);
  const y = cy + r * Math.sin(-midAngle * RADIAN_MINI);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: "10px", fontWeight: 700, pointerEvents: "none" }}>
      {value}
    </text>
  );
}

/* Mini sub-chart pie */
function MiniPie({ name, values }: { name: string; values: { extreme: number; high: number; moderate: number; low: number; insignificant: number } }) {
  const data = DRILL_RISK_KEYS
    .map(k => ({ name: DRILL_RISK_CONFIG[k].label, value: values[k], color: DRILL_RISK_CONFIG[k].color }))
    .filter(d => d.value > 0);
  const total = DRILL_RISK_KEYS.reduce((a, k) => a + values[k], 0);

  return (
    <div style={{
      backgroundColor: PALETTE.card, border: `1px solid ${PALETTE.border}`,
      borderRadius: "12px", padding: "1rem", textAlign: "center",
    }}>
      <p style={{ fontSize: "12px", fontWeight: 700, color: PALETTE.dark, marginBottom: "0.25rem" }}>{name}</p>
      <p style={{ fontSize: "10px", color: PALETTE.muted, marginBottom: "0.5rem" }}>
        {total} item{total !== 1 ? "s" : ""}
      </p>
      <ResponsiveContainer width="100%" height={140}>
        <PieChart>
          <Pie data={data.length ? data : [{ name: "–", value: 1, color: "#e5e7eb" }]}
            cx="50%" cy="50%" outerRadius={58} dataKey="value" paddingAngle={2}
            labelLine={false}
            label={data.length ? SliceLabel as unknown as boolean : false}>
            {(data.length ? data : [{ color: "#e5e7eb" }]).map((e, i) => <Cell key={i} fill={e.color} />)}
          </Pie>
          <Tooltip formatter={(v: number) => [`${v} items`]} contentStyle={{ fontSize: "10px" }} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", justifyContent: "center" }}>
        {data.map(d => (
          <span key={d.name} style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "9999px", backgroundColor: d.color + "22", color: d.color, fontWeight: 600 }}>
            {d.name} {d.value}
          </span>
        ))}
      </div>
    </div>
  );
}

export function RiskDrillDown({ items, onUpdateItem }: {
  items: Item[];
  onUpdateItem: (id: string, patch: Partial<Item>) => void;
}) {
  const [summary, setSummary] = useState("");

  const allValues = DRILL_RISK_KEYS.map(k => ({
    name: DRILL_RISK_CONFIG[k].label,
    value: items.reduce((s, i) => s + (i.chartValues?.[k] ?? 0), 0),
    color: DRILL_RISK_CONFIG[k].color,
  })).filter(d => d.value > 0);

  const totalRisks = allValues.reduce((s, d) => s + d.value, 0);

  const statusData = Object.keys(STATUS_STYLES).map(s => ({
    name: STATUS_STYLES[s as keyof typeof STATUS_STYLES].label,
    value: items.filter(i => i.status === s).length,
    color: STATUS_STYLES[s as keyof typeof STATUS_STYLES].color,
  })).filter(d => d.value > 0);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem 2rem" }} className="space-y-8">

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.75rem" }}>
        {([
          { label: "Total Items", value: items.length, bg: PALETTE.warm, color: undefined as string | undefined },
          ...DRILL_RISK_KEYS.map(k => ({
            label: DRILL_RISK_CONFIG[k].label,
            value: items.reduce((s, i) => s + (i.chartValues?.[k] ?? 0), 0),
            bg: DRILL_RISK_CONFIG[k].lightBg,
            color: DRILL_RISK_CONFIG[k].color as string | undefined,
          })),
        ] as { label: string; value: number; bg: string; color: string | undefined }[]).map(({ label, value, bg, color }) => (
          <div key={label} style={{ backgroundColor: bg, borderRadius: "12px", padding: "1rem", textAlign: "center", border: `1px solid ${PALETTE.border}` }}>
            <p style={{ fontSize: "22px", fontWeight: 800, color: color ?? PALETTE.dark }}>{value}</p>
            <p style={{ fontSize: "11px", color: PALETTE.muted, fontWeight: 500 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Main pie chart + summary box */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div style={{ backgroundColor: PALETTE.card, borderRadius: "16px", border: `1px solid ${PALETTE.border}`, padding: "1.5rem" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: PALETTE.dark, marginBottom: "0.25rem" }}>
            Overall Risk Distribution
          </h3>
          <p style={{ fontSize: "11px", color: PALETTE.muted, marginBottom: "1rem" }}>
            {totalRisks} total risk items across all assessments
          </p>
          <ResponsiveContainer width="100%" height={340}>
            <PieChart>
              <Pie
                data={allValues.length ? allValues : [{ name: "No data", value: 1, color: "#e5e7eb" }]}
                cx="50%" cy="50%" outerRadius={120}
                dataKey="value" paddingAngle={2}
                labelLine
                label={PieLabel as unknown as boolean}
              >
                {(allValues.length ? allValues : [{ color: "#e5e7eb" }]).map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v} items`]} contentStyle={{ fontSize: "12px" }} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "0.5rem" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Summary text box */}
          <div style={{ backgroundColor: PALETTE.card, borderRadius: "16px", border: `1px solid ${PALETTE.border}`, padding: "1.5rem", flex: 1 }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: PALETTE.dark, marginBottom: "0.75rem" }}>
              Risk Assessment Summary
            </h3>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Write a brief summary of the overall risk assessment, key concerns, and recommended actions…"
              rows={8}
              style={{
                width: "100%", fontSize: "13px", lineHeight: "1.6",
                borderRadius: "10px", padding: "12px", resize: "vertical",
                border: `1px solid ${PALETTE.border}`, backgroundColor: PALETTE.warm,
                color: PALETTE.dark, outline: "none", fontFamily: "inherit",
              }}
            />
          </div>

          {/* Status breakdown */}
          <div style={{ backgroundColor: PALETTE.card, borderRadius: "16px", border: `1px solid ${PALETTE.border}`, padding: "1.5rem" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: PALETTE.dark, marginBottom: "0.75rem" }}>
              Status Breakdown
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {statusData.map(d => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "9999px", backgroundColor: d.color + "18", border: `1px solid ${d.color}44` }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: d.color, display: "inline-block" }} />
                  <span style={{ fontSize: "12px", fontWeight: 600, color: d.color }}>{d.name}</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: PALETTE.dark }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Per-item breakdown */}
      <div>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: PALETTE.dark, marginBottom: "1rem" }}>
          Per-Item Risk Breakdown
        </h3>
        <div className="space-y-6">
          {items.map(item => {
            const itemPieData = DRILL_RISK_KEYS
              .map(k => ({ name: DRILL_RISK_CONFIG[k].label, value: item.chartValues?.[k] ?? 0, color: DRILL_RISK_CONFIG[k].color }))
              .filter(d => d.value > 0);
            const itemTotal = Object.values(item.chartValues ?? {}).reduce((a, b) => a + b, 0);
            const st = STATUS_STYLES[item.status];
            const priorityStyle = item.priority ? PRIORITY_STYLES[item.priority] : null;

            return (
              <div key={item.id} style={{ backgroundColor: PALETTE.card, borderRadius: "16px", border: `1px solid ${PALETTE.border}`, padding: "1.5rem" }}>
                {/* Item header */}
                <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <h4 style={{ fontSize: "15px", fontWeight: 700, color: PALETTE.dark }}>{item.title || "Untitled"}</h4>
                    <p style={{ fontSize: "11px", color: PALETTE.muted }}>{item.riskCategory}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span style={{
                      fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "9999px",
                      backgroundColor: st.selectBg,
                    }} className={st.text}>{st.label}</span>
                    {priorityStyle && (
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "6px" }}
                        className={`${priorityStyle.bg} ${priorityStyle.text}`}>
                        {priorityStyle.label}
                      </span>
                    )}
                    <span style={{ fontSize: "11px", color: PALETTE.muted }}>{itemTotal} risk items</span>
                  </div>
                </div>

                {/* Main item pie + sub-charts */}
                <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(180px, 1fr))`, gap: "1rem" }}>
                  {/* Main */}
                  <MiniPie name="Overall" values={item.chartValues ?? { extreme: 0, high: 0, moderate: 0, low: 0, insignificant: 0 }} />

                  {/* Sub-charts */}
                  {(item.subCharts ?? []).map(sc => (
                    <MiniPie key={sc.id} name={sc.name} values={sc.chartValues} />
                  ))}
                </div>

                {/* Notes */}
                {item.comment && (
                  <p style={{ fontSize: "12px", color: PALETTE.muted, marginTop: "1rem", padding: "8px 12px", backgroundColor: PALETTE.warm, borderRadius: "8px", border: `1px solid ${PALETTE.border}` }}>
                    {item.comment}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

