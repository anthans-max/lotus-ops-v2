"use client";

import { useState, useMemo } from "react";

type MonthOption = {
  value: string;
  label: string;
  from: string;
  to: string;
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function buildMonthOptions(now: Date): MonthOption[] {
  const months: MonthOption[] = [];
  const year = now.getFullYear();
  const month = now.getMonth();
  for (let i = 0; i < 12; i++) {
    const d = new Date(year, month - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const lastDay = new Date(y, m + 1, 0).getDate();
    months.push({
      value: `${y}-${pad2(m + 1)}`,
      label: d.toLocaleString("en-US", { month: "long", year: "numeric" }),
      from: `${y}-${pad2(m + 1)}-01`,
      to: `${y}-${pad2(m + 1)}-${pad2(lastDay)}`,
    });
  }
  return months;
}

export function ExportCsvButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const monthOptions = useMemo(() => buildMonthOptions(new Date()), []);
  // Default to the previous calendar month (index 1 in the descending list)
  // so exporting on the 1st of a new month still grabs the right period.
  const [selectedValue, setSelectedValue] = useState(
    monthOptions[1]?.value ?? monthOptions[0].value,
  );

  const selected =
    monthOptions.find((m) => m.value === selectedValue) ?? monthOptions[0];

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    try {
      const { from, to } = selected;
      const res = await fetch(
        `/api/time-tracking/export-csv?from=${from}&to=${to}`,
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

  const selectStyle: React.CSSProperties = {
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid var(--border-dark)",
    background: "var(--bg)",
    fontFamily: "var(--font-jost)",
    fontSize: 16,
    color: "var(--text)",
    outline: "none",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 4,
      }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <select
          value={selectedValue}
          onChange={(e) => setSelectedValue(e.target.value)}
          disabled={loading}
          style={selectStyle}
        >
          {monthOptions.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
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
            fontSize: "0.875rem",
            fontFamily: "var(--font-jost)",
            fontWeight: 500,
            letterSpacing: "0.08em",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Exporting…" : "Export CSV"}
        </button>
      </div>
      {error && (
        <span
          style={{
            fontFamily: "var(--font-jost)",
            fontSize: 16,
            color: "var(--red)",
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
