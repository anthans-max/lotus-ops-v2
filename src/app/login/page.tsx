import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FAF7F2",
      }}
    >
      <div
        style={{
          background: "#F5F1E8",
          border: "1px solid #E0D8CA",
          borderRadius: 12,
          padding: 40,
          width: 380,
          maxWidth: "90vw",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "1.5rem",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#3D2E1E",
            marginBottom: 8,
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
            color: "#A89070",
            marginBottom: 32,
          }}
        >
          AaraSaan Consulting
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
