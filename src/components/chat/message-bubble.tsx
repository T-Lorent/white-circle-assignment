"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5",
          isUser 
            ? "bg-muted/80 text-foreground" 
            : "bg-transparent text-foreground/90"
        )}
      >
        <div className={cn(
          "text-sm leading-relaxed",
          !isUser && "prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted prose-pre:rounded-lg"
        )}>
          {content ? (
            isUser ? (
              <p className="whitespace-pre-wrap">{content}</p>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  pre: ({ children }) => (
                    <pre className="overflow-x-auto rounded-lg bg-muted p-4 my-2">
                      {children}
                    </pre>
                  ),
                  code: ({ className, children, ...props }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code
                        className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      <code className={cn("font-mono text-sm", className)} {...props}>
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0">{children}</p>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            )
          ) : isStreaming ? (
            <span className="inline-block w-2 h-4 bg-foreground/50 animate-pulse rounded-sm" />
          ) : null}
        </div>
      </div>
    </div>
  );
}
