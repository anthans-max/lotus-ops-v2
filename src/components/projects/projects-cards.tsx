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
      }}
    >
      {s.replace("-", " ")}
    </span>
  );
}

export function ProjectsCards({
  projects,
  onEdit,
  onDelete,
}: {
  projects: ProjectWithClient[];
  onEdit: (project: ProjectWithClient) => void;
  onDelete: (project: ProjectWithClient) => void;
}) {
  if (projects.length === 0) return null;

  return (
    <div className="block md:hidden" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {projects.map((p) => (
        <div
          key={p.id}
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
              marginBottom: 6,
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "1.05rem",
                fontWeight: 600,
                color: "var(--text)",
                flex: 1,
                paddingRight: 8,
              }}
            >
              {p.name}
            </h3>
            <StatusBadge status={p.status} />
          </div>

          <p
            style={{
              fontFamily: "var(--font-jost)",
              fontSize: 13,
              color: "var(--text-muted)",
              marginBottom: 4,
            }}
          >
            {p.clientName ?? "—"}
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 6,
              marginBottom: 14,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-jost)",
                fontSize: 12,
                color: "var(--text-muted)",
                textTransform: "capitalize",
              }}
            >
              {p.billingType ?? "hourly"}
            </span>
            {p.defaultRate && (
              <span
                style={{
                  fontFamily: "var(--font-jost)",
                  fontSize: 12,
                  color: "var(--text-muted)",
                }}
              >
                ${Number(p.defaultRate).toFixed(2)}/hr
              </span>
            )}
            {(p.startDate || p.endDate) && (
              <span
                style={{
                  fontFamily: "var(--font-jost)",
                  fontSize: 12,
                  color: "var(--text-muted)",
                }}
              >
                {[p.startDate, p.endDate].filter(Boolean).join(" → ")}
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => onEdit(p)}
              style={{
                background: "transparent",
                color: "var(--text-muted)",
                border: "1px solid var(--border-dark)",
                borderRadius: 100,
                padding: "10px 16px",
                minHeight: 44,
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
              onClick={() => onDelete(p)}
              style={{
                background: "var(--red-pale)",
                color: "var(--red)",
                border: "none",
                borderRadius: 100,
                padding: "10px 16px",
                minHeight: 44,
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
