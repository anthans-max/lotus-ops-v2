"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" />
      </svg>
    ),
  },
  {
    label: "Clients",
    href: "/clients",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="6.5" r="3" stroke="currentColor" />
        <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" />
      </svg>
    ),
  },
  {
    label: "Projects",
    href: "/projects",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="16" height="13" rx="2" stroke="currentColor" />
        <path d="M6 4V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1" stroke="currentColor" />
        <path d="M6 9h8M6 13h5" stroke="currentColor" />
      </svg>
    ),
  },
  {
    label: "Contracts",
    href: "/contracts",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 2h9l4 4v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="currentColor" />
        <path d="M13 2v4h4" stroke="currentColor" />
        <path d="M7 9h6M7 12h4" stroke="currentColor" />
      </svg>
    ),
  },
  {
    label: "Time",
    href: "/time-tracking",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" />
        <path d="M10 5.5V10l3 2" stroke="currentColor" />
      </svg>
    ),
  },
  {
    label: "Invoices",
    href: "/invoices",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" />
        <path d="M6 7h8M6 10h5M6 13h3" stroke="currentColor" />
        <path d="M13 12.5h2m0 0 1 1-1 1h-2" stroke="currentColor" />
      </svg>
    ),
  },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="flex md:hidden"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "var(--green)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
      }}
    >
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.href ||
          (tab.href !== "/dashboard" && pathname.startsWith(tab.href));

        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              minHeight: 56,
              padding: "8px 4px",
              textDecoration: "none",
              color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.55)",
              transition: "color 0.15s",
            }}
          >
            {tab.icon}
            <span
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "0.52rem",
                fontWeight: isActive ? 700 : 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
