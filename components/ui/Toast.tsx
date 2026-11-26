"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import CssIcon, { CssIconName } from "@/components/ui/CssIcon";
import { cn } from "@/lib/utils";

export interface ToastData {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

let toastListeners: ((toast: ToastData) => void)[] = [];

export function showToast(message: string, type: ToastData["type"] = "success") {
  const toast: ToastData = { id: Date.now().toString(), message, type };
  toastListeners.forEach((fn) => fn(toast));
}

const icons: Record<ToastData["type"], CssIconName> = {
  success: "check",
  error: "alert",
  info: "info",
};

const colors = {
  success: "bg-[#2F4838] text-white border border-white/15",
  error: "bg-danger text-white border border-white/15",
  info: "bg-white text-primary border border-[#E6E2D8]",
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handler = (toast: ToastData) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3500);
    };
    toastListeners.push(handler);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== handler);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          return (
            <motion.div
              key={toast.id}
              initial={{ y: 60, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={cn(
                "flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg font-body text-sm min-w-[280px]",
                colors[toast.type]
              )}
            >
              <CssIcon name={icons[toast.type]} size={16} />
              <span className="flex-1">{toast.message}</span>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                <CssIcon name="close" size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
