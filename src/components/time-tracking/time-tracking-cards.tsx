"use client";

import type { TimeEntryWithProject } from "./time-tracking-view";

function StatusBadge({ status }: { status: string | null }) {
  const map: Record<string, { bg: string; color: string }> = {
    draft: { bg: "var(--tan)", color: "var(--text-muted)" },
    submitted: { bg: "var(--accent-pale)", color: "var(--accent)" },
    approved: { bg: "var(--green-pale)", color: "var(--green)" },
    rejected: { bg: "var(--red-pale)", color: "var(--red)" },
    invoiced: { bg: "var(--tan)", color: "var(--text-dim)" },
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

export function TimeTrackingCards({
  entries,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}: {
  entries: TimeEntryWithProject[];
  onEdit: (entry: TimeEntryWithProject) => void;
  onDelete: (entry: TimeEntryWithProject) => void;
  onApprove: (entry: TimeEntryWithProject) => void;
  onReject: (entry: TimeEntryWithProject) => void;
}) {
  if (entries.length === 0) return null;

  return (
    <div className="block md:hidden" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {entries.map((e) => {
        const amount =
          e.hours && e.rate
            ? (Number(e.hours) * Number(e.rate)).toFixed(2)
            : null;
        const isSubmitted = e.status === "submitted";

        return (
          <div
            key={e.id}
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
                marginBottom: 4,
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-cormorant)",
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    color: "var(--text)",
                  }}
                >
                  {e.projectName ?? "Unknown Project"}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-jost)",
                    fontSize: 12,
                    color: "var(--text-muted)",
                  }}
                >
                  {e.clientName ?? ""}
                </p>
              </div>
              <StatusBadge status={e.status} />
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 8,
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
                {e.date}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-jost)",
                  fontSize: 12,
                  color: "var(--text)",
                  fontWeight: 500,
                }}
              >
                {Number(e.hours).toFixed(2)} hrs
              </span>
              {e.rate && (
                <span
                  style={{
                    fontFamily: "var(--font-jost)",
                    fontSize: 12,
                    color: "var(--text-muted)",
                  }}
                >
                  ${Number(e.rate).toFixed(2)}/hr
                </span>
              )}
              {amount && (
                <span
                  style={{
                    fontFamily: "var(--font-jost)",
                    fontSize: 12,
                    color: "var(--green)",
                    fontWeight: 500,
                  }}
                >
                  ${amount}
                </span>
              )}
            </div>

            {e.description && (
              <p
                style={{
                  fontFamily: "var(--font-jost)",
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginBottom: 12,
                  lineHeight: 1.4,
                }}
              >
                {e.description}
              </p>
            )}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {isSubmitted && (
                <>
                  <button
                    onClick={() => onApprove(e)}
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
                    Approve
                  </button>
                  <button
                    onClick={() => onReject(e)}
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
                    Reject
                  </button>
                </>
              )}
              {e.status !== "invoiced" && (
                <button
                  onClick={() => onEdit(e)}
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
              )}
              <button
                onClick={() => onDelete(e)}
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
        );
      })}
    </div>
  );
}
