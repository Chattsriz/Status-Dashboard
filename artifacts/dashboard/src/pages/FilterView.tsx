import { useState } from "react";
import type { Category, Status, Priority } from "../types";
import { PALETTE, STATUS_STYLES, PRIORITY_STYLES } from "../config";

const ALL_STATUSES: Status[] = ["not-started", "in-progress", "completed", "on-hold", "delayed"];
const ALL_PRIORITIES: Priority[] = ["p1", "p2", "p3", "p4", "p5"];

const PRIORITY_INLINE: Record<Priority, { bg: string; color: string; border: string }> = {
  p1: { bg: "#fee2e2", color: "#b91c1c", border: "#fca5a5" },
  p2: { bg: "#fef3c7", color: "#b45309", border: "#fcd34d" },
  p3: { bg: "#dbeafe", color: "#1d4ed8", border: "#93c5fd" },
  p4: { bg: "#ede9fe", color: "#6d28d9", border: "#c4b5fd" },
  p5: { bg: "#ccfbf1", color: "#0f766e", border: "#5eead4" },
};

export function FilterView({ categories, filterType }: {
  categories: Category[];
  filterType: "status" | "priority";
}) {
  const [selected, setSelected] = useState<string>("all");

  const allItems = categories.flatMap(cat =>
    cat.items.map(item => ({ ...item, categoryName: cat.name, categoryId: cat.id }))
  );

  const filtered = allItems.filter(item => {
    if (selected === "all") return true;
    if (filterType === "status") return item.status === selected;
    if (selected === "unset") return !item.priority;
    return item.priority === selected;
  });

  const isStatus = filterType === "status";

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem 2rem" }} className="space-y-6">
      <div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: PALETTE.dark }}>
          {isStatus ? "Filter by Status" : "Filter by Priority"}
        </h2>
        <p style={{ fontSize: "13px", color: PALETTE.muted, marginTop: "4px" }}>
          View all items across all categories matching a selected {isStatus ? "status" : "priority"}.
        </p>
      </div>

      {/* Filter buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", padding: "1rem", backgroundColor: PALETTE.card, borderRadius: "12px", border: `1px solid ${PALETTE.border}` }}>
        <button onClick={() => setSelected("all")} style={chipStyle(selected === "all", PALETTE.dark)}>
          All ({allItems.length})
        </button>

        {isStatus
          ? ALL_STATUSES.map(s => {
              const st = STATUS_STYLES[s];
              const count = allItems.filter(i => i.status === s).length;
              return (
                <button key={s} onClick={() => setSelected(s)}
                  style={chipStyle(selected === s, st.color, st.selectBg)}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: st.color, display: "inline-block" }} />
                  {st.label} ({count})
                </button>
              );
            })
          : [
              ...ALL_PRIORITIES.map(p => {
                const pr = PRIORITY_INLINE[p];
                const count = allItems.filter(i => i.priority === p).length;
                return (
                  <button key={p} onClick={() => setSelected(p)}
                    style={chipStyle(selected === p, pr.color, pr.bg)}>
                    {PRIORITY_STYLES[p].label} ({count})
                  </button>
                );
              }),
              (() => {
                const count = allItems.filter(i => !i.priority).length;
                return (
                  <button key="unset" onClick={() => setSelected("unset")}
                    style={chipStyle(selected === "unset", PALETTE.muted, PALETTE.warm)}>
                    Unset ({count})
                  </button>
                );
              })(),
            ]}
      </div>

      {/* Results */}
      <div style={{ backgroundColor: PALETTE.card, borderRadius: "16px", border: `1px solid ${PALETTE.border}`, overflow: "hidden" }}>
        <div style={{ padding: "0.75rem 1.25rem", backgroundColor: PALETTE.warm, borderBottom: `1px solid ${PALETTE.border}`, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: PALETTE.dark }}>
            {filtered.length} item{filtered.length !== 1 ? "s" : ""}
          </span>
          {selected !== "all" && (
            <span style={{ fontSize: "12px", color: PALETTE.muted }}>
              matching "{isStatus && selected in STATUS_STYLES ? STATUS_STYLES[selected as Status].label : selected === "unset" ? "No Priority" : PRIORITY_STYLES[selected as Priority]?.label ?? selected}"
            </span>
          )}
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ backgroundColor: PALETTE.warm }}>
                {["#", "Category", "Title", "Status", "Priority", "Start", "Due", "Notes"].map((h, i) => (
                  <th key={i} style={{
                    padding: "8px 14px", textAlign: "left", fontSize: "10px", fontWeight: 700,
                    color: PALETTE.muted, textTransform: "uppercase", letterSpacing: "0.05em",
                    borderBottom: `1px solid ${PALETTE.border}`, whiteSpace: "nowrap",
                    width: h === "#" ? "36px" : "auto",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => {
                const st = STATUS_STYLES[item.status];
                const pr = item.priority ? PRIORITY_INLINE[item.priority] : null;
                return (
                  <tr key={item.id} style={{ borderBottom: `1px solid ${PALETTE.border}` }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = PALETTE.warm}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = ""}>
                    <td style={{ padding: "10px 14px", color: PALETTE.muted, fontWeight: 600 }}>{idx + 1}</td>
                    <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "6px", backgroundColor: PALETTE.border + "80", color: PALETTE.deepBrown }}>
                        {item.categoryName}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", color: PALETTE.dark, fontWeight: 500, minWidth: "180px" }}>
                      {item.title || <span style={{ color: PALETTE.border }}>(untitled)</span>}
                    </td>
                    <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "9999px", backgroundColor: st.selectBg }} className={st.text}>
                        {st.label}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                      {pr && item.priority ? (
                        <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "6px", backgroundColor: pr.bg, color: pr.color, border: `1px solid ${pr.border}` }}>
                          {PRIORITY_STYLES[item.priority].label}
                        </span>
                      ) : (
                        <span style={{ fontSize: "11px", color: PALETTE.border }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "10px 14px", color: PALETTE.muted, whiteSpace: "nowrap", fontSize: "11px" }}>
                      {item.startDate || "—"}
                    </td>
                    <td style={{ padding: "10px 14px", color: PALETTE.muted, whiteSpace: "nowrap", fontSize: "11px" }}>
                      {item.dueDate || "—"}
                    </td>
                    <td style={{ padding: "10px 14px", color: PALETTE.muted, maxWidth: "200px" }}>
                      <p style={{ fontSize: "11px", lineHeight: "1.4", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.comment || "—"}
                      </p>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: "2.5rem", textAlign: "center", color: PALETTE.border, fontSize: "13px" }}>
                    No items match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function chipStyle(active: boolean, color: string, bg?: string): React.CSSProperties {
  return {
    display: "inline-flex", alignItems: "center", gap: "6px",
    padding: "6px 14px", borderRadius: "9999px", cursor: "pointer",
    fontSize: "12px", fontWeight: active ? 700 : 500,
    backgroundColor: active ? color : (bg ?? PALETTE.warm),
    color: active ? "#fff" : color,
    border: `1px solid ${active ? color : PALETTE.border}`,
    transition: "all 0.15s",
  };
}
