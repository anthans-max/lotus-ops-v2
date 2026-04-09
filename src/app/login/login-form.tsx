"use client";

import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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
        fontSize: "0.85rem",
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
