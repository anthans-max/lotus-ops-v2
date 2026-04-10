"use client";

import { useState, useTransition, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { createInvoice, type Invoice } from "@/app/actions/invoices";
import { getApprovedTimeEntriesForProject, type TimeEntry } from "@/app/actions/time-entries";

export type ClientOption = { id: string; name: string; paymentTerms: number | null };
export type ProjectOption = { id: string; name: string; clientId: string | null; defaultRate: string | null };

type LineItemDraft = {
  _key: string;
  description: string;
  quantity: string;
  rate: string;
  timeEntryId?: string;
};

export function InvoiceForm({
  open,
  onClose,
  clients,
  projects,
  defaultTaxRate,
}: {
  open: boolean;
  onClose: () => void;
  clients: ClientOption[];
  projects: ProjectOption[];
  defaultTaxRate?: string;
}) {
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [issueDate, setIssueDate] = useState(today());
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [taxRate, setTaxRate] = useState(defaultTaxRate ?? "0");
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([emptyItem()]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isImporting, startImportTransition] = useTransition();

  const selectedClient = clients.find((c) => c.id === clientId);
  const clientProjects = projects.filter((p) => p.clientId === clientId);

  useEffect(() => {
    if (open) {
      setClientId(clients[0]?.id ?? "");
      setProjectId("");
      setIssueDate(today());
      setDueDate("");
      setNotes("");
      setTaxRate(defaultTaxRate ?? "0");
      setLineItems([emptyItem()]);
      setError(null);
    }
  }, [open, clients, defaultTaxRate]);

  // Auto-set due date from client payment terms
  useEffect(() => {
    if (selectedClient?.paymentTerms) {
      const d = new Date();
      d.setDate(d.getDate() + selectedClient.paymentTerms);
      setDueDate(d.toISOString().slice(0, 10));
    }
  }, [clientId, selectedClient]);

  // Reset project when client changes
  useEffect(() => {
    setProjectId(clientProjects[0]?.id ?? "");
  }, [clientId]);

  const handleImportTimeEntries = () => {
    if (!projectId) return;
    startImportTransition(async () => {
      const result = await getApprovedTimeEntriesForProject(projectId);
      if (!result.success) { setError(result.error); return; }
      if (result.data.length === 0) {
        setError("No approved, uninvoiced time entries for this project.");
        return;
      }
      setError(null);
      const proj = projects.find((p) => p.id === projectId);
      const imported: LineItemDraft[] = result.data.map((te) => ({
        _key: te.id,
        description: te.description ?? `Work on ${te.date}`,
        quantity: te.hours,
        rate: te.rate ?? proj?.defaultRate ?? "0",
        timeEntryId: te.id,
      }));
      setLineItems((prev) => {
        // Remove blank item if present
        const nonBlank = prev.filter((i) => i.description || i.quantity || i.rate);
        return [...nonBlank, ...imported];
      });
    });
  };

  const addLineItem = () => setLineItems((prev) => [...prev, emptyItem()]);

  const updateLineItem = (key: string, field: keyof LineItemDraft, value: string) => {
    setLineItems((prev) =>
      prev.map((item) => (item._key === key ? { ...item, [field]: value } : item))
    );
  };

  const removeLineItem = (key: string) => {
    setLineItems((prev) => prev.filter((item) => item._key !== key));
  };

  const subtotal = lineItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.rate || 0),
    0
  );
  const taxAmount = subtotal * (Number(taxRate) / 100);
  const total = subtotal + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !issueDate || !dueDate) {
      setError("Client, issue date, and due date are required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const validItems = lineItems.filter((i) => i.description && i.rate);
      const timeEntryIds = lineItems.filter((i) => i.timeEntryId).map((i) => i.timeEntryId!);
      const result = await createInvoice({
        clientId,
        projectId: projectId || undefined,
        issueDate,
        dueDate,
        notes: notes || undefined,
        taxRate,
        lineItems: validItems,
        timeEntryIds,
      });
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
    <Dialog open={open} onClose={onClose} title="New Invoice" className="dialog-fullscreen">
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Client + Project */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Client *</label>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)} style={inputStyle}>
                <option value="">Select client…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Project</label>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)} style={inputStyle}>
                <option value="">None</option>
                {clientProjects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Issue Date *</label>
              <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Due Date *</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
            </div>
          </div>

          {/* Tax Rate */}
          <div>
            <label style={labelStyle}>Tax Rate (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              style={{ ...inputStyle, maxWidth: 160 }}
            />
          </div>

          {/* Line Items */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={labelStyle}>Line Items</label>
              {projectId && (
                <button
                  type="button"
                  onClick={handleImportTimeEntries}
                  disabled={isImporting}
                  style={{
                    background: "transparent",
                    color: "var(--accent)",
                    border: "1px solid var(--accent)",
                    borderRadius: 100,
                    padding: "5px 12px",
                    fontSize: "0.65rem",
                    fontFamily: "var(--font-jost)",
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    cursor: isImporting ? "not-allowed" : "pointer",
                    opacity: isImporting ? 0.6 : 1,
                  }}
                >
                  {isImporting ? "Importing…" : "Import Time Entries"}
                </button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 80px 36px", gap: 6 }}>
                <span style={{ ...labelStyle, marginBottom: 0 }}>Description</span>
                <span style={{ ...labelStyle, marginBottom: 0 }}>Qty</span>
                <span style={{ ...labelStyle, marginBottom: 0 }}>Rate</span>
                <span style={{ ...labelStyle, marginBottom: 0 }}>Amount</span>
                <span />
              </div>
              {lineItems.map((item) => {
                const amount = Number(item.quantity || 0) * Number(item.rate || 0);
                return (
                  <div key={item._key} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 80px 36px", gap: 6, alignItems: "center" }}>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(item._key, "description", e.target.value)}
                      placeholder="Description"
                      style={inputStyle}
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item._key, "quantity", e.target.value)}
                      placeholder="1"
                      style={inputStyle}
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.rate}
                      onChange={(e) => updateLineItem(item._key, "rate", e.target.value)}
                      placeholder="0.00"
                      style={inputStyle}
                    />
                    <span style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--text)", padding: "0 4px" }}>
                      ${amount.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeLineItem(item._key)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        fontSize: 16,
                        padding: 4,
                        lineHeight: 1,
                        minWidth: 36,
                        minHeight: 36,
                      }}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={addLineItem}
                style={{
                  background: "transparent",
                  color: "var(--text-muted)",
                  border: "1px dashed var(--border-dark)",
                  borderRadius: 6,
                  padding: "8px",
                  fontSize: "0.72rem",
                  fontFamily: "var(--font-jost)",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                + Add Line Item
              </button>
            </div>
          </div>

          {/* Totals */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: 220, fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--text-muted)" }}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {Number(taxRate) > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", width: 220, fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--text-muted)" }}>
                <span>Tax ({taxRate}%)</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", width: 220, fontFamily: "var(--font-jost)", fontSize: 14, fontWeight: 600, color: "var(--text)", borderTop: "1px solid var(--border)", paddingTop: 4 }}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Payment instructions, thank you note…"
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          {error && (
            <p style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--red)" }}>{error}</p>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              style={{ background: "transparent", color: "var(--text-dim)", border: "1px solid var(--border-dark)", borderRadius: 100, padding: "10px 20px", minHeight: 44, fontSize: "0.72rem", fontFamily: "var(--font-jost)", fontWeight: 500, letterSpacing: "0.08em", cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.5 : 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              style={{ background: "var(--green)", color: "var(--bg)", border: "none", borderRadius: 100, padding: "10px 20px", minHeight: 44, fontSize: "0.72rem", fontFamily: "var(--font-jost)", fontWeight: 500, letterSpacing: "0.08em", cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1 }}
            >
              {isPending ? "Creating…" : "Create Invoice"}
            </button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function emptyItem(): LineItemDraft {
  return { _key: `item-${Date.now()}-${Math.random()}`, description: "", quantity: "1", rate: "" };
}
