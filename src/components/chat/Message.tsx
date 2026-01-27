"use client";

// LIBRARIES
import ReactMarkdown from "react-markdown";

// UTILS
import { cn } from "@/lib/utils";

/*========== PROPS ==========*/
export interface MessageProps {
  role: "user" | "assistant";
  content: string;
}

/*========== COMPONENT ==========*/
export function Message({ role, content }: MessageProps) {
  const isUser = role === "user";

  /*---------- RENDERER ----------*/
  if (isUser) {
    return (
      <div className="flex w-full justify-end">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-3xl bg-secondary px-4 py-3 text-secondary-foreground">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-start">
      <div
        className={cn(
          "max-w-[80%] px-4 py-3 rounded-3xl",
          "prose prose-sm",
          "text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-code:text-foreground",
        )}
      >
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
