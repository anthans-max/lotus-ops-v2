"use client";

import type { ContractTemplate } from "@/app/actions/contract-templates";

export function TemplatesCards({
  templates,
  onEdit,
  onDelete,
}: {
  templates: ContractTemplate[];
  onEdit: (t: ContractTemplate) => void;
  onDelete: (t: ContractTemplate) => void;
}) {
  if (templates.length === 0) return null;

  return (
    <div className="block md:hidden" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {templates.map((t) => {
        const vars = (t.variables as { key: string }[]) ?? [];
        return (
          <div key={t.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
            <h3 style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.05rem", fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
              {t.name}
            </h3>
            {t.description && (
              <p style={{ fontFamily: "var(--font-jost)", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{t.description}</p>
            )}
            <p style={{ fontFamily: "var(--font-jost)", fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
              {vars.length} variable{vars.length !== 1 ? "s" : ""}
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => onEdit(t)} style={{ flex: 1, background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border-dark)", borderRadius: 100, padding: "10px 16px", minHeight: 44, fontSize: "0.68rem", fontFamily: "var(--font-jost)", fontWeight: 500, letterSpacing: "0.06em", cursor: "pointer" }}>Edit</button>
              <button onClick={() => onDelete(t)} style={{ flex: 1, background: "var(--red-pale)", color: "var(--red)", border: "none", borderRadius: 100, padding: "10px 16px", minHeight: 44, fontSize: "0.68rem", fontFamily: "var(--font-jost)", fontWeight: 500, letterSpacing: "0.06em", cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
