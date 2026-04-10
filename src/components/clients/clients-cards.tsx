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
      }}
    >
      {status ?? "active"}
    </span>
  );
}

export function ClientsCards({
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

  return (
    <div className="block md:hidden" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {clients.map((c) => (
        <div
          key={c.id}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "1.05rem",
                fontWeight: 600,
                color: "var(--text)",
              }}
            >
              {c.name}
            </h3>
            <StatusBadge status={c.status} />
          </div>

          {c.email && (
            <p
              style={{
                fontFamily: "var(--font-jost)",
                fontSize: 13,
                color: "var(--text-dim)",
                marginBottom: 2,
              }}
            >
              {c.email}
            </p>
          )}
          {c.phone && (
            <p
              style={{
                fontFamily: "var(--font-jost)",
                fontSize: 13,
                color: "var(--text-dim)",
                marginBottom: 4,
              }}
            >
              {c.phone}
            </p>
          )}

          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 6,
              marginBottom: 14,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-jost)",
                fontSize: 12,
                color: "var(--text-muted)",
              }}
            >
              {c.projectCount} project{c.projectCount !== 1 ? "s" : ""}
            </span>
            <span
              style={{
                fontFamily: "var(--font-jost)",
                fontSize: 12,
                color: "var(--text-muted)",
              }}
            >
              {c.contactCount} contact{c.contactCount !== 1 ? "s" : ""}
            </span>
            <span
              style={{
                fontFamily: "var(--font-jost)",
                fontSize: 12,
                color: "var(--text-muted)",
              }}
            >
              Net {c.paymentTerms ?? 30}
            </span>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => onContacts(c)}
              style={{
                background: "var(--green)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 100,
                padding: "8px 16px",
                minHeight: 38,
                fontSize: "0.68rem",
                fontFamily: "var(--font-jost)",
                fontWeight: 500,
                letterSpacing: "0.06em",
                cursor: "pointer",
                flex: 1,
              }}
            >
              Contacts
            </button>
            <button
              onClick={() => onEdit(c)}
              style={{
                background: "var(--green)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 100,
                padding: "8px 16px",
                minHeight: 38,
                fontSize: "0.68rem",
                fontFamily: "var(--font-jost)",
                fontWeight: 500,
                letterSpacing: "0.06em",
                cursor: "pointer",
                flex: 1,
              }}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(c)}
              style={{
                background: "var(--red)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 100,
                padding: "8px 16px",
                minHeight: 38,
                fontSize: "0.68rem",
                fontFamily: "var(--font-jost)",
                fontWeight: 500,
                letterSpacing: "0.06em",
                cursor: "pointer",
                flex: 1,
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
