"use client";

import Link from "next/link";
import type { ContractWithProject } from "./contracts-view";

function StatusBadge({ status }: { status: string | null }) {
  const map: Record<string, { bg: string; color: string }> = {
    draft: { bg: "var(--tan)", color: "var(--text-dim)" },
    sent: { bg: "var(--accent-pale)", color: "var(--accent)" },
    signed: { bg: "var(--green-pale)", color: "var(--green)" },
    expired: { bg: "var(--red-pale)", color: "var(--red)" },
  };
  const s = status ?? "draft";
  const style = map[s] ?? map.draft;
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        borderRadius: 100,
        padding: "3px 10px",
        fontSize: "0.6rem",
        fontFamily: "var(--font-syne)",
        fontWeight: 500,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {s}
    </span>
  );
}

export function ContractsTable({
  contracts,
  onDelete,
}: {
  contracts: ContractWithProject[];
  onDelete: (c: ContractWithProject) => void;
}) {
  if (contracts.length === 0) return null;

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
            <th style={thStyle}>Contract #</th>
            <th style={thStyle}>Project</th>
            <th style={thStyle}>Client</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Created</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((c) => (
            <tr key={c.id}>
              <td style={tdStyle}>
                <Link
                  href={`/contracts/${c.id}`}
                  style={{ color: "var(--green)", textDecoration: "none", fontWeight: 500 }}
                >
                  {c.contractNumber}
                </Link>
              </td>
              <td style={tdStyle}>{c.projectName ?? "—"}</td>
              <td style={{ ...tdStyle, color: "var(--text-muted)" }}>{c.clientName ?? "—"}</td>
              <td style={tdStyle}><StatusBadge status={c.status} /></td>
              <td style={{ ...tdStyle, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
              </td>
              <td style={{ ...tdStyle, textAlign: "right" }}>
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <Link
                    href={`/contracts/${c.id}`}
                    style={{ background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border-dark)", borderRadius: 100, padding: "5px 12px", fontSize: "0.65rem", fontFamily: "var(--font-jost)", fontWeight: 500, letterSpacing: "0.06em", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                  >
                    View
                  </Link>
                  <button
                    onClick={() => onDelete(c)}
                    style={{ background: "var(--red)", color: "#FFFFFF", border: "none", borderRadius: 100, padding: "5px 12px", fontSize: "0.65rem", fontFamily: "var(--font-jost)", fontWeight: 500, letterSpacing: "0.06em", cursor: "pointer" }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
