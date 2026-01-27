"use client";

// LIBRARIES
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MoreVertical, Trash2 } from "lucide-react";

// DATABASE
import { Chat } from "@/lib/db";

// ACTIONS
import { deleteChat } from "@/lib/actions/chats";

// COMPONENTS
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/*========== PROPS ==========*/
interface ChatItemProps {
  chat: Chat;
}

/*========== HELPER FUNCTIONS ==========*/

// Format relative time (e.g., "1 min", "2 hours", "3 days")
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "now";
  if (diffMinutes < 60) return `${diffMinutes} min`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""}`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
}

/*========== COMPONENT ==========*/
export function ChatItem({ chat }: ChatItemProps) {
  const router = useRouter();
  /*---------- STATE ----------*/
  const pathname = usePathname();
  const isActive = pathname === `/chat/${chat.id}`;

  /*---------- HANDLERS ----------*/
  const handleDelete = async () => {
    await deleteChat(chat.id);

    if (isActive) {
      router.push("/");
    }
  };

  /*---------- RENDERER ----------*/
  return (
    <div
      className={`flex items-center relative gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors ${
        isActive ? "bg-accent" : ""
      }`}
    >
      <Link href={`/chat/${chat.id}`} className="absolute inset-0 z-2" />

      <span className="min-w-24 flex-1 truncate text-sm">{chat.title}</span>
      <span className="text-xs text-muted-foreground shrink-0">
        {formatRelativeTime(chat.updated_at)}
      </span>

      {/* THREE DOTS MENU */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded transition-opacity cursor-pointer z-4"
          >
            <MoreVertical className="size-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <Trash2 className="size-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
