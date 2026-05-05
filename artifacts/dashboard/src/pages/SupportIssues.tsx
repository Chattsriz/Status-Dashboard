import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Category, SupportItem, IssueItem, Status } from "../types";
import { PALETTE, STATUS_STYLES } from "../config";

/* ── Helpers ── */
function statusBadge(status: Status) {
  const s = STATUS_STYLES[status];
  return (
    <span style={{
      fontSize: "10px", fontWeight: 600, padding: "3px 8px", borderRadius: "9999px",
      backgroundColor: s.selectBg, whiteSpace: "nowrap",
    }} className={s.text}>
      {s.label}
    </span>
  );
}

function TagSelect({ value, catId, categories, onChange }: {
  value?: string; catId?: string; categories: Category[];
  onChange: (itemId: string, catId: string) => void;
}) {
  return (
    <select
      value={value ? `${catId}::${value}` : ""}
      onChange={e => {
        const [cId, iId] = e.target.value.split("::");
        onChange(iId, cId);
      }}
      style={{
        fontSize: "11px", padding: "4px 8px", borderRadius: "6px",
        border: `1px solid ${PALETTE.border}`, backgroundColor: PALETTE.warm,
        color: PALETTE.deepBrown, outline: "none", cursor: "pointer",
        maxWidth: "180px", width: "100%",
      }}
    >
      <option value="">— Tag an action item</option>
      {categories.map(cat => (
        <optgroup key={cat.id} label={cat.name}>
          {cat.items.map(item => (
            <option key={item.id} value={`${cat.id}::${item.id}`}>
              {item.title || "(untitled)"}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

function getTagLabel(itemId: string | undefined, catId: string | undefined, categories: Category[]) {
  if (!itemId || !catId) return "—";
  const cat = categories.find(c => c.id === catId);
  if (!cat) return "—";
  const item = cat.items.find(i => i.id === itemId);
  return item ? `${cat.name}: ${item.title || "(untitled)"}` : "—";
}

/* ── Table component ── */
function ItemTable<T extends { id: string; description: string; taggedItemId?: string; taggedCategoryId?: string; dateRaised: string; status: Status }>({
  title, accentColor, rows, descriptionLabel, categories,
  onUpdateRow, onDeleteRow, onAddRow,
}: {
  title: string;
  accentColor: string;
  rows: T[];
  descriptionLabel: string;
  categories: Category[];
  onUpdateRow: (id: string, patch: Partial<T>) => void;
  onDeleteRow: (id: string) => void;
  onAddRow: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div style={{ backgroundColor: PALETTE.card, borderRadius: "16px", border: `1px solid ${PALETTE.border}`, overflow: "hidden" }}>
      <div style={{ background: `linear-gradient(to right, ${accentColor}22, ${accentColor}0a)`, borderBottom: `1px solid ${PALETTE.border}`, padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="flex items-center gap-3">
          <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: accentColor }} />
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: PALETTE.dark }}>{title}</h3>
          <span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 8px", borderRadius: "9999px", backgroundColor: accentColor + "22", color: accentColor }}>
            {rows.length}
          </span>
        </div>
        <button onClick={onAddRow} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, padding: "6px 14px", borderRadius: "8px", cursor: "pointer", backgroundColor: accentColor, color: "#fff", border: "none" }}>
          <Plus size={14} /> Add
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ backgroundColor: PALETTE.warm }}>
              {["#", descriptionLabel, "Tagged Action Item", "Date Raised", "Status", ""].map((h, i) => (
                <th key={i} style={{
                  padding: "8px 12px", textAlign: "left", fontSize: "10px", fontWeight: 700,
                  color: PALETTE.muted, textTransform: "uppercase", letterSpacing: "0.05em",
                  borderBottom: `1px solid ${PALETTE.border}`,
                  whiteSpace: "nowrap", width: h === "#" ? "40px" : h === "" ? "36px" : "auto",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.id} style={{ borderBottom: `1px solid ${PALETTE.border}` }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = PALETTE.warm}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = ""}>
                {/* # */}
                <td style={{ padding: "10px 12px", color: PALETTE.muted, fontWeight: 600, verticalAlign: "top" }}>{idx + 1}</td>

                {/* Description */}
                <td style={{ padding: "10px 12px", verticalAlign: "top", minWidth: "220px" }}>
                  {editingId === row.id ? (
                    <textarea
                      autoFocus value={row.description}
                      onChange={e => onUpdateRow(row.id, { description: e.target.value } as Partial<T>)}
                      onBlur={() => setEditingId(null)}
                      rows={2}
                      style={{
                        width: "100%", fontSize: "12px", padding: "4px 8px", borderRadius: "6px",
                        border: `1px solid ${PALETTE.border}`, outline: "none", resize: "none",
                        backgroundColor: PALETTE.warm, color: PALETTE.dark, fontFamily: "inherit",
                      }}
                    />
                  ) : (
                    <p onClick={() => setEditingId(row.id)} style={{ cursor: "text", color: PALETTE.dark, lineHeight: "1.5", minHeight: "1.5em" }}>
                      {row.description || <span style={{ color: PALETTE.border }}>Click to edit…</span>}
                    </p>
                  )}
                </td>

                {/* Tagged item */}
                <td style={{ padding: "10px 12px", verticalAlign: "top", minWidth: "180px" }}>
                  <TagSelect
                    value={row.taggedItemId} catId={row.taggedCategoryId}
                    categories={categories}
                    onChange={(itemId, catId) => onUpdateRow(row.id, { taggedItemId: itemId, taggedCategoryId: catId } as Partial<T>)}
                  />
                  {row.taggedItemId && (
                    <p style={{ fontSize: "10px", color: PALETTE.muted, marginTop: "4px", lineHeight: "1.4" }}>
                      {getTagLabel(row.taggedItemId, row.taggedCategoryId, categories)}
                    </p>
                  )}
                </td>

                {/* Date */}
                <td style={{ padding: "10px 12px", verticalAlign: "top", whiteSpace: "nowrap" }}>
                  <input type="date" value={row.dateRaised}
                    onChange={e => onUpdateRow(row.id, { dateRaised: e.target.value } as Partial<T>)}
                    style={{ fontSize: "11px", border: `1px solid ${PALETTE.border}`, borderRadius: "6px", padding: "4px 8px", backgroundColor: PALETTE.warm, color: PALETTE.deepBrown, outline: "none", cursor: "pointer" }} />
                </td>

                {/* Status */}
                <td style={{ padding: "10px 12px", verticalAlign: "top", whiteSpace: "nowrap" }}>
                  <select value={row.status}
                    onChange={e => onUpdateRow(row.id, { status: e.target.value as Status } as Partial<T>)}
                    style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "6px", border: `1px solid ${PALETTE.border}`, backgroundColor: STATUS_STYLES[row.status].selectBg, outline: "none", cursor: "pointer", appearance: "none" }}
                    className={STATUS_STYLES[row.status].text}>
                    {(Object.keys(STATUS_STYLES) as Status[]).map(s => (
                      <option key={s} value={s}>{STATUS_STYLES[s].label}</option>
                    ))}
                  </select>
                </td>

                {/* Delete */}
                <td style={{ padding: "10px 12px", verticalAlign: "top" }}>
                  <button onClick={() => onDeleteRow(row.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: PALETTE.border, padding: "2px" }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "#f87171"}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = PALETTE.border}>
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: PALETTE.border, fontSize: "13px" }}>
                  No items yet — click Add to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Page ── */
export function SupportIssues({ supportItems, issueItems, categories, onUpdateSupportItems, onUpdateIssueItems }: {
  supportItems: SupportItem[];
  issueItems: IssueItem[];
  categories: Category[];
  onUpdateSupportItems: React.Dispatch<React.SetStateAction<SupportItem[]>>;
  onUpdateIssueItems: React.Dispatch<React.SetStateAction<IssueItem[]>>;
}) {
  const addSupport = () =>
    onUpdateSupportItems(prev => [...prev, { id: `s-${Date.now()}`, description: "", dateRaised: new Date().toISOString().split("T")[0], status: "not-started" }]);

  const updateSupport = (id: string, patch: Partial<SupportItem>) =>
    onUpdateSupportItems(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));

  const deleteSupport = (id: string) =>
    onUpdateSupportItems(prev => prev.filter(r => r.id !== id));

  const addIssue = () =>
    onUpdateIssueItems(prev => [...prev, { id: `i-${Date.now()}`, description: "", dateRaised: new Date().toISOString().split("T")[0], status: "not-started" }]);

  const updateIssue = (id: string, patch: Partial<IssueItem>) =>
    onUpdateIssueItems(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));

  const deleteIssue = (id: string) =>
    onUpdateIssueItems(prev => prev.filter(r => r.id !== id));

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem 2rem" }} className="space-y-8">
      <div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: PALETTE.dark }}>Support & Issues</h2>
        <p style={{ fontSize: "13px", color: PALETTE.muted, marginTop: "4px" }}>
          Track support requests and issues — tag them to action items across any category.
        </p>
      </div>

      <ItemTable
        title="Support Needed"
        accentColor={PALETTE.brown}
        rows={supportItems}
        descriptionLabel="What Support is Needed"
        categories={categories}
        onUpdateRow={updateSupport}
        onDeleteRow={deleteSupport}
        onAddRow={addSupport}
      />

      <ItemTable
        title="Issues / Concerns"
        accentColor="#CC0000"
        rows={issueItems}
        descriptionLabel="Issue / Concern"
        categories={categories}
        onUpdateRow={updateIssue}
        onDeleteRow={deleteIssue}
        onAddRow={addIssue}
      />
    </div>
  );
}
