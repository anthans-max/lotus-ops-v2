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
      }}
    >
      {s}
    </span>
  );
}

export function ContractsCards({
  contracts,
  onDelete,
}: {
  contracts: ContractWithProject[];
  onDelete: (c: ContractWithProject) => void;
}) {
  if (contracts.length === 0) return null;

  return (
    <div className="block md:hidden" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {contracts.map((c) => (
        <div
          key={c.id}
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
            <div>
              <Link
                href={`/contracts/${c.id}`}
                style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.05rem", fontWeight: 600, color: "var(--green)", textDecoration: "none" }}
              >
                {c.contractNumber}
              </Link>
              <p style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--text)", marginTop: 2 }}>
                {c.projectName ?? "—"}
              </p>
              {c.clientName && (
                <p style={{ fontFamily: "var(--font-jost)", fontSize: 12, color: "var(--text-muted)" }}>{c.clientName}</p>
              )}
            </div>
            <StatusBadge status={c.status} />
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <Link
              href={`/contracts/${c.id}`}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border-dark)", borderRadius: 100, padding: "10px 16px", minHeight: 44, fontSize: "0.68rem", fontFamily: "var(--font-jost)", fontWeight: 500, letterSpacing: "0.06em", textDecoration: "none" }}
            >
              View
            </Link>
            <button
              onClick={() => onDelete(c)}
              style={{ flex: 1, background: "var(--red-pale)", color: "var(--red)", border: "none", borderRadius: 100, padding: "10px 16px", minHeight: 44, fontSize: "0.68rem", fontFamily: "var(--font-jost)", fontWeight: 500, letterSpacing: "0.06em", cursor: "pointer" }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
