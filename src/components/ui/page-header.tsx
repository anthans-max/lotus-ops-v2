import React from "react";

interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, actions }: PageHeaderProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        paddingTop: 28,
        paddingBottom: 16,
        borderBottom: "1px solid var(--border)",
        marginBottom: 28,
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "1.75rem",
            fontWeight: 600,
            color: "var(--text)",
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: 11,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.3px",
            marginTop: 3,
          }}
        >
          {today}
        </p>
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}
