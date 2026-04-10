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
    <div className="flex items-center justify-between flex-wrap gap-3 pt-5 pb-4 md:pt-8 md:pb-5 border-b border-border mb-6 md:mb-8">
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
