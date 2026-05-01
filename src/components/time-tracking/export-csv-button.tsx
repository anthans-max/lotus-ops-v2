"use client";

import { useState } from "react";

function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function ExportCsvButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date();
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const from = fmtDate(firstOfMonth);
      const to = fmtDate(today);

      const res = await fetch(
        `/api/time-tracking/export-csv?from=${from}&to=${to}`
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Export failed (${res.status})`);
      }

      const csv = await res.text();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const filename = `time-report-${from.slice(0, 7)}.csv`;
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
      <button
        onClick={handleExport}
        disabled={loading}
        style={{
          background: "var(--green)",
          color: "#ffffff",
          border: "none",
          borderRadius: 100,
          padding: "10px 20px",
          minHeight: 44,
          fontSize: "0.72rem",
          fontFamily: "var(--font-jost)",
          fontWeight: 500,
          letterSpacing: "0.08em",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Exporting…" : "Export Month CSV"}
      </button>
      {error && (
        <span
          style={{
            fontFamily: "var(--font-jost)",
            fontSize: 12,
            color: "var(--red)",
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
