import { useState, useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type { Category, Item, SupportItem, IssueItem, PageView } from "./types";
import { initialCategories, initialSupportItems, initialIssueItems } from "./data";
import { PALETTE } from "./config";
import { Dashboard } from "./pages/Dashboard";
import { SupportIssues } from "./pages/SupportIssues";
import { RiskDrillDown } from "./pages/RiskDrillDown";
import { FilterView } from "./pages/FilterView";

function NavBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: active ? PALETTE.bg : "transparent",
        color: active ? PALETTE.dark : PALETTE.border,
        fontWeight: active ? 600 : 400,
        border: "none",
        borderRadius: "6px",
        padding: "0.35rem 0.85rem",
        fontSize: "0.8rem",
        cursor: "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = PALETTE.bg; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = PALETTE.border; }}
    >
      {children}
    </button>
  );
}

export default function App() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [supportItems, setSupportItems] = useState<SupportItem[]>(initialSupportItems);
  const [issueItems, setIssueItems] = useState<IssueItem[]>(initialIssueItems);
  const [view, setView] = useState<PageView>("dashboard");
  const [riskDrillDown, setRiskDrillDown] = useState(false);

  const updateItem = useCallback((catId: string, itemId: string, patch: Partial<Item>) => {
    setCategories(prev => prev.map(c =>
      c.id === catId ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, ...patch } : i) } : c
    ));
  }, []);

  const deleteItem = useCallback((catId: string, itemId: string) => {
    setCategories(prev => prev.map(c =>
      c.id === catId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c
    ));
  }, []);

  const addItem = useCallback((catId: string) => {
    const isRisk = catId === "risk";
    setCategories(prev => prev.map(c =>
      c.id === catId ? {
        ...c, items: [...c.items, {
          id: `item-${Date.now()}`, title: "", status: "not-started" as const,
          startDate: "", dueDate: "", comment: "",
          ...(isRisk ? { riskCategory: "", chartValues: { extreme: 1, high: 2, moderate: 3, low: 2, insignificant: 1 }, subCharts: [] } : {}),
        }],
      } : c
    ));
  }, []);

  const reorderItems = useCallback((catId: string, oldIdx: number, newIdx: number) => {
    setCategories(prev => prev.map(c =>
      c.id === catId ? { ...c, items: arrayMove(c.items, oldIdx, newIdx) } : c
    ));
  }, []);

  const riskCat = categories.find(c => c.id === "risk");

  const header = (
    <header style={{ backgroundColor: PALETTE.dark, borderBottom: "1px solid #1A1A1C", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "52px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {riskDrillDown && (
            <button
              onClick={() => setRiskDrillDown(false)}
              style={{ color: PALETTE.border, background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
            >
              ← Back
            </button>
          )}
          <span style={{ color: PALETTE.bg, fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.01em" }}>
            {riskDrillDown ? "Risk Assessments — Analytics" : "Weekly Status Dashboard"}
          </span>
          {!riskDrillDown && (
            <span style={{ color: PALETTE.muted, fontSize: "0.75rem" }}>{new Date().toLocaleDateString("en-US", { weekday: undefined, year: "numeric", month: "long", day: "numeric" })}</span>
          )}
        </div>
        {!riskDrillDown && (
          <nav style={{ display: "flex", gap: "0.25rem" }}>
            <NavBtn active={view === "dashboard"} onClick={() => setView("dashboard")}>Dashboard</NavBtn>
            <NavBtn active={view === "support"} onClick={() => setView("support")}>Support & Issues</NavBtn>
            <NavBtn active={view === "filter-status"} onClick={() => setView("filter-status")}>Filter by Status</NavBtn>
            <NavBtn active={view === "filter-priority"} onClick={() => setView("filter-priority")}>Filter by Priority</NavBtn>
          </nav>
        )}
      </div>
    </header>
  );

  if (riskDrillDown && riskCat) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: PALETTE.bg, fontFamily: "'Inter', sans-serif" }}>
        {header}
        <RiskDrillDown
          items={riskCat.items}
          onUpdateItem={(id, patch) => updateItem("risk", id, patch)}
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: PALETTE.bg, fontFamily: "'Inter', sans-serif" }}>
      {header}
      {view === "dashboard" && (
        <Dashboard
          categories={categories}
          onUpdateItem={updateItem}
          onDeleteItem={deleteItem}
          onAddItem={addItem}
          onReorderItems={reorderItems}
          onOpenRiskDrillDown={() => { setView("dashboard"); setRiskDrillDown(true); }}
        />
      )}
      {view === "support" && (
        <SupportIssues
          supportItems={supportItems}
          issueItems={issueItems}
          categories={categories}
          onUpdateSupportItems={setSupportItems}
          onUpdateIssueItems={setIssueItems}
        />
      )}
      {(view === "filter-status" || view === "filter-priority") && (
        <FilterView
          categories={categories}
          filterType={view === "filter-status" ? "status" : "priority"}
        />
      )}
    </div>
  );
}
