"use client";

// LIBRARIES
import { Send } from "lucide-react";
import { KeyboardEvent, useRef } from "react";

// COMPONENTS
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/*========== PROPS ==========*/
interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

/*========== COMPONENT ==========*/
export function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /*---------- HANDLERS ----------*/
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (value.trim() && !disabled) {
      onSubmit();
    }
  };

  /*---------- RENDERER ----------*/
  return (
    <div className="w-full max-w-3xl mx-auto relative flex items-end gap-2">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="How can I help you today?"
        disabled={disabled}
        className="min-h-12 resize-none rounded-3xl border-border bg-input pr-12 text-foreground placeholder:text-muted-foreground"
        rows={1}
      />

      <Button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        size="icon"
        className="absolute bottom-2 right-2 size-8 rounded-full cursor-pointer"
      >
        <Send className="size-4" />
      </Button>
    </div>
  );
}
