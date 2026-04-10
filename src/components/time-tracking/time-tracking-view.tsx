"use client";

import { useState, useTransition, useMemo } from "react";
import { TimeTrackingTable } from "./time-tracking-table";
import { TimeTrackingCards } from "./time-tracking-cards";
import { TimeEntryForm, type ProjectOption } from "./time-entry-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  deleteTimeEntry,
  submitTimeEntries,
  approveTimeEntry,
  rejectTimeEntry,
  type TimeEntry,
} from "@/app/actions/time-entries";
import { PageHeader } from "@/components/ui/page-header";

export type TimeEntryWithProject = TimeEntry & {
  projectName: string | null;
  clientName: string | null;
};

// ── Weekly Grid ──────────────────────────────────────────────────────────────

function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function WeeklyGrid({
  entries,
  weekStart,
  onAddForDate,
}: {
  entries: TimeEntryWithProject[];
  weekStart: Date;
  onAddForDate: (date: string) => void;
}) {
  const days = getWeekDays(weekStart);
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Group hours by project + date
  const byProjectDate: Record<string, Record<string, number>> = {};
  const projectNames: Record<string, string> = {};
  for (const e of entries) {
    if (!e.projectId) continue;
    const dateStr = fmtDate(new Date(e.date));
    if (!byProjectDate[e.projectId]) byProjectDate[e.projectId] = {};
    byProjectDate[e.projectId][dateStr] =
      (byProjectDate[e.projectId][dateStr] ?? 0) + Number(e.hours);
    if (!projectNames[e.projectId]) projectNames[e.projectId] = e.projectName ?? e.projectId;
  }

  const projectIds = Object.keys(byProjectDate);

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
        <thead>
          <tr style={{ background: "var(--tan)" }}>
            <th
              style={{
                padding: "10px 14px",
                textAlign: "left",
                fontFamily: "var(--font-syne)",
                fontSize: "0.58rem",
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                minWidth: 140,
              }}
            >
              Project
            </th>
            {days.map((d, i) => (
              <th
                key={i}
                style={{
                  padding: "10px 8px",
                  textAlign: "center",
                  fontFamily: "var(--font-syne)",
                  fontSize: "0.58rem",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  minWidth: 72,
                }}
              >
                <div>{dayLabels[i]}</div>
                <div style={{ fontWeight: 400, fontSize: "0.55rem", marginTop: 2 }}>
                  {d.getMonth() + 1}/{d.getDate()}
                </div>
              </th>
            ))}
            <th
              style={{
                padding: "10px 8px",
                textAlign: "center",
                fontFamily: "var(--font-syne)",
                fontSize: "0.58rem",
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
              }}
            >
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {projectIds.map((pid) => {
            const weekTotal = days.reduce(
              (sum, d) => sum + (byProjectDate[pid][fmtDate(d)] ?? 0),
              0
            );
            return (
              <tr key={pid}>
                <td
                  style={{
                    padding: "10px 14px",
                    fontFamily: "var(--font-jost)",
                    fontSize: 13,
                    color: "var(--text)",
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  {projectNames[pid]}
                </td>
                {days.map((d, i) => {
                  const dateStr = fmtDate(d);
                  const hrs = byProjectDate[pid][dateStr];
                  return (
                    <td
                      key={i}
                      onClick={() => onAddForDate(dateStr)}
                      style={{
                        padding: "10px 8px",
                        textAlign: "center",
                        fontFamily: "var(--font-jost)",
                        fontSize: 13,
                        color: hrs ? "var(--text)" : "var(--border-dark)",
                        borderTop: "1px solid var(--border)",
                        cursor: "pointer",
                      }}
                    >
                      {hrs ? hrs.toFixed(1) : "·"}
                    </td>
                  );
                })}
                <td
                  style={{
                    padding: "10px 8px",
                    textAlign: "center",
                    fontFamily: "var(--font-jost)",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text)",
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  {weekTotal.toFixed(1)}
                </td>
              </tr>
            );
          })}
          {projectIds.length === 0 && (
            <tr>
              <td
                colSpan={9}
                style={{
                  padding: "24px 14px",
                  textAlign: "center",
                  fontFamily: "var(--font-jost)",
                  fontSize: 13,
                  color: "var(--text-muted)",
                  borderTop: "1px solid var(--border)",
                }}
              >
                No entries this week
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Main View ────────────────────────────────────────────────────────────────

export function TimeTrackingView({
  entries,
  projectOptions,
}: {
  entries: TimeEntryWithProject[];
  projectOptions: ProjectOption[];
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [addDate, setAddDate] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<TimeEntryWithProject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TimeEntryWithProject | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isSubmitting, startSubmitTransition] = useTransition();

  // Filters
  const [filterProject, setFilterProject] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // View toggle
  const [view, setView] = useState<"list" | "weekly">("list");
  const [weekStart, setWeekStart] = useState<Date>(() => getMondayOf(new Date()));

  // Selection (draft entries only, for batch submit)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (filterProject && e.projectId !== filterProject) return false;
      if (filterStatus && e.status !== filterStatus) return false;
      if (filterDateFrom && e.date < filterDateFrom) return false;
      if (filterDateTo && e.date > filterDateTo) return false;
      return true;
    });
  }, [entries, filterProject, filterStatus, filterDateFrom, filterDateTo]);

  // Weekly grid uses all entries in current week (ignoring filters except project)
  const weekEntries = useMemo(() => {
    const start = fmtDate(weekStart);
    const end = fmtDate(new Date(weekStart.getTime() + 6 * 86400000));
    return entries.filter((e) => {
      if (filterProject && e.projectId !== filterProject) return false;
      return e.date >= start && e.date <= end;
    });
  }, [entries, weekStart, filterProject]);

  const draftSelected = [...selectedIds].filter((id) => {
    const e = entries.find((x) => x.id === id);
    return e?.status === "draft";
  });

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBatchSubmit = () => {
    if (draftSelected.length === 0) return;
    startSubmitTransition(async () => {
      await submitTimeEntries(draftSelected);
      setSelectedIds(new Set());
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteTimeEntry(deleteTarget.id);
      if (result.success) {
        setDeleteTarget(null);
      } else {
        setDeleteTarget(null);
        setDeleteError(result.error);
      }
    });
  };

  const handleApprove = async (entry: TimeEntryWithProject) => {
    await approveTimeEntry(entry.id);
  };

  const handleReject = async (entry: TimeEntryWithProject) => {
    await rejectTimeEntry(entry.id);
  };

  const handleAddForDate = (date: string) => {
    setAddDate(date);
    setAddOpen(true);
  };

  const handleCloseAdd = () => {
    setAddOpen(false);
    setAddDate(null);
  };


  const selectStyle: React.CSSProperties = {
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid var(--border-dark)",
    background: "var(--bg)",
    fontFamily: "var(--font-jost)",
    fontSize: 13,
    color: "var(--text)",
    outline: "none",
  };

  const inputStyle: React.CSSProperties = {
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid var(--border-dark)",
    background: "var(--bg)",
    fontFamily: "var(--font-jost)",
    fontSize: 13,
    color: "var(--text)",
    outline: "none",
  };

  return (
    <div>
      <PageHeader
        title="Time Tracking"
        actions={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {draftSelected.length > 0 && (
              <button
                onClick={handleBatchSubmit}
                disabled={isSubmitting}
                style={{
                  background: "var(--accent-pale)",
                  color: "var(--accent)",
                  border: "1px solid var(--accent)",
                  borderRadius: 100,
                  padding: "10px 20px",
                  minHeight: 44,
                  fontSize: "0.72rem",
                  fontFamily: "var(--font-jost)",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.6 : 1,
                }}
              >
                {isSubmitting ? "Submitting…" : `Submit ${draftSelected.length} Selected`}
              </button>
            )}
            <button
              onClick={() => setAddOpen(true)}
              disabled={projectOptions.length === 0}
              title={projectOptions.length === 0 ? "Add a project first" : undefined}
              style={{
                background: "var(--green)",
                color: "var(--bg)",
                border: "none",
                borderRadius: 100,
                padding: "10px 20px",
                minHeight: 44,
                fontSize: "0.72rem",
                fontFamily: "var(--font-jost)",
                fontWeight: 500,
                letterSpacing: "0.08em",
                cursor: projectOptions.length === 0 ? "not-allowed" : "pointer",
                opacity: projectOptions.length === 0 ? 0.5 : 1,
              }}
            >
              + Log Time
            </button>
          </div>
        }
      />

      {deleteError && (
        <div
          style={{
            background: "var(--red-pale)",
            border: "1px solid var(--red)",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 16,
            fontFamily: "var(--font-jost)",
            fontSize: 13,
            color: "var(--red)",
          }}
        >
          {deleteError}
        </div>
      )}

      {/* Filters + View Toggle */}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          style={selectStyle}
        >
          <option value="">All Projects</option>
          {projectOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={selectStyle}
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="invoiced">Invoiced</option>
        </select>

        <input
          type="date"
          value={filterDateFrom}
          onChange={(e) => setFilterDateFrom(e.target.value)}
          placeholder="From"
          style={inputStyle}
        />
        <input
          type="date"
          value={filterDateTo}
          onChange={(e) => setFilterDateTo(e.target.value)}
          placeholder="To"
          style={inputStyle}
        />

        {(filterProject || filterStatus || filterDateFrom || filterDateTo) && (
          <button
            onClick={() => {
              setFilterProject("");
              setFilterStatus("");
              setFilterDateFrom("");
              setFilterDateTo("");
            }}
            style={{
              background: "transparent",
              color: "var(--text-muted)",
              border: "none",
              fontFamily: "var(--font-jost)",
              fontSize: 12,
              cursor: "pointer",
              padding: "4px 8px",
            }}
          >
            Clear
          </button>
        )}

        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          {(["list", "weekly"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                background: view === v ? "var(--green)" : "transparent",
                color: view === v ? "var(--bg)" : "var(--text-muted)",
                border: "1px solid var(--border-dark)",
                borderRadius: 100,
                padding: "6px 14px",
                fontSize: "0.65rem",
                fontFamily: "var(--font-syne)",
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {v === "list" ? "List" : "Weekly"}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Grid Navigation */}
      {view === "weekly" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <button
            onClick={() => {
              const d = new Date(weekStart);
              d.setDate(d.getDate() - 7);
              setWeekStart(d);
            }}
            style={{
              background: "transparent",
              color: "var(--text-muted)",
              border: "1px solid var(--border-dark)",
              borderRadius: 100,
              padding: "6px 14px",
              fontSize: "0.65rem",
              fontFamily: "var(--font-jost)",
              cursor: "pointer",
            }}
          >
            ← Prev
          </button>
          <span
            style={{
              fontFamily: "var(--font-jost)",
              fontSize: 13,
              color: "var(--text)",
            }}
          >
            {fmtDate(weekStart)} → {fmtDate(new Date(weekStart.getTime() + 6 * 86400000))}
          </span>
          <button
            onClick={() => {
              const d = new Date(weekStart);
              d.setDate(d.getDate() + 7);
              setWeekStart(d);
            }}
            style={{
              background: "transparent",
              color: "var(--text-muted)",
              border: "1px solid var(--border-dark)",
              borderRadius: 100,
              padding: "6px 14px",
              fontSize: "0.65rem",
              fontFamily: "var(--font-jost)",
              cursor: "pointer",
            }}
          >
            Next →
          </button>
          <button
            onClick={() => setWeekStart(getMondayOf(new Date()))}
            style={{
              background: "transparent",
              color: "var(--text-muted)",
              border: "none",
              fontFamily: "var(--font-jost)",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Today
          </button>
        </div>
      )}

      {/* Empty State */}
      {entries.length === 0 && (
        <div style={{ padding: "60px 0", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "1.3rem",
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 8,
            }}
          >
            No time entries yet
          </p>
          <p
            style={{
              fontFamily: "var(--font-jost)",
              fontSize: 13,
              color: "var(--text-muted)",
              marginBottom: 24,
            }}
          >
            {projectOptions.length === 0
              ? "Add a project first, then log time."
              : "Start tracking time on your projects."}
          </p>
          {projectOptions.length > 0 && (
            <button
              onClick={() => setAddOpen(true)}
              style={{
                background: "var(--green)",
                color: "var(--bg)",
                border: "none",
                borderRadius: 100,
                padding: "10px 24px",
                minHeight: 44,
                fontSize: "0.72rem",
                fontFamily: "var(--font-jost)",
                fontWeight: 500,
                letterSpacing: "0.08em",
                cursor: "pointer",
              }}
            >
              Log Time
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {view === "list" ? (
        <>
          <TimeTrackingTable
            entries={filteredEntries}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onEdit={setEditTarget}
            onDelete={setDeleteTarget}
            onApprove={handleApprove}
            onReject={handleReject}
          />
          <TimeTrackingCards
            entries={filteredEntries}
            onEdit={setEditTarget}
            onDelete={setDeleteTarget}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </>
      ) : (
        <WeeklyGrid
          entries={weekEntries}
          weekStart={weekStart}
          onAddForDate={handleAddForDate}
        />
      )}

      {/* Dialogs */}
      <TimeEntryForm
        open={addOpen}
        onClose={handleCloseAdd}
        entry={null}
        defaultDate={addDate ?? undefined}
        projectOptions={projectOptions}
      />

      <TimeEntryForm
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        entry={editTarget}
        projectOptions={projectOptions}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Time Entry"
        message={`Delete this time entry (${deleteTarget?.hours} hrs on ${deleteTarget?.date})? This cannot be undone.`}
        loading={isDeleting}
      />
    </div>
  );
}
