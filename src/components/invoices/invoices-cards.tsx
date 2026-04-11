"use client";

import Link from "next/link";
import type { InvoiceWithClient } from "./invoices-view";

function StatusBadge({ status }: { status: string | null }) {
  const map: Record<string, { bg: string; color: string }> = {
    draft: { bg: "var(--tan)", color: "var(--text-dim)" },
    sent: { bg: "var(--accent-pale)", color: "var(--accent)" },
    paid: { bg: "var(--green-pale)", color: "var(--green)" },
    overdue: { bg: "var(--red-pale)", color: "var(--red)" },
    void: { bg: "var(--tan)", color: "var(--text-muted)" },
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

export function InvoicesCards({
  invoices,
  onDelete,
}: {
  invoices: InvoiceWithClient[];
  onDelete: (inv: InvoiceWithClient) => void;
}) {
  if (invoices.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 md:hidden">
      {invoices.map((inv) => (
        <div
          key={inv.id}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
            <div>
              <Link
                href={`/invoices/${inv.id}`}
                style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.05rem", fontWeight: 600, color: "var(--green)", textDecoration: "none" }}
              >
                {inv.invoiceNumber}
              </Link>
              <p style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--text)", marginTop: 2 }}>
                {inv.clientName ?? "—"}
              </p>
            </div>
            <StatusBadge status={inv.status} />
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8, marginBottom: 14 }}>
            {inv.projectName && (
              <span style={{ fontFamily: "var(--font-jost)", fontSize: 12, color: "var(--text-muted)" }}>
                {inv.projectName}
              </span>
            )}
            <span style={{ fontFamily: "var(--font-jost)", fontSize: 12, color: "var(--text-muted)" }}>
              Due {inv.dueDate}
            </span>
            <span style={{ fontFamily: "var(--font-jost)", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
              ${Number(inv.total ?? 0).toFixed(2)}
            </span>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Link
              href={`/invoices/${inv.id}`}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--green)", color: "#FFFFFF", border: "none", borderRadius: 100, padding: "8px 16px", minHeight: 38, fontSize: "0.68rem", fontFamily: "var(--font-jost)", fontWeight: 500, letterSpacing: "0.06em", textDecoration: "none" }}
            >
              View
            </Link>
            <a
              href={`/api/pdf/invoice/${inv.id}`}
              target="_blank"
              rel="noreferrer"
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--green)", color: "#FFFFFF", border: "none", borderRadius: 100, padding: "8px 16px", minHeight: 38, fontSize: "0.68rem", fontFamily: "var(--font-jost)", fontWeight: 500, letterSpacing: "0.06em", textDecoration: "none" }}
            >
              PDF
            </a>
            <button
              onClick={() => onDelete(inv)}
              style={{ flex: 1, background: "var(--red)", color: "#FFFFFF", border: "none", borderRadius: 100, padding: "8px 16px", minHeight: 38, fontSize: "0.68rem", fontFamily: "var(--font-jost)", fontWeight: 500, letterSpacing: "0.06em", cursor: "pointer" }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
