"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface SpoilerProps {
  children: React.ReactNode;
  className?: string;
}

export function Spoiler({ children, className }: SpoilerProps) {
  const [revealed, setRevealed] = useState(false);

  const handleClick = useCallback(() => {
    setRevealed((prev) => !prev);
  }, []);

  return (
    <span
      className={cn("spoiler", revealed && "revealed", className)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
      aria-label={revealed ? "Click to hide" : "Click to reveal hidden content"}
    >
      {children}
    </span>
  );
}
