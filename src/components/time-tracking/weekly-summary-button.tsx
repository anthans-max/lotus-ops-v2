"use client";

import { useMemo, useState } from "react";

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

export function WeeklySummaryButton() {
  const [open, setOpen] = useState(false);
  // TODO: replace with Jack's email
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<
    { type: "success" | "error"; text: string } | null
  >(null);

  const { weekStart, weekEnd } = useMemo(() => {
    const start = getMondayOf(new Date());
    const end = new Date(start.getTime() + 6 * 86400000);
    return { weekStart: fmtDate(start), weekEnd: fmtDate(end) };
  }, []);

  const handleSend = async () => {
    setSending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/email/time-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekStart,
          weekEnd,
          recipientEmail,
          recipientName,
        }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (res.ok && data.success) {
        setMessage({ type: "success", text: `Summary sent to ${recipientEmail}` });
      } else {
        setMessage({ type: "error", text: data.error ?? "Failed to send" });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to send",
      });
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (sending) return;
    setOpen(false);
    setMessage(null);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 6,
    border: "1px solid var(--border-dark)",
    background: "var(--bg)",
    fontFamily: "var(--font-jost)",
    fontSize: 13,
    color: "var(--text)",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "var(--font-syne)",
    fontSize: "0.58rem",
    fontWeight: 500,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    marginBottom: 6,
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
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
          cursor: "pointer",
        }}
      >
        Send Weekly Summary
      </button>

      {open && (
        <div
          onClick={handleClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg)",
              borderRadius: 12,
              padding: 24,
              width: "100%",
              maxWidth: 440,
              boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "1.4rem",
                fontWeight: 600,
                color: "var(--text)",
                margin: "0 0 20px 0",
              }}
            >
              Send Weekly Summary
            </h3>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Recipient Email</label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Recipient Name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Week Range</label>
              <div
                style={{
                  fontFamily: "var(--font-jost)",
                  fontSize: 13,
                  color: "var(--text)",
                  padding: "10px 12px",
                  background: "var(--tan)",
                  borderRadius: 6,
                }}
              >
                {weekStart} → {weekEnd}
              </div>
            </div>

            {message && (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 6,
                  marginBottom: 14,
                  fontFamily: "var(--font-jost)",
                  fontSize: 13,
                  background:
                    message.type === "success" ? "var(--accent-pale)" : "var(--red-pale)",
                  color: message.type === "success" ? "var(--accent)" : "var(--red)",
                  border: `1px solid ${message.type === "success" ? "var(--accent)" : "var(--red)"}`,
                }}
              >
                {message.text}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={handleClose}
                disabled={sending}
                style={{
                  background: "transparent",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border-dark)",
                  borderRadius: 100,
                  padding: "10px 20px",
                  minHeight: 44,
                  fontSize: "0.72rem",
                  fontFamily: "var(--font-jost)",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  cursor: sending ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !recipientEmail || !recipientName}
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
                  cursor:
                    sending || !recipientEmail || !recipientName ? "not-allowed" : "pointer",
                  opacity: sending || !recipientEmail || !recipientName ? 0.6 : 1,
                }}
              >
                {sending ? "Sending…" : "Send Summary"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
