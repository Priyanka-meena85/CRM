"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import FloatingDots from "@/components/ui/FloatingDots";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!res || res.error) {
      setError(res?.error && res.error !== "CredentialsSignin" ? res.error : "Galat email ya password! Dobara try karo.");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <FloatingDots />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative z-10 bg-white rounded-[28px] p-8 w-full max-w-md shadow-2xl shadow-maroon/10 border border-gold/10"
      >
        {/* Logo & Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-heading text-primary mb-2">Priya Boutique</h1>
          <p className="text-sm font-body text-text/60">
            Customer Kabhi Nahi Bhoolega, Sale Kabhi Nahi Rukegi
          </p>
        </motion.div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-body font-medium text-text/70 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@priya.com"
              className="w-full px-4 py-3 rounded-2xl border border-gold/20 bg-background font-body outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/10 transition-all"
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-body font-medium text-text/70 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="w-full px-4 py-3 rounded-2xl border border-gold/20 bg-background font-body outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/10 transition-all"
              required
            />
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-danger text-sm font-body text-center bg-danger/5 py-2 rounded-xl"
            >
              {error}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Login ho raha hai..." : "Login Karo ✨"}
            </Button>
          </motion.div>
        </form>

        {/* Demo Credentials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 p-4 bg-softPink rounded-2xl"
        >
          <p className="text-xs font-body text-text/50 text-center mb-2">Demo Login:</p>
          <div className="flex flex-col gap-1 text-xs font-body text-text/70">
            <p>
              👑 <strong>Owner:</strong> owner@priya.com / 123456
            </p>
            <p>
              🧑‍💼 <strong>Staff:</strong> raju@priya.com / 123456
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
