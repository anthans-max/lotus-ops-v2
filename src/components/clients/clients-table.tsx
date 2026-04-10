"use client";

import type { ClientWithCounts } from "./clients-view";

function StatusBadge({ status }: { status: string | null }) {
  const isActive = status === "active";
  return (
    <span
      style={{
        background: isActive ? "var(--green-pale)" : "var(--tan)",
        color: isActive ? "var(--green)" : "var(--text-muted)",
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
      {status ?? "active"}
    </span>
  );
}

export function ClientsTable({
  clients,
  onEdit,
  onDelete,
  onContacts,
}: {
  clients: ClientWithCounts[];
  onEdit: (client: ClientWithCounts) => void;
  onDelete: (client: ClientWithCounts) => void;
  onContacts: (client: ClientWithCounts) => void;
}) {
  if (clients.length === 0) return null;

  const thStyle: React.CSSProperties = {
    textAlign: "left",
    fontFamily: "var(--font-syne)",
    fontSize: "0.58rem",
    fontWeight: 500,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    padding: "0 12px 10px",
    whiteSpace: "nowrap",
  };

  const tdStyle: React.CSSProperties = {
    padding: "14px 12px",
    fontFamily: "var(--font-jost)",
    fontSize: 13,
    color: "var(--text-dim)",
    borderBottom: "1px solid var(--border)",
    verticalAlign: "middle",
  };

  return (
    <div className="hidden md:block" style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Phone</th>
            <th style={{ ...thStyle, textAlign: "center" }}>Terms</th>
            <th style={{ ...thStyle, textAlign: "center" }}>Projects</th>
            <th style={{ ...thStyle, textAlign: "center" }}>Contacts</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle} />
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id}>
              <td style={{ ...tdStyle, color: "var(--text)", fontWeight: 500 }}>
                {c.name}
              </td>
              <td style={tdStyle}>{c.email ?? "—"}</td>
              <td style={tdStyle}>{c.phone ?? "—"}</td>
              <td style={{ ...tdStyle, textAlign: "center" }}>
                {c.paymentTerms ?? 30}d
              </td>
              <td style={{ ...tdStyle, textAlign: "center" }}>
                {c.projectCount}
              </td>
              <td style={{ ...tdStyle, textAlign: "center" }}>
                {c.contactCount}
              </td>
              <td style={tdStyle}>
                <StatusBadge status={c.status} />
              </td>
              <td
                style={{
                  ...tdStyle,
                  whiteSpace: "nowrap",
                }}
              >
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => onContacts(c)}
                    style={{
                      background: "transparent",
                      color: "var(--text-muted)",
                      border: "1px solid var(--border)",
                      borderRadius: 100,
                      padding: "6px 14px",
                      minHeight: 32,
                      fontSize: "0.65rem",
                      fontFamily: "var(--font-jost)",
                      fontWeight: 500,
                      letterSpacing: "0.06em",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Contacts
                  </button>
                  <button
                    onClick={() => onEdit(c)}
                    style={{
                      background: "transparent",
                      color: "var(--text-muted)",
                      border: "1px solid var(--border)",
                      borderRadius: 100,
                      padding: "6px 14px",
                      minHeight: 32,
                      fontSize: "0.65rem",
                      fontFamily: "var(--font-jost)",
                      fontWeight: 500,
                      letterSpacing: "0.06em",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(c)}
                    style={{
                      background: "var(--red-pale)",
                      color: "var(--red)",
                      border: "none",
                      borderRadius: 100,
                      padding: "6px 14px",
                      minHeight: 32,
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
