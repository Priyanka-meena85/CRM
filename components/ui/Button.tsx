"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost" | "whatsapp";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const variantStyles: Record<string, string> = {
  primary:
    "bg-gradient-to-r from-maroon to-maroonLight text-white hover:shadow-lg hover:shadow-maroon/30",
  secondary:
    "bg-white text-maroon border border-maroon/20 hover:bg-softPink",
  success:
    "bg-success text-white hover:bg-green-700",
  danger:
    "bg-danger text-white hover:bg-red-700",
  ghost:
    "bg-transparent text-maroon hover:bg-softPink",
  whatsapp:
    "bg-[#25D366] text-white hover:bg-[#1da851]",
};

const sizeStyles: Record<string, string> = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-6 py-2.5 text-base",
  lg: "px-8 py-3 text-lg",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative overflow-hidden rounded-full font-body font-semibold transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-accent/50",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
      {...(props as any)}
    >
      {/* Gold shine sweep */}
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-goldShine/20 to-transparent hover:translate-x-full transition-transform duration-700" />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
