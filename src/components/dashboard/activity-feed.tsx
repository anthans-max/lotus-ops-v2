import Link from "next/link";

export type ActivityItem = {
  id: string;
  type: "invoice" | "contract" | "time";
  label: string;
  sub: string;
  href: string;
  date: Date | null;
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) return null;

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "20px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-syne)",
          fontSize: "0.58rem",
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: 16,
        }}
      >
        Recent Activity
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {items.map((item, i) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 0",
              borderTop: i === 0 ? "none" : "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background:
                    item.type === "invoice"
                      ? "var(--accent)"
                      : item.type === "contract"
                      ? "var(--green)"
                      : "var(--text-muted)",
                  flexShrink: 0,
                }}
              />
              <div>
                <Link
                  href={item.href}
                  style={{
                    fontFamily: "var(--font-jost)",
                    fontSize: 13,
                    color: "var(--text)",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  {item.label}
                </Link>
                <p
                  style={{
                    fontFamily: "var(--font-jost)",
                    fontSize: 12,
                    color: "var(--text-muted)",
                  }}
                >
                  {item.sub}
                </p>
              </div>
            </div>
            {item.date && (
              <span
                style={{
                  fontFamily: "var(--font-jost)",
                  fontSize: 11,
                  color: "var(--text-muted)",
                  whiteSpace: "nowrap",
                  marginLeft: 12,
                }}
              >
                {item.date.toLocaleDateString()}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
