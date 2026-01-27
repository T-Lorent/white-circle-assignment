// LIBRARIES
import Link from "next/link";
import { Plus } from "lucide-react";

// DATABASE
import { Chat } from "@/lib/db";

// UTILS
import { cn } from "@/lib/utils";

// COMPONENTS
import { ChatList } from "./ChatList";

/*========== PROPS ==========*/
interface SidebarProps {
  chats: Chat[];
}

/*========== COMPONENT ==========*/
export function Sidebar({ chats }: SidebarProps) {
  return (
    <aside className="flex flex-col w-72 h-screen border-r border-border bg-background">
      {/* NEW CHAT BUTTON */}
      <div className="flex justify-end p-4">
        <Link
          href="/"
          className={cn(
            "w-fit p-3",
            "flex items-center justify-center gap-2",
            "border border-border hover:bg-accent transition-colors",
            "rounded-full cursor-pointer",
          )}
        >
          <Plus className="size-5" />
        </Link>
      </div>

      {/* CHAT LIST */}
      <ChatList chats={chats} />
    </aside>
  );
}
