// DATABASE
import { getChats } from "@/lib/db";

// COMPONENTS
import { Sidebar } from "@/components/sidebar/Sidebar";

// Force dynamic rendering - database calls require runtime
export const dynamic = "force-dynamic";

/*========== LAYOUT ==========*/
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const chats = await getChats();

  return (
    <div className="flex w-full h-screen">
      <Sidebar chats={chats} />
      <main className="flex-1 h-full overflow-hidden">{children}</main>
    </div>
  );
}
