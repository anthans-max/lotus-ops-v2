import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";
import { BottomTabBar } from "@/components/bottom-tab-bar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div className="hidden md:flex">
        <Sidebar
          userEmail={user.email ?? ""}
          userName={user.user_metadata?.full_name ?? user.email ?? ""}
          avatarUrl={user.user_metadata?.avatar_url}
        />
      </div>
      <main className="flex-1 overflow-y-auto bg-bg pb-16 md:pb-0">
        {/* Mobile top bar — hidden on desktop via class already scanned in this file */}
        <div
          className="md:hidden"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            padding: "10px 20px",
          }}
        >
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
        <div className="px-6 pb-8 md:px-10 md:pb-10">{children}</div>
      </main>
      <BottomTabBar />
    </div>
  );
}
