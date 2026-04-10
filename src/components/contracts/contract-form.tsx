"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Dialog } from "@/components/ui/dialog";
import { createContract } from "@/app/actions/contracts";

export type ProjectOption = { id: string; name: string; clientName: string | null };

export function ContractForm({
  open,
  onClose,
  projects,
}: {
  open: boolean;
  onClose: () => void;
  projects: ProjectOption[];
}) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setProjectId(projects[0]?.id ?? "");
      setFileName("");
      setError(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [open, projects]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!projectId) {
      setError("Project is required.");
      return;
    }
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("projectId", projectId);

    startTransition(async () => {
      const result = await createContract(formData);
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
    <Dialog open={open} onClose={onClose} title="New Contract" className="dialog-fullscreen">
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
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}{p.clientName ? ` — ${p.clientName}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>PDF Document</label>
            <label
              style={{
                display: "block",
                border: "1px dashed var(--border-dark)",
                borderRadius: 6,
                padding: 16,
                textAlign: "center",
                cursor: "pointer",
                background: "var(--bg)",
              }}
            >
              <input
                ref={fileRef}
                type="file"
                name="pdf"
                accept=".pdf,application/pdf"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                style={{ display: "none" }}
              />
              <p style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: fileName ? "var(--text)" : "var(--text-muted)" }}>
                {fileName || "Click to upload PDF"}
              </p>
              {!fileName && (
                <p style={{ fontFamily: "var(--font-jost)", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                  PDF files only. Optional — you can upload later.
                </p>
              )}
            </label>
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
              {isPending ? "Creating…" : "Create Contract"}
            </button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
