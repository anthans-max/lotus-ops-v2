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
        whiteSpace: "nowrap",
      }}
    >
      {s}
    </span>
  );
}

export function InvoicesTable({
  invoices,
  onDelete,
}: {
  invoices: InvoiceWithClient[];
  onDelete: (inv: InvoiceWithClient) => void;
}) {
  if (invoices.length === 0) return null;

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
            <th style={thStyle}>Invoice #</th>
            <th style={thStyle}>Client</th>
            <th style={thStyle}>Project</th>
            <th style={thStyle}>Issue Date</th>
            <th style={thStyle}>Due Date</th>
            <th style={thStyle}>Total</th>
            <th style={thStyle}>Status</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td style={tdStyle}>
                <Link
                  href={`/invoices/${inv.id}`}
                  style={{ color: "var(--green)", textDecoration: "none", fontWeight: 500 }}
                >
                  {inv.invoiceNumber}
                </Link>
              </td>
              <td style={tdStyle}>{inv.clientName ?? "—"}</td>
              <td style={{ ...tdStyle, color: "var(--text-muted)" }}>{inv.projectName ?? "—"}</td>
              <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{inv.issueDate}</td>
              <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{inv.dueDate}</td>
              <td style={tdStyle}>${Number(inv.total ?? 0).toFixed(2)}</td>
              <td style={tdStyle}>
                <StatusBadge status={inv.status} />
              </td>
              <td style={{ ...tdStyle, textAlign: "right", whiteSpace: "nowrap" }}>
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <Link
                    href={`/invoices/${inv.id}`}
                    style={{
                      background: "transparent",
                      color: "var(--text-muted)",
                      border: "1px solid var(--border-dark)",
                      borderRadius: 100,
                      padding: "5px 12px",
                      fontSize: "0.65rem",
                      fontFamily: "var(--font-jost)",
                      fontWeight: 500,
                      letterSpacing: "0.06em",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    View
                  </Link>
                  <a
                    href={`/api/pdf/invoice/${inv.id}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: "var(--green-pale)",
                      color: "var(--green)",
                      border: "none",
                      borderRadius: 100,
                      padding: "5px 12px",
                      fontSize: "0.65rem",
                      fontFamily: "var(--font-jost)",
                      fontWeight: 500,
                      letterSpacing: "0.06em",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    PDF
                  </a>
                  <button
                    onClick={() => onDelete(inv)}
                    style={{
                      background: "var(--red-pale)",
                      color: "var(--red)",
                      border: "none",
                      borderRadius: 100,
                      padding: "5px 12px",
                      fontSize: "0.65rem",
                      fontFamily: "var(--font-jost)",
                      fontWeight: 500,
                      letterSpacing: "0.06em",
                      cursor: "pointer",
                    }}
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
