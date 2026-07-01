"use client";

import { useEffect, useState, useTransition } from "react";
import {
  generateInvoiceSummary,
  saveInvoiceSummary,
} from "@/app/actions/invoices";

export function InvoiceSummaryCard({
  invoiceId,
  initialSummary,
}: {
  invoiceId: string;
  initialSummary: string | null;
}) {
  const [summary, setSummary] = useState(initialSummary ?? "");
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [isGenerating, startGenerate] = useTransition();
  const [isSaving, startSave] = useTransition();

  useEffect(() => {
    if (!savedFlash) return;
    const t = setTimeout(() => setSavedFlash(false), 2000);
    return () => clearTimeout(t);
  }, [savedFlash]);

  const handleGenerate = () => {
    setError(null);
    startGenerate(async () => {
      const result = await generateInvoiceSummary(invoiceId);
      if (result.success) {
        setSummary(result.data.summary);
      } else {
        setError(result.error);
      }
    });
  };

  const handleSave = () => {
    setError(null);
    startSave(async () => {
      const result = await saveInvoiceSummary(invoiceId, summary);
      if (result.success) {
        setSavedFlash(true);
      } else {
        setError(result.error);
      }
    });
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-syne)",
    fontSize: "0.75rem",
    fontWeight: 500,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    display: "block",
    marginBottom: 10,
  };

  const buttonBase: React.CSSProperties = {
    border: "none",
    borderRadius: 100,
    padding: "10px 16px",
    minHeight: 44,
    fontSize: "0.875rem",
    fontFamily: "var(--font-jost)",
    fontWeight: 500,
    letterSpacing: "0.06em",
  };

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: 20,
        marginBottom: 24,
      }}
    >
      <span style={labelStyle}>Summary of Key Activities</span>

      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        rows={6}
        style={{
          width: "100%",
          minHeight: 140,
          resize: "vertical",
          padding: 12,
          border: "1px solid var(--border-dark)",
          borderRadius: 8,
          background: "var(--bg)",
          color: "var(--text)",
          fontFamily: "var(--font-jost)",
          fontSize: 16,
          lineHeight: 1.5,
        }}
        placeholder="Click Generate Summary to draft from time entries, or write your own."
      />

      <div
        style={{
          marginTop: 6,
          textAlign: "right",
          fontFamily: "var(--font-jost)",
          fontSize: 12,
          color: summary.length > 900 ? "var(--red)" : "var(--text-muted)",
        }}
      >
        {summary.length.toLocaleString("en-US")} / 900
        {summary.length > 900 && " — Summary may push invoice to two pages"}
      </div>

      {error && (
        <p
          style={{
            marginTop: 10,
            fontFamily: "var(--font-jost)",
            fontSize: 16,
            color: "var(--red)",
          }}
        >
          {error}
        </p>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
          marginTop: 14,
        }}
      >
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || isSaving}
          style={{
            ...buttonBase,
            background: "var(--tan)",
            color: "var(--text)",
            cursor: isGenerating || isSaving ? "not-allowed" : "pointer",
            opacity: isGenerating || isSaving ? 0.7 : 1,
          }}
        >
          {isGenerating ? "Generating…" : "Generate Summary"}
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={isGenerating || isSaving}
          style={{
            ...buttonBase,
            background: "var(--green)",
            color: "#FFFFFF",
            cursor: isGenerating || isSaving ? "not-allowed" : "pointer",
            opacity: isGenerating || isSaving ? 0.7 : 1,
          }}
        >
          {isSaving ? "Saving…" : "Save Summary"}
        </button>

        {savedFlash && (
          <span
            style={{
              fontFamily: "var(--font-jost)",
              fontSize: 12,
              color: "var(--green)",
            }}
          >
            Saved ✓
          </span>
        )}
      </div>
    </div>
  );
}
