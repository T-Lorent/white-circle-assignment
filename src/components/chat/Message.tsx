"use client";

// LIBRARIES
import ReactMarkdown, { Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import { ReactNode } from "react";

// COMPONENTS
import { SpoilerText } from "./SpoilerText";

// UTILS
import { cn } from "@/lib/utils";

/*========== PROPS ==========*/
export interface MessageProps {
  role: "user" | "assistant";
  content: string;
}

/*========== CUSTOM MARKDOWN COMPONENTS ==========*/
// Extend Components type to include custom <pii> element
type ExtendedComponents = Components & {
  pii?: React.ComponentType<{ children?: ReactNode }>;
};

// Custom components including non-standard HTML elements like <pii>
const markdownComponents: ExtendedComponents = {
  // Handle <pii> tags with SpoilerText component
  pii: ({ children }: { children?: ReactNode }) => (
    <SpoilerText>{children}</SpoilerText>
  ),
};

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
        <ReactMarkdown
          rehypePlugins={[rehypeRaw]}
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
