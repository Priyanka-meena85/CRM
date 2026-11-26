"use client";

import { motion } from "framer-motion";

export default function MarqueeStrip() {
  const text =
    " • Diwali Offer Live • New Stock Aaya Hai • VIP Customers Welcome • Priya Boutique Nathdwara • Premium Collection • ";

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-maroon to-maroonLight text-white py-1.5 overflow-hidden">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap"
      >
        <span className="font-body text-xs tracking-wider">{text}{text}</span>
      </motion.div>
    </div>
  );
}
