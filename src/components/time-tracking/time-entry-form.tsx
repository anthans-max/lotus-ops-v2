"use client";

import { useState, useTransition, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { createTimeEntry, updateTimeEntry, type TimeEntry } from "@/app/actions/time-entries";

export type ProjectOption = {
  id: string;
  name: string;
  clientId: string | null;
  defaultRate: string | null;
};

export function TimeEntryForm({
  open,
  onClose,
  entry,
  defaultDate,
  projectOptions,
}: {
  open: boolean;
  onClose: () => void;
  entry: TimeEntry | null;
  defaultDate?: string;
  projectOptions: ProjectOption[];
}) {
  const [projectId, setProjectId] = useState("");
  const [date, setDate] = useState("");
  const [hours, setHours] = useState("");
  const [rate, setRate] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setProjectId(entry?.projectId ?? (projectOptions[0]?.id ?? ""));
      setDate(entry?.date ?? defaultDate ?? new Date().toISOString().slice(0, 10));
      setHours(entry?.hours ?? "");
      setRate(entry?.rate ?? "");
      setDescription(entry?.description ?? "");
      setError(null);
    }
  }, [open, entry, defaultDate, projectOptions]);

  // Auto-fill rate from project default when project changes (create mode only)
  useEffect(() => {
    if (!entry && projectId) {
      const proj = projectOptions.find((p) => p.id === projectId);
      if (proj?.defaultRate) setRate(proj.defaultRate);
    }
  }, [projectId, entry, projectOptions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !date || !hours) {
      setError("Project, date, and hours are required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const input = {
        projectId,
        date,
        hours,
        rate: rate || undefined,
        description: description || undefined,
      };
      const result = entry
        ? await updateTimeEntry(entry.id, input)
        : await createTimeEntry(input);
      if (result.success) {
        onClose();
      } else {
        setError(result.error);
      }
    });
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "var(--font-syne)",
    fontSize: "0.6rem",
    fontWeight: 500,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    marginBottom: 6,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 6,
    border: "1px solid var(--border-dark)",
    background: "var(--bg)",
    fontFamily: "var(--font-jost)",
    fontSize: 13,
    color: "var(--text)",
    outline: "none",
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={entry ? "Edit Time Entry" : "Log Time"}
      className="dialog-fullscreen"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Project *</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              style={inputStyle}
            >
              <option value="">Select project…</option>
              {projectOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Hours *</label>
              <input
                type="number"
                step="0.25"
                min="0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="0.00"
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Rate ($/hr)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="0.00"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What did you work on?"
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          {error && (
            <p style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--red)" }}>
              {error}
            </p>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              style={{
                background: "transparent",
                color: "var(--text-dim)",
                border: "1px solid var(--border-dark)",
                borderRadius: 100,
                padding: "10px 20px",
                minHeight: 44,
                fontSize: "0.72rem",
                fontFamily: "var(--font-jost)",
                fontWeight: 500,
                letterSpacing: "0.08em",
                cursor: isPending ? "not-allowed" : "pointer",
                opacity: isPending ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
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
                cursor: isPending ? "not-allowed" : "pointer",
                opacity: isPending ? 0.7 : 1,
              }}
            >
              {isPending ? "Saving…" : entry ? "Save Changes" : "Log Time"}
            </button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
