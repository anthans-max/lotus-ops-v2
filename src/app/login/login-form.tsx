"use client";

import { createClient } from "@/lib/supabase/client";

// Supabase silently falls back to the project's shared "Site URL" (which points
// at a sibling app) whenever redirectTo is not an exact match for an entry in
// the redirect allow-list. window.location.origin is whatever host the browser
// happens to be on -- a *.vercel.app deployment/preview domain, a bare apex, an
// IP in dev -- so pin the canonical origins that are actually allow-listed.
const SITE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://ops.getlotusai.com";

const OAUTH_REDIRECT_TO = `${SITE_URL}/auth/callback`;

export function LoginForm() {
  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: OAUTH_REDIRECT_TO,
      },
    });
  };

  return (
    <button
      onClick={handleLogin}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: "100%",
        background: "#2D4A35",
        color: "#FAF7F2",
        border: "none",
        borderRadius: 100,
        padding: "10px 20px",
        fontSize: "0.875rem",
        fontFamily: "var(--font-jost)",
        fontWeight: 500,
        letterSpacing: "0.05em",
        cursor: "pointer",
        transition: "background 0.2s",
      }}
    >
      Sign in with Google
    </button>
  );
}
