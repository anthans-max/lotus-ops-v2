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
        whiteSpace: "nowrap",
      }}
    >
      {s}
    </span>
  );
}

export function TimeTrackingTable({
  entries,
  selectedIds,
  onToggleSelect,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}: {
  entries: TimeEntryWithProject[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onEdit: (entry: TimeEntryWithProject) => void;
  onDelete: (entry: TimeEntryWithProject) => void;
  onApprove: (entry: TimeEntryWithProject) => void;
  onReject: (entry: TimeEntryWithProject) => void;
}) {
  if (entries.length === 0) return null;

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
            <th style={{ ...thStyle, width: 36 }}>
              <span style={{ opacity: 0 }}>☐</span>
            </th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Project</th>
            <th style={thStyle}>Client</th>
            <th style={thStyle}>Hours</th>
            <th style={thStyle}>Rate</th>
            <th style={thStyle}>Amount</th>
            <th style={thStyle}>Description</th>
            <th style={thStyle}>Status</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => {
            const amount =
              e.hours && e.rate
                ? (Number(e.hours) * Number(e.rate)).toFixed(2)
                : null;
            const isDraft = e.status === "draft";
            const isSubmitted = e.status === "submitted";

            return (
              <tr key={e.id}>
                <td style={{ ...tdStyle, width: 36 }}>
                  {isDraft && (
                    <input
                      type="checkbox"
                      checked={selectedIds.has(e.id)}
                      onChange={() => onToggleSelect(e.id)}
                      style={{ cursor: "pointer", accentColor: "var(--green)" }}
                    />
                  )}
                </td>
                <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{e.date}</td>
                <td style={tdStyle}>{e.projectName ?? "—"}</td>
                <td style={{ ...tdStyle, color: "var(--text-muted)" }}>{e.clientName ?? "—"}</td>
                <td style={tdStyle}>{Number(e.hours).toFixed(2)}</td>
                <td style={{ ...tdStyle, color: "var(--text-muted)" }}>
                  {e.rate ? `$${Number(e.rate).toFixed(2)}` : "—"}
                </td>
                <td style={tdStyle}>
                  {amount ? `$${amount}` : "—"}
                </td>
                <td
                  style={{
                    ...tdStyle,
                    color: "var(--text-muted)",
                    maxWidth: 200,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {e.description ?? "—"}
                </td>
                <td style={tdStyle}>
                  <StatusBadge status={e.status} />
                </td>
                <td style={{ ...tdStyle, textAlign: "right", whiteSpace: "nowrap" }}>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    {isSubmitted && (
                      <>
                        <button
                          onClick={() => onApprove(e)}
                          style={{
                            background: "var(--green)",
                            color: "#FFFFFF",
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
                          Approve
                        </button>
                        <button
                          onClick={() => onReject(e)}
                          style={{
                            background: "var(--red)",
                            color: "#FFFFFF",
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
                          padding: "5px 12px",
                          fontSize: "0.65rem",
                          fontFamily: "var(--font-jost)",
                          fontWeight: 500,
                          letterSpacing: "0.06em",
                          cursor: "pointer",
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
