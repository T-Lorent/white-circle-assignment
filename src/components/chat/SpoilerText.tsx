"use client";

// LIBRARIES
import { useState, ReactNode } from "react";

// UTILS
import { cn } from "@/lib/utils";

/*========== PROPS ==========*/
interface SpoilerTextProps {
  children: ReactNode;
}

/*========== COMPONENT ==========*/
export function SpoilerText({ children }: SpoilerTextProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  const toggle = () => setIsRevealed((prev) => !prev);

  /*---------- RENDERER ----------*/
  return (
    <span
      onClick={toggle}
      className={cn(
        "inline rounded px-0.5 cursor-pointer transition-colors duration-200",
        isRevealed ?
          "bg-muted hover:bg-muted/80"
        : "bg-muted-foreground/60 hover:bg-muted-foreground/80",
      )}
      title={isRevealed ? "Click to hide" : "Click to reveal"}
    >
      <span
        className={cn(
          "transition-opacity duration-200 select-none",
          isRevealed ? "opacity-100" : "opacity-0",
        )}
      >
        {children}
      </span>
    </span>
  );
}
