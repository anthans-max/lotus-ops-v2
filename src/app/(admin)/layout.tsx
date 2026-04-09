import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";

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
      <Sidebar
        userEmail={user.email ?? ""}
        userName={user.user_metadata?.full_name ?? user.email ?? ""}
        avatarUrl={user.user_metadata?.avatar_url}
      />
      <main
        style={{
          flex: 1,
          padding: "28px",
          overflowY: "auto",
          background: "var(--bg)",
        }}
      >
        {children}
      </main>
    </div>
  );
}
