"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import FloatingDots from "@/components/ui/FloatingDots";
import CssIcon from "@/components/ui/CssIcon";

const HIGHLIGHTS = [
  { icon: "kanban" as const, title: "Visual Deal Pipeline", desc: "Track every mattress inquiry from New Lead to Won" },
  { icon: "bag" as const, title: "Store POS & Billing", desc: "Instant invoicing, stock sync & Razorpay/COD support" },
  { icon: "refresh" as const, title: "100-Night Trial & Returns", desc: "Seamless warranty, trial tracking & support inbox" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!res || res.error) {
        setError(
          res?.error && res.error !== "CredentialsSignin"
            ? res.error
            : "Invalid email or password. Please try again."
        );
      } else {
        window.location.href = "/";
      }
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <FloatingDots />

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-[32px] shadow-2xl shadow-primary/10 border border-[#E6E2D8] overflow-hidden">
        {/* Left Brand Panel */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-5 bg-gradient-to-br from-[#2F4838] via-[#355541] to-[#23372A] text-white p-8 flex flex-col justify-between relative overflow-hidden"
        >
          <span className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-white/5" />
          <span className="absolute -left-10 -bottom-10 w-36 h-36 rounded-full bg-gold/15" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5 mb-6">
              <span className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/15">
                <CssIcon name="diamond" size={16} className="text-goldShine" />
              </span>
              <div>
                <p className="font-heading text-lg font-bold leading-tight">Flo India CRM</p>
                <p className="text-[11px] font-body text-white/65">Sleep Solutions Platform</p>
              </div>
            </div>

            <h2 className="text-2xl font-heading leading-snug mb-2">
              Manage Leads, Orders &amp; Sleep Trials in One Place
            </h2>
            <p className="text-xs font-body text-white/70 leading-relaxed mb-6">
              Built for Flo India teams — fast POS billing, WhatsApp lead capture, and 100-Night Trial support.
            </p>

            <div className="space-y-4">
              {HIGHLIGHTS.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CssIcon name={item.icon} size={14} className="text-goldShine" />
                  </span>
                  <div>
                    <p className="text-xs font-heading font-semibold text-white">{item.title}</p>
                    <p className="text-[11px] font-body text-white/65 leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-body text-white/65">
            <span>100-Night Free Trial</span>
            <span>•</span>
            <span>10-Year Warranty</span>
          </div>
        </motion.div>

        {/* Right Login Form Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="lg:col-span-7 p-7 sm:p-10 flex flex-col justify-center"
        >
          <div className="mb-7">
            <h1 className="text-2xl sm:text-3xl font-heading text-primary mb-1">Welcome Back</h1>
            <p className="text-xs sm:text-sm font-body text-text/55">
              Sign in to access your Flo India CRM workspace
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-body font-semibold text-text/70 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@floindia.com"
                className="w-full px-4 py-3 rounded-2xl border border-[#E6E2D8] bg-[#F7F6F2]/70 font-body text-sm outline-none focus:bg-white focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-body font-semibold text-text/70 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-11 rounded-2xl border border-[#E6E2D8] bg-[#F7F6F2]/70 font-body text-sm outline-none focus:bg-white focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-text/45 hover:text-primary hover:bg-softPink transition-colors"
                >
                  <CssIcon name="eye" size={15} />
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-danger text-xs font-body bg-danger/5 border border-danger/20 px-3.5 py-2.5 rounded-xl"
              >
                <CssIcon name="alert" size={14} />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="pt-1">
              <Button type="submit" fullWidth disabled={loading}>
                {loading ? "Signing in..." : "Sign In to Workspace"}
              </Button>
            </div>
          </form>

          {/* Demo Quick-Fill Credentials */}
          <div className="mt-6 p-4 bg-softPink/70 rounded-2xl border border-[#E6E2D8] space-y-2">
            <p className="text-[11px] font-body font-semibold text-text/55 uppercase tracking-wider text-center">
              Quick Demo Access (Click to Fill)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-body">
              <button
                type="button"
                onClick={() => {
                  setEmail("owner@floindia.com");
                  setPassword("Priya@2026#CRM");
                  setError("");
                }}
                className="text-left px-3 py-2 rounded-xl bg-white hover:border-primary/40 border border-[#E6E2D8] transition-all"
              >
                <span className="font-semibold text-primary block">Owner Account</span>
                <span className="text-[11px] text-text/55">owner@floindia.com</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("sales@floindia.com");
                  setPassword("Priya@2026#CRM");
                  setError("");
                }}
                className="text-left px-3 py-2 rounded-xl bg-white hover:border-primary/40 border border-[#E6E2D8] transition-all"
              >
                <span className="font-semibold text-primary block">Sales Rep Account</span>
                <span className="text-[11px] text-text/55">sales@floindia.com</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
