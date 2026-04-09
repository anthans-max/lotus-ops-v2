"use client";

import { useEffect, useRef } from "react";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirm Delete",
  message = "Are you sure? This action cannot be undone.",
  confirmLabel = "Delete",
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  loading?: boolean;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(61, 46, 30, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "var(--bg)",
          borderRadius: 12,
          border: "1px solid var(--border)",
          padding: 28,
          width: 380,
          maxWidth: "90vw",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "1.15rem",
            fontWeight: 600,
            color: "var(--text)",
            marginBottom: 12,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontFamily: "var(--font-jost)",
            fontSize: 13,
            color: "var(--text-dim)",
            marginBottom: 24,
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>
        <div
          style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: "transparent",
              color: "var(--text-dim)",
              border: "1px solid var(--border-dark)",
              borderRadius: 100,
              padding: "7px 18px",
              fontSize: "0.72rem",
              fontFamily: "var(--font-jost)",
              fontWeight: 500,
              letterSpacing: "0.08em",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.15s",
              opacity: loading ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              background: "var(--red-pale)",
              color: "var(--red)",
              border: "none",
              borderRadius: 100,
              padding: "7px 18px",
              fontSize: "0.72rem",
              fontFamily: "var(--font-jost)",
              fontWeight: 500,
              letterSpacing: "0.08em",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.15s",
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
