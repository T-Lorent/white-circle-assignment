"use client";

import { MoreVertical, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/lib/db/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ConversationListProps {
  conversations: Conversation[];
  onDelete: (id: string) => void;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours} hr`;
  if (diffDays < 7) return `${diffDays} day`;
  return date.toLocaleDateString();
}

export function ConversationList({
  conversations,
  onDelete,
}: ConversationListProps) {
  const pathname = usePathname();

  if (conversations.length === 0) {
    return (
      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
        No conversations yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {conversations.map((conversation) => {
        const isActive = pathname === `/chat/${conversation.id}`;
        return (
          <div
            key={conversation.id}
            className={cn(
              "group relative flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted/50",
              isActive && "bg-muted/50",
            )}
          >
            <span className="size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
            <Link
              href={`/chat/${conversation.id}`}
              className="flex-1 min-w-0 flex items-center justify-between gap-2"
            >
              <span className="truncate text-foreground/90">
                {conversation.title}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatRelativeTime(new Date(conversation.updatedAt))}
              </span>
            </Link>

            <DropdownMenu>
              {/* MENU TRIGGER */}
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted text-muted-foreground transition-all"
                >
                  <MoreVertical className="size-4" />
                  <span className="sr-only">Open menu</span>
                </button>
              </DropdownMenuTrigger>

              {/* MENU CONTENT */}
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conversation.id);
                  }}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="size-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      })}
    </div>
  );
}
