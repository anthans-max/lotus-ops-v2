import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";
import { BottomTabBar } from "@/components/bottom-tab-bar";
import { MobileTopBar } from "@/components/mobile-top-bar";

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
        <MobileTopBar />
        <div className="px-6 pb-8 md:px-10 md:pb-10">{children}</div>
      </main>
      <BottomTabBar />
    </div>
  );
}
