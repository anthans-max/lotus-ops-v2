"use client";

import { useState, useTransition, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { createTemplate, updateTemplate, type ContractTemplate } from "@/app/actions/contract-templates";

type VariableDef = { key: string; label: string; type: string };

export function TemplateForm({
  open,
  onClose,
  template,
}: {
  open: boolean;
  onClose: () => void;
  template: ContractTemplate | null;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [variables, setVariables] = useState<VariableDef[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setName(template?.name ?? "");
      setDescription(template?.description ?? "");
      setBodyHtml(template?.bodyHtml ?? "");
      setVariables((template?.variables as VariableDef[]) ?? []);
      setError(null);
    }
  }, [open, template]);

  const addVariable = () => {
    setVariables((prev) => [...prev, { key: "", label: "", type: "text" }]);
  };

  const updateVariable = (i: number, field: keyof VariableDef, value: string) => {
    setVariables((prev) =>
      prev.map((v, idx) => (idx === i ? { ...v, [field]: value } : v))
    );
  };

  const removeVariable = (i: number) => {
    setVariables((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !bodyHtml) {
      setError("Name and body HTML are required.");
      return;
    }
    setError(null);
    const validVars = variables.filter((v) => v.key && v.label);
    startTransition(async () => {
      const result = template
        ? await updateTemplate(template.id, { name, description: description || undefined, bodyHtml, variables: validVars })
        : await createTemplate({ name, description: description || undefined, bodyHtml, variables: validVars });
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
      title={template ? "Edit Template" : "New Template"}
      className="dialog-fullscreen"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="e.g. COEO Retainer Agreement" />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Body HTML *</label>
            <p style={{ fontFamily: "var(--font-jost)", fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>
              Use {`{{variable_key}}`} to insert variable values.
            </p>
            <textarea
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              rows={14}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
              placeholder="<h2>Agreement</h2><p>This agreement is between {{client_name}}...</p>"
            />
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={labelStyle}>Variables</label>
              <button
                type="button"
                onClick={addVariable}
                style={{ background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border-dark)", borderRadius: 100, padding: "4px 10px", fontSize: "0.65rem", fontFamily: "var(--font-jost)", cursor: "pointer" }}
              >
                + Add
              </button>
            </div>
            {variables.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 32px", gap: 6 }}>
                  <span style={{ ...labelStyle, marginBottom: 0 }}>Key</span>
                  <span style={{ ...labelStyle, marginBottom: 0 }}>Label</span>
                  <span style={{ ...labelStyle, marginBottom: 0 }}>Type</span>
                  <span />
                </div>
                {variables.map((v, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 32px", gap: 6, alignItems: "center" }}>
                    <input type="text" value={v.key} onChange={(e) => updateVariable(i, "key", e.target.value)} placeholder="client_name" style={inputStyle} />
                    <input type="text" value={v.label} onChange={(e) => updateVariable(i, "label", e.target.value)} placeholder="Client Name" style={inputStyle} />
                    <select value={v.type} onChange={(e) => updateVariable(i, "type", e.target.value)} style={inputStyle}>
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                    </select>
                    <button type="button" onClick={() => removeVariable(i)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16, padding: 4, lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "var(--red)" }}>{error}</p>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
            <button type="button" onClick={onClose} disabled={isPending} style={{ background: "transparent", color: "var(--text-dim)", border: "1px solid var(--border-dark)", borderRadius: 100, padding: "10px 20px", minHeight: 44, fontSize: "0.72rem", fontFamily: "var(--font-jost)", fontWeight: 500, letterSpacing: "0.08em", cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.5 : 1 }}>
              Cancel
            </button>
            <button type="submit" disabled={isPending} style={{ background: "var(--green)", color: "var(--bg)", border: "none", borderRadius: 100, padding: "10px 20px", minHeight: 44, fontSize: "0.72rem", fontFamily: "var(--font-jost)", fontWeight: 500, letterSpacing: "0.08em", cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1 }}>
              {isPending ? "Saving…" : template ? "Save Changes" : "Create Template"}
            </button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
