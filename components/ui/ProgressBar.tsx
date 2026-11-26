"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  className?: string;
}

export default function ProgressBar({ value, label, className }: ProgressBarProps) {
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="flex justify-between mb-1.5 text-sm font-body">
          <span className="text-text/70">{label}</span>
          <span className="font-semibold text-primary">{value}%</span>
        </div>
      )}
      <div className="w-full h-3 bg-softPink rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-maroon to-maroonLight"
        />
      </div>
    </div>
  );
}
