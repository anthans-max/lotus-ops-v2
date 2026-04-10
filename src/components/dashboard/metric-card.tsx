export function MetricCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "green" | "red" | "accent";
}) {
  const valueColor =
    accent === "green"
      ? "var(--green)"
      : accent === "red"
      ? "var(--red)"
      : accent === "accent"
      ? "var(--accent)"
      : "var(--text)";

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "20px 20px",
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
          marginBottom: 8,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "2rem",
          fontWeight: 600,
          color: valueColor,
          lineHeight: 1,
          marginBottom: sub ? 6 : 0,
        }}
      >
        {value}
      </p>
      {sub && (
        <p
          style={{
            fontFamily: "var(--font-jost)",
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
