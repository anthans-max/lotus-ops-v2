import Link from "next/link";

const actions = [
  { label: "New Client", href: "/clients", color: "var(--green)" },
  { label: "New Project", href: "/projects", color: "var(--green)" },
  { label: "Log Time", href: "/time-tracking", color: "var(--accent)" },
  { label: "New Invoice", href: "/invoices", color: "var(--accent)" },
];

export function QuickActions() {
  return (
    <div>
      <p
        style={{
          fontFamily: "var(--font-syne)",
          fontSize: "0.58rem",
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: 12,
        }}
      >
        Quick Actions
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {actions.map((a) => (
          <Link
            key={a.href + a.label}
            href={a.href}
            style={{
              background: "var(--green)",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 100,
              padding: "8px 16px",
              fontSize: "0.68rem",
              fontFamily: "var(--font-jost)",
              fontWeight: 500,
              letterSpacing: "0.06em",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
