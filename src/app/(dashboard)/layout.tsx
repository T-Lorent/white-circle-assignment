// DATABASE
import { getChats } from "@/lib/db";

// COMPONENTS
import { Sidebar } from "@/components/sidebar/Sidebar";

/*========== LAYOUT ==========*/
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const chats = getChats();

  return (
    <div className="flex w-full h-screen">
      <Sidebar chats={chats} />
      <main className="flex-1 h-full overflow-hidden">{children}</main>
    </div>
  );
}
