"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "vip" | "inactive" | "success" | "danger" | "info";
  className?: string;
}

const styles: Record<string, string> = {
  vip: "bg-gradient-to-r from-gold to-goldShine text-white",
  inactive: "bg-danger/10 text-danger",
  success: "bg-success/10 text-success",
  danger: "bg-danger/10 text-danger",
  info: "bg-primary/10 text-primary",
};

export default function Badge({ children, variant = "info", className }: BadgeProps) {
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold font-body",
        styles[variant],
        variant === "vip" && "shimmer-badge",
        className
      )}
    >
      {variant === "vip" && <span className="text-sm">👑</span>}
      {children}
    </motion.span>
  );
}
