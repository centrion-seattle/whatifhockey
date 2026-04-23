"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Minimal hover/focus tooltip. CSS-only show/hide via `group-hover`
 * and `group-focus-within` so no JS listeners are required.
 * The native `title` is also set for a11y / long-press.
 */
export function Tooltip({
  content,
  children,
  className,
  contentClassName,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const titleText =
    typeof content === "string" ? content : undefined;
  return (
    <span
      className={cn("group relative inline-flex items-center", className)}
      title={titleText}
    >
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 top-full z-20 mt-1 hidden w-64 -translate-x-1/2 rounded-md border border-border bg-popover p-2 text-xs font-normal leading-snug text-popover-foreground shadow-md",
          "group-hover:block group-focus-within:block",
          contentClassName,
        )}
      >
        {content}
      </span>
    </span>
  );
}
