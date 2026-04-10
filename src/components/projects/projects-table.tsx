"use client";

import type { ProjectWithClient } from "./projects-view";

function StatusBadge({ status }: { status: string | null }) {
  const map: Record<string, { bg: string; color: string }> = {
    active: { bg: "var(--green-pale)", color: "var(--green)" },
    "on-hold": { bg: "var(--accent-pale)", color: "var(--accent)" },
    completed: { bg: "var(--tan)", color: "var(--text-dim)" },
    archived: { bg: "var(--tan)", color: "var(--text-muted)" },
  };
  const s = status ?? "active";
  const style = map[s] ?? map.active;
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
      {s.replace("-", " ")}
    </span>
  );
}

export function ProjectsTable({
  projects,
  onEdit,
  onDelete,
}: {
  projects: ProjectWithClient[];
  onEdit: (project: ProjectWithClient) => void;
  onDelete: (project: ProjectWithClient) => void;
}) {
  if (projects.length === 0) return null;

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
            <th style={thStyle}>Project</th>
            <th style={thStyle}>Client</th>
            <th style={thStyle}>Billing</th>
            <th style={thStyle}>Rate</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Dates</th>
            <th style={thStyle} />
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id}>
              <td style={{ ...tdStyle, color: "var(--text)", fontWeight: 500 }}>
                {p.name}
              </td>
              <td style={tdStyle}>{p.clientName ?? "—"}</td>
              <td style={tdStyle}>
                <span style={{ textTransform: "capitalize" }}>
                  {p.billingType ?? "hourly"}
                </span>
              </td>
              <td style={tdStyle}>
                {p.defaultRate
                  ? `$${Number(p.defaultRate).toFixed(2)}`
                  : "—"}
              </td>
              <td style={tdStyle}>
                <StatusBadge status={p.status} />
              </td>
              <td style={{ ...tdStyle, fontSize: 12 }}>
                {p.startDate || p.endDate
                  ? [p.startDate, p.endDate].filter(Boolean).join(" → ")
                  : "—"}
              </td>
              <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => onEdit(p)}
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
                    onClick={() => onDelete(p)}
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
