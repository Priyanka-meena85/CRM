"use client";

import CssIcon from "@/components/ui/CssIcon";

export default function SectionDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 my-8 ${className}`}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <CssIcon name="diamond" size={12} className="text-gold" />
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
    </div>
  );
}
