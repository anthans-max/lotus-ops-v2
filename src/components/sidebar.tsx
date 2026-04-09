"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Clients", href: "/clients" },
  { label: "Projects", href: "/projects" },
  { label: "Contracts", href: "/contracts" },
  { label: "Time Tracking", href: "/time-tracking" },
  { label: "Invoices", href: "/invoices" },
  { label: "Settings", href: "/settings" },
];

export function Sidebar({
  userName,
  avatarUrl,
}: {
  userEmail: string;
  userName: string;
  avatarUrl?: string;
}) {
  const pathname = usePathname();

  const handleSignOut = async () => {
    await fetch("/auth/signout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <aside
      style={{
        width: 248,
        minHeight: "100vh",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div style={{ padding: "20px 20px 14px" }}>
        <h1
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "1.25rem",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--text)",
          }}
        >
          Lotus Ops
        </h1>
        <p
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "0.6rem",
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

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "rgba(61, 46, 30, 0.10)",
          margin: "0 12px",
        }}
      />

      {/* Navigation */}
      <nav style={{ padding: "12px", flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "7px 12px",
                  borderRadius: 100,
                  background: isActive ? "var(--green)" : "transparent",
                  color: isActive ? "var(--bg)" : "var(--text-muted)",
                  fontFamily: "var(--font-syne)",
                  fontSize: "0.62rem",
                  fontWeight: 500,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  transition: "all 0.15s",
                  cursor: "pointer",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "rgba(61, 46, 30, 0.10)",
          margin: "0 12px",
        }}
      />

      {/* User + Sign Out */}
      <div style={{ padding: "14px 16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "var(--tan)",
                flexShrink: 0,
              }}
            />
          )}
          <span
            style={{
              fontFamily: "var(--font-jost)",
              fontSize: 13,
              fontWeight: 400,
              color: "var(--text-dim)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {userName}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "transparent",
            color: "var(--text-muted)",
            border: "1px solid var(--border-dark)",
            borderRadius: 100,
            padding: "5px 14px",
            fontSize: "0.65rem",
            fontFamily: "var(--font-jost)",
            fontWeight: 500,
            letterSpacing: "0.06em",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
