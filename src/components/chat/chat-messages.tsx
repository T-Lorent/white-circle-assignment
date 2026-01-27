"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./message-bubble";
import type { Message } from "@/lib/db/schema";
import type { PiiRange } from "@/app/api/pii/scan/route";

interface ChatMessagesProps {
  messages: Message[];
  streamingContent?: string;
  isStreaming?: boolean;
  streamingPiiRanges?: PiiRange[];
}

export function ChatMessages({
  messages,
  streamingContent,
  isStreaming,
  streamingPiiRanges = [],
}: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2 text-muted-foreground">
          <p className="text-base">Start a conversation</p>
          <p className="text-sm opacity-70">Type a message below to begin</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div ref={scrollRef} className="max-w-3xl mx-auto flex flex-col gap-4 p-4 py-8">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
          />
        ))}
        {isStreaming && (
          <MessageBubble
            role="assistant"
            content={streamingContent || ""}
            isStreaming={true}
            piiRanges={streamingPiiRanges}
          />
        )}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
