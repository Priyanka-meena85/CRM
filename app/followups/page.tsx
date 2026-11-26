"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import FloatingDots from "@/components/ui/FloatingDots";
import MarqueeStrip from "@/components/ui/MarqueeStrip";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import CountUp from "@/components/ui/CountUp";
import ProgressBar from "@/components/ui/ProgressBar";
import ToastContainer, { showToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/utils";
import CssIcon, { CssIconName } from "@/components/ui/CssIcon";

const FILTER_TABS: { id: string; label: string; icon: CssIconName; color: string }[] = [
  { id: "today",    label: "Today",    icon: "calendar", color: "from-primary to-maroonLight" },
  { id: "overdue",  label: "Overdue",  icon: "alert",    color: "from-danger to-red-700" },
  { id: "upcoming", label: "Upcoming", icon: "clock",    color: "from-gold to-goldShine" },
  { id: "all",      label: "All",      icon: "kanban",   color: "from-blue-500 to-blue-600" },
];

export default function FollowupsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [followups, setFollowups] = useState<any[]>([]);
  const [filter, setFilter] = useState("today");
  const [counts, setCounts] = useState({ today: 0, overdue: 0, upcoming: 0 });

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

  const fetchFollowups = async () => {
    const res = await fetch(`/api/followups?filter=${filter}`);
    if (res.ok) {
      const d = await res.json();
      setFollowups(Array.isArray(d) ? d : []);
    }
  };

  const fetchCounts = async () => {
    const [t, o, u] = await Promise.all([
      fetch("/api/followups?filter=today").then(r => (r.ok ? r.json() : [])).catch(() => []),
      fetch("/api/followups?filter=overdue").then(r => (r.ok ? r.json() : [])).catch(() => []),
      fetch("/api/followups?filter=upcoming").then(r => (r.ok ? r.json() : [])).catch(() => []),
    ]);
    setCounts({
      today: Array.isArray(t) ? t.length : 0,
      overdue: Array.isArray(o) ? o.length : 0,
      upcoming: Array.isArray(u) ? u.length : 0,
    });
  };

  useEffect(() => { fetchFollowups(); }, [filter]);
  useEffect(() => { fetchCounts(); }, []);

  const markDone = async (fuId: number, leadNaam: string) => {
    await fetch("/api/followups", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: fuId }),
    });
    showToast(`${leadNaam} follow-up completed!`);
    fetchFollowups();
    fetchCounts();
  };

  if (status === "loading") return null;

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingDots /><MarqueeStrip /><Navbar /><ToastContainer />

      <main className="relative z-10 lg:pl-64 pt-20 pb-10 px-4 sm:px-6 max-w-[1600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-heading text-primary flex items-center gap-2"><CssIcon name="calendar" size={24} className="text-gold" /> Follow-up Manager</h1>
          <p className="text-sm font-body text-text/50">Track who to call today, overdue reminders, and upcoming follow-ups</p>
        </motion.div>

        {/* Summary Bento */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Due Today", value: counts.today, bg: "bg-gradient-to-br from-[#2F4838] to-[#3E5C48] text-white border-transparent", icon: "calendar" as CssIconName },
            { label: "Overdue", value: counts.overdue, bg: "bg-white text-danger border-[#E6E2D8]", icon: "alert" as CssIconName },
            { label: "Upcoming", value: counts.upcoming, bg: "bg-gradient-to-br from-[#B08D57] to-[#C7A773] text-white border-transparent", icon: "clock" as CssIconName },
          ].map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`${c.bg} border rounded-[24px] p-5 text-center shadow-sm`}>
              <div className="flex justify-center mb-2"><CssIcon name={c.icon} size={22} /></div>
              <p className="text-3xl font-heading"><CountUp target={c.value} /></p>
              <p className="text-xs font-body opacity-80">{c.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTER_TABS.map(tab => (
            <motion.button key={tab.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(tab.id)}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-body font-semibold transition-all ${
                filter === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                  : "bg-white text-text/50 border border-gold/10 hover:bg-softPink"}`}>
              <CssIcon name={tab.icon} size={14} />
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Follow-up Cards */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {followups.map((fu) => {
              const isOverdue = new Date(fu.dueAt) < new Date() && filter !== "overdue";
              const lead = fu.lead;
              return (
                <motion.div key={fu.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border ${
                    isOverdue || filter === "overdue"
                      ? "bg-danger/5 border-danger/20"
                      : "bg-white border-gold/10 hover:border-gold/30"
                  } shadow-sm`}>

                  {/* Lead Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-heading text-primary text-base">{lead?.naam}</span>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-body ${
                        lead?.temperature === "Hot" ? "bg-red-50 text-red-600" :
                        lead?.temperature === "Warm" ? "bg-orange-50 text-orange-600" :
                        "bg-blue-50 text-blue-600"
                      }`}>
                        <CssIcon name={lead?.temperature === "Hot" ? "flame" : lead?.temperature === "Warm" ? "sun" : "snow"} size={11} />
                        {lead?.temperature}
                      </span>
                    </div>
                    <p className="text-sm font-body text-text/60">{lead?.phone} · {lead?.source}</p>
                    {lead?.query && <p className="text-xs text-text/40 font-body mt-0.5 truncate">"{lead.query}"</p>}
                    {fu.note && <p className="text-xs text-primary/70 font-body mt-1 bg-softPink px-2 py-1 rounded-lg inline-block">{fu.note}</p>}
                  </div>

                  {/* Due Time */}
                  <div className="text-center flex-shrink-0">
                    <p className={`text-sm font-heading ${isOverdue || filter === "overdue" ? "text-danger" : "text-primary"}`}>
                      {fu.dueAt?.slice(0, 10)}
                    </p>
                    <p className="text-xs text-text/40 font-body">{fu.dueAt?.slice(11, 16)}</p>
                    {(isOverdue || filter === "overdue") && (
                      <span className="text-[10px] text-danger font-body font-bold">OVERDUE</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <motion.a href={`https://wa.me/91${lead?.phone}`} target="_blank"
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 relative">
                      <span className="absolute inset-0 rounded-full border border-[#25D366] animate-ping opacity-20" />
                      <CssIcon name="chat" size={16} />
                    </motion.a>
                    <motion.a href={`tel:${lead?.phone}`}
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                      <CssIcon name="phone" size={16} />
                    </motion.a>
                    <motion.button onClick={() => markDone(fu.id, lead?.naam)}
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-full bg-success/10 text-success hover:bg-success/20" title="Mark Done">
                      <CssIcon name="check" size={16} />
                    </motion.button>
                    <motion.button onClick={() => router.push(`/leads/${lead?.id}`)}
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-full bg-gold/10 text-gold hover:bg-gold/20" title="View Lead">
                      <CssIcon name="calendar" size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {followups.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <div className="flex justify-center mb-4"><CssIcon name="check" size={36} className="text-success" /></div>
              <p className="font-heading text-primary text-xl">All Caught Up!</p>
              <p className="font-body text-text/40 text-sm mt-1">No pending follow-ups in this filter</p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
