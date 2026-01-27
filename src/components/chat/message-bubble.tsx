"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Spoiler } from "@/components/ui/spoiler";
import type { PiiRange } from "@/app/api/pii/scan/route";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  piiRanges?: PiiRange[];
}

export function MessageBubble({
  role,
  content,
  isStreaming,
  piiRanges = [],
}: MessageBubbleProps) {
  const isUser = role === "user";

  // Pre-process content with PII markers for markdown rendering
  const processedContent = useMemo(() => {
    if (piiRanges.length === 0 || isUser) return content;

    // For assistant messages, we'll use markers that markdown won't touch
    // Then we'll replace them in the text renderer
    let result = content;
    const sortedRanges = [...piiRanges].sort((a, b) => b.start - a.start);

    for (const range of sortedRanges) {
      if (range.start >= result.length) continue;
      const end = Math.min(range.end, result.length);
      const piiText = result.slice(range.start, end);
      // Use a marker format that won't be affected by markdown
      result =
        result.slice(0, range.start) +
        `⟦PII⟧${piiText}⟦/PII⟧` +
        result.slice(end);
    }

    return result;
  }, [content, piiRanges, isUser]);

  // Custom text renderer that handles PII markers
  const renderTextWithPii = (text: string, keyPrefix = ""): React.ReactNode => {
    if (!text.includes("⟦PII⟧")) return text;

    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIndex = 0;

    while (remaining.includes("⟦PII⟧")) {
      const startIndex = remaining.indexOf("⟦PII⟧");
      const endIndex = remaining.indexOf("⟦/PII⟧");

      if (endIndex === -1) break;

      // Add text before marker
      if (startIndex > 0) {
        parts.push(remaining.slice(0, startIndex));
      }

      // Add spoiler content
      const piiContent = remaining.slice(startIndex + 5, endIndex);
      parts.push(
        <Spoiler key={`${keyPrefix}pii-${keyIndex++}`}>{piiContent}</Spoiler>,
      );

      remaining = remaining.slice(endIndex + 6);
    }

    // Add remaining text
    if (remaining) {
      parts.push(remaining);
    }

    return parts.length > 0 ? parts : text;
  };

  // Helper to recursively process children and apply PII spoilers
  const processChildren = (
    children: React.ReactNode,
    keyPrefix = "",
  ): React.ReactNode => {
    return React.Children.map(children, (child, index) => {
      if (typeof child === "string") {
        return renderTextWithPii(child, `${keyPrefix}${index}-`);
      }
      if (React.isValidElement<{ children?: React.ReactNode }>(child)) {
        if (child.props.children) {
          return React.cloneElement(child, {
            children: processChildren(
              child.props.children,
              `${keyPrefix}${index}-`,
            ),
          });
        }
      }
      return child;
    });
  };

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5",
          isUser ?
            "bg-muted/80 text-foreground"
          : "bg-transparent text-foreground/90",
        )}
      >
        <div
          className={cn(
            "text-sm leading-relaxed",
            !isUser &&
              "prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted prose-pre:rounded-lg",
          )}
        >
          {content ?
            isUser ?
              <p className="whitespace-pre-wrap">{content}</p>
            : <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  pre: ({ children }) => (
                    <pre className="overflow-x-auto rounded-lg bg-muted p-4 my-2">
                      {processChildren(children, "pre-")}
                    </pre>
                  ),
                  code: ({ className, children, ...props }) => {
                    const isInline = !className;
                    return isInline ?
                        <code
                          className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
                          {...props}
                        >
                          {processChildren(children, "code-")}
                        </code>
                      : <code
                          className={cn("font-mono text-sm", className)}
                          {...props}
                        >
                          {processChildren(children, "codeblock-")}
                        </code>;
                  },
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0">
                      {processChildren(children, "p-")}
                    </p>
                  ),
                  li: ({ children }) => (
                    <li>{processChildren(children, "li-")}</li>
                  ),
                  strong: ({ children }) => (
                    <strong>{processChildren(children, "strong-")}</strong>
                  ),
                  em: ({ children }) => (
                    <em>{processChildren(children, "em-")}</em>
                  ),
                }}
              >
                {processedContent}
              </ReactMarkdown>

          : isStreaming ?
            <span className="inline-block w-2 h-4 bg-foreground/50 animate-pulse rounded-sm" />
          : null}
        </div>
      </div>
    </div>
  );
}
