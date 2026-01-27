"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ConversationList } from "./conversation-list";
import type { Conversation } from "@/lib/db/schema";

export function AppSidebar() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleNewChat = async () => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }),
      });

      if (response.ok) {
        const conversation = await response.json();
        setConversations((prev) => [conversation, ...prev]);
        router.push(`/chat/${conversation.id}`);
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="flex items-center justify-center py-4">
        <Button
          onClick={handleNewChat}
          size="icon"
          variant="outline"
          className="size-9 rounded-full border-muted-foreground/30"
        >
          <Plus className="size-4" />
          <span className="sr-only">New Chat</span>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-2">
          <SidebarGroupContent>
            {isLoading ? (
              <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                Loading...
              </div>
            ) : (
              <ConversationList
                conversations={conversations}
                onDelete={handleDelete}
              />
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
