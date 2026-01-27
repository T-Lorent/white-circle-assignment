"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative flex items-end rounded-full bg-muted/50 border border-muted-foreground/20 px-4 py-2">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything dangerous to test"
          disabled={disabled}
          className="flex-1 bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground/60 max-h-[200px] py-1.5"
          rows={1}
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className={cn(
            "ml-2 size-8 shrink-0 rounded-full flex items-center justify-center transition-colors",
            message.trim() && !disabled
              ? "bg-foreground text-background hover:bg-foreground/90"
              : "bg-muted-foreground/30 text-muted-foreground cursor-not-allowed"
          )}
        >
          <ArrowUp className="size-4" />
          <span className="sr-only">Send message</span>
        </button>
      </div>
    </form>
  );
}
