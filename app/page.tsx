"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import FloatingDots from "@/components/ui/FloatingDots";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      const role = (session?.user as any)?.role;
      router.push(role === "OWNER" ? "/dashboard" : "/shop");
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <FloatingDots />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center z-10"
      >
        <h1 className="text-5xl font-heading text-primary mb-3">Priya Boutique</h1>
        <p className="font-body text-text/60">Loading...</p>
      </motion.div>
    </div>
  );
}
