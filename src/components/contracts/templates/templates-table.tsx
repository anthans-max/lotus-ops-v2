"use client";

import type { ContractTemplate } from "@/app/actions/contract-templates";

export function TemplatesTable({
  templates,
  onEdit,
  onDelete,
}: {
  templates: ContractTemplate[];
  onEdit: (t: ContractTemplate) => void;
  onDelete: (t: ContractTemplate) => void;
}) {
  if (templates.length === 0) return null;

  const thStyle: React.CSSProperties = {
    padding: "10px 14px",
    textAlign: "left",
    fontFamily: "var(--font-syne)",
    fontSize: "0.58rem",
    fontWeight: 500,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    whiteSpace: "nowrap",
  };

  const tdStyle: React.CSSProperties = {
    padding: "11px 14px",
    fontFamily: "var(--font-jost)",
    fontSize: 13,
    color: "var(--text)",
    borderTop: "1px solid var(--border)",
    verticalAlign: "middle",
  };

  return (
    <div className="hidden md:block" style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--tan)" }}>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Description</th>
            <th style={thStyle}>Variables</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((t) => {
            const vars = (t.variables as { key: string }[]) ?? [];
            return (
              <tr key={t.id}>
                <td style={tdStyle}>{t.name}</td>
                <td style={{ ...tdStyle, color: "var(--text-muted)" }}>{t.description ?? "—"}</td>
                <td style={{ ...tdStyle, color: "var(--text-muted)" }}>{vars.length}</td>
                <td style={{ ...tdStyle, textAlign: "right", whiteSpace: "nowrap" }}>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <button onClick={() => onEdit(t)} style={{ background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border-dark)", borderRadius: 100, padding: "5px 12px", fontSize: "0.65rem", fontFamily: "var(--font-jost)", fontWeight: 500, letterSpacing: "0.06em", cursor: "pointer" }}>Edit</button>
                    <button onClick={() => onDelete(t)} style={{ background: "var(--red-pale)", color: "var(--red)", border: "none", borderRadius: 100, padding: "5px 12px", fontSize: "0.65rem", fontFamily: "var(--font-jost)", fontWeight: 500, letterSpacing: "0.06em", cursor: "pointer" }}>Delete</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
