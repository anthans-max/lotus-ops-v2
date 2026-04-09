"use client";

import { useEffect } from "react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        gap: 16,
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "1.25rem",
          fontWeight: 600,
          color: "var(--text)",
        }}
      >
        Something went wrong
      </h2>
      <p
        style={{
          fontFamily: "var(--font-jost)",
          fontSize: 13,
          color: "var(--text-dim)",
        }}
      >
        {error.message}
      </p>
      <button
        onClick={() => unstable_retry()}
        style={{
          background: "var(--green)",
          color: "var(--bg)",
          border: "none",
          borderRadius: 100,
          padding: "8px 20px",
          fontSize: "0.72rem",
          fontFamily: "var(--font-jost)",
          fontWeight: 500,
          letterSpacing: "0.08em",
          cursor: "pointer",
          transition: "background 0.2s",
        }}
      >
        Try again
      </button>
    </div>
  );
}
