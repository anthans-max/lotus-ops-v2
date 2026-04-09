export default function DashboardPage() {
  return (
    <div>
      <h1
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "1.4rem",
          fontWeight: 600,
          color: "var(--text)",
          marginBottom: 8,
        }}
      >
        Dashboard
      </h1>
      <p
        style={{
          fontFamily: "var(--font-jost)",
          fontSize: 13,
          color: "var(--text-muted)",
        }}
      >
        Welcome to Lotus Ops.
      </p>
    </div>
  );
}
