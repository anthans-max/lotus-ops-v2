"use client";

export function MobileTopBar() {
  return (
    <div
      className="md:hidden"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "1.15rem",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text)",
            lineHeight: 1.1,
          }}
        >
          Lotus Ops
        </h1>
        <p
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "0.55rem",
            fontWeight: 400,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginTop: 2,
          }}
        >
          AaraSaan Consulting
        </p>
      </div>
    </div>
  );
}
