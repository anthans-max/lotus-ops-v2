"use client";

import { useTransition, useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { createProject, updateProject, type Project } from "@/app/actions/projects";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontFamily: "var(--font-jost)",
  fontSize: 13,
  color: "var(--text)",
  outline: "none",
  minHeight: 44,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-syne)",
  fontSize: "0.6rem",
  fontWeight: 500,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color: "var(--text-muted)",
  marginBottom: 6,
};

const fieldStyle: React.CSSProperties = { marginBottom: 16 };

export type ClientOption = { id: string; name: string };

export function ProjectForm({
  open,
  onClose,
  project,
  clients,
}: {
  open: boolean;
  onClose: () => void;
  project?: Project | null;
  clients: ClientOption[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [clientId, setClientId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [billingType, setBillingType] = useState("hourly");
  const [defaultRate, setDefaultRate] = useState("");
  const [budgetHours, setBudgetHours] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (project) {
      setClientId(project.clientId ?? "");
      setName(project.name);
      setDescription(project.description ?? "");
      setStatus(project.status ?? "active");
      setBillingType(project.billingType ?? "hourly");
      setDefaultRate(project.defaultRate ?? "");
      setBudgetHours(project.budgetHours ?? "");
      setBudgetAmount(project.budgetAmount ?? "");
      setStartDate(project.startDate ?? "");
      setEndDate(project.endDate ?? "");
    } else {
      setClientId(clients[0]?.id ?? "");
      setName("");
      setDescription("");
      setStatus("active");
      setBillingType("hourly");
      setDefaultRate("");
      setBudgetHours("");
      setBudgetAmount("");
      setStartDate("");
      setEndDate("");
    }
    setError(null);
  }, [project, open, clients]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setError("Please select a client.");
      return;
    }
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const payload = {
        clientId,
        name: name.trim(),
        description: description.trim() || undefined,
        status,
        billingType,
        defaultRate: defaultRate || undefined,
        budgetHours: budgetHours || undefined,
        budgetAmount: budgetAmount || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };
      const result = project
        ? await updateProject(project.id, payload)
        : await createProject(payload);

      if (result.success) {
        onClose();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={project ? "Edit Project" : "Add Project"}
      className="dialog-fullscreen"
    >
      <form onSubmit={handleSubmit}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Client *</label>
          <select
            style={{ ...inputStyle, cursor: "pointer" }}
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
          >
            {clients.length === 0 && (
              <option value="">No active clients</option>
            )}
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Project Name *</label>
          <input
            style={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            required
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Description</label>
          <textarea
            style={{ ...inputStyle, minHeight: 72, resize: "vertical" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief project description"
            rows={2}
          />
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Status</label>
            <select
              style={{ ...inputStyle, cursor: "pointer" }}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Billing Type</label>
            <select
              style={{ ...inputStyle, cursor: "pointer" }}
              value={billingType}
              onChange={(e) => setBillingType(e.target.value)}
            >
              <option value="hourly">Hourly</option>
              <option value="fixed">Fixed</option>
              <option value="retainer">Retainer</option>
            </select>
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Default Rate ($/hr)</label>
          <input
            style={inputStyle}
            type="number"
            step="0.01"
            min="0"
            value={defaultRate}
            onChange={(e) => setDefaultRate(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Budget Hours</label>
            <input
              style={inputStyle}
              type="number"
              step="0.5"
              min="0"
              value={budgetHours}
              onChange={(e) => setBudgetHours(e.target.value)}
              placeholder="0"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Budget Amount ($)</label>
            <input
              style={inputStyle}
              type="number"
              step="0.01"
              min="0"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Start Date</label>
            <input
              style={inputStyle}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>End Date</label>
            <input
              style={inputStyle}
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p
            style={{
              fontFamily: "var(--font-jost)",
              fontSize: 13,
              color: "var(--red)",
              marginBottom: 16,
            }}
          >
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
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
            {isPending ? "Saving..." : project ? "Save Changes" : "Add Project"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
