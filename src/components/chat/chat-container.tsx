"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import type { Message } from "@/lib/db/schema";

interface ChatContainerProps {
  conversationId: string;
  initialMessages?: Message[];
}

export function ChatContainer({
  conversationId,
  initialMessages = [],
}: ChatContainerProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");

  // Fetch messages when conversationId changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `/api/conversations/${conversationId}/messages`,
        );
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);

  const handleSend = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      // Optimistically add user message
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId,
        role: "user",
        content,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setStreamingContent("");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId,
            message: content,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let fullResponse = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          fullResponse += text;
          setStreamingContent(fullResponse);
        }

        // After streaming is complete, add the assistant message
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          conversationId,
          role: "assistant",
          content: fullResponse,
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setStreamingContent("");

        // Refresh the router to update sidebar with new conversation title
        router.refresh();
      } catch (error) {
        console.error("Error sending message:", error);
        // Remove the optimistic user message on error
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      } finally {
        setIsStreaming(false);
      }
    },
    [conversationId, isStreaming, router],
  );

  return (
    <div className="flex h-full flex-col">
      <ChatMessages
        messages={messages}
        streamingContent={streamingContent}
        isStreaming={isStreaming}
      />
      <div className="p-4 pb-6">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSend={handleSend} disabled={isStreaming} />
        </div>
      </div>
    </div>
  );
}
