"use client";

import { motion } from "framer-motion";
import CssIcon from "@/components/ui/CssIcon";

interface WhatsAppButtonProps {
  onClick?: () => void;
  label?: string;
}

export default function WhatsAppButton({ onClick, label = "WhatsApp" }: WhatsAppButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="relative flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-full font-body font-semibold shadow-lg hover:shadow-xl transition-shadow"
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full border-2 border-[#25D366] animate-ping opacity-30" />
      <CssIcon name="chat" size={16} />
      {label}
    </motion.button>
  );
}
