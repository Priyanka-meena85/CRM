"use client";

import { motion } from "framer-motion";
import CssIcon from "@/components/ui/CssIcon";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search customer by phone or name...",
  className,
}: SearchInputProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative flex items-center bg-white rounded-full border border-gold/20 px-4 py-2.5 shadow-sm",
        "focus-within:border-gold/50 focus-within:shadow-md focus-within:shadow-gold/10 transition-all duration-300",
        className
      )}
    >
      <CssIcon name="search" size={16} className="text-gold mr-3 flex-shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none text-text font-body placeholder:text-text/40"
      />
    </motion.div>
  );
}
