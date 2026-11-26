"use client";

import { cn } from "@/lib/utils";

export type CssIconName =
  | "search"
  | "close"
  | "plus"
  | "minus"
  | "check"
  | "user"
  | "users"
  | "bag"
  | "package"
  | "chat"
  | "phone"
  | "calendar"
  | "chart"
  | "kanban"
  | "refresh"
  | "alert"
  | "bot"
  | "settings"
  | "logout"
  | "send"
  | "eye"
  | "trash"
  | "download"
  | "flame"
  | "sun"
  | "snow"
  | "star"
  | "diamond"
  | "rupee"
  | "scissors"
  | "bell"
  | "info"
  | "dashboard"
  | "trend"
  | "arrow-right"
  | "arrow-left"
  | "clock"
  | "sparkles";

interface CssIconProps {
  name: CssIconName;
  size?: number;
  className?: string;
}

export default function CssIcon({ name, size = 16, className }: CssIconProps) {
  const scale = size / 16;
  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex items-center justify-center shrink-0 select-none", className)}
      style={{ width: size, height: size }}
    >
      <span
        className={`css-icon css-icon-${name}`}
        style={{ transform: `scale(${scale})` }}
      />
    </span>
  );
}
