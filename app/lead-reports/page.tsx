"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import FloatingDots from "@/components/ui/FloatingDots";
import MarqueeStrip from "@/components/ui/MarqueeStrip";
import Card from "@/components/ui/Card";
import CountUp from "@/components/ui/CountUp";
import ProgressBar from "@/components/ui/ProgressBar";
import SectionDivider from "@/components/ui/SectionDivider";
import ToastContainer from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/utils";
import CssIcon, { CssIconName } from "@/components/ui/CssIcon";

const STAGE_COLORS: Record<string, string> = {
  NEW: "bg-blue-500", "BAAT HUI": "bg-purple-500",
  QUOTE: "bg-yellow-500", PAKKI: "bg-green-500", LOST: "bg-red-500",
};

const SOURCE_ICONS: Record<string, CssIconName> = {
  Instagram: "sparkles", Facebook: "info", WhatsApp: "chat",
  "Walk-in": "user", Call: "phone", Website: "trend", Reference: "users",
};

export default function LeadReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

  useEffect(() => {
    fetch("/api/leads/reports")
      .then(r => (r.ok ? r.json() : null))
      .then(d => setData(d && !d.error ? d : { totalLeads: 0, todayLeads: 0, todayFollowups: 0, overdueFollowups: 0, thisMonthLeads: 0, thisMonthPakki: 0, thisMonthRevenue: 0, conversionRate: 0, stageBreakdown: [], sourceBest: [], staffPerf: [], temperature: {} }))
      .catch(() => setData({ totalLeads: 0, todayLeads: 0, todayFollowups: 0, overdueFollowups: 0, thisMonthLeads: 0, thisMonthPakki: 0, thisMonthRevenue: 0, conversionRate: 0, stageBreakdown: [], sourceBest: [], staffPerf: [], temperature: {} }));
  }, []);

  if (!data) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="font-heading text-primary text-2xl animate-pulse">Loading Lead Reports...</p>
    </div>
  );

  const totalStageValue = data.stageBreakdown?.reduce((s: number, x: any) => s + x.count, 0) || 1;

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingDots /><MarqueeStrip /><Navbar /><ToastContainer />

      <main className="relative z-10 lg:pl-64 pt-20 pb-10 px-4 sm:px-6 max-w-[1600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-heading text-primary flex items-center gap-2"><CssIcon name="chart" size={24} className="text-gold" /> Lead Reports</h1>
          <p className="text-sm font-body text-text/50">Monthly conversion performance, source attribution, and team stats</p>
        </motion.div>

        {/* Top KPI Bento */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Leads", value: data.totalLeads, prefix: "", icon: "users" as CssIconName, tone: "hero" },
            { label: "Today's Leads", value: data.todayLeads, prefix: "", icon: "trend" as CssIconName, tone: "brass" },
            { label: "Won This Month", value: data.thisMonthPakki, prefix: "", icon: "star" as CssIconName, tone: "surface" },
            { label: "Monthly Revenue", value: data.thisMonthRevenue, prefix: "₹", icon: "rupee" as CssIconName, tone: "surface" },
          ].map((card, i) => {
            const isDark = card.tone === "hero" || card.tone === "brass";
            const bg =
              card.tone === "hero"
                ? "bg-gradient-to-br from-[#2F4838] to-[#3E5C48] text-white border-transparent"
                : card.tone === "brass"
                ? "bg-gradient-to-br from-[#B08D57] to-[#C7A773] text-white border-transparent"
                : "bg-white text-text border-[#E6E2D8]";
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className={`${bg} border rounded-[24px] p-5 relative overflow-hidden shadow-sm`}>
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-xs font-body ${isDark ? "text-white/80" : "text-text/60"}`}>{card.label}</p>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center ${isDark ? "bg-white/15 text-white" : "bg-[#EFECE4] text-primary"}`}>
                    <CssIcon name={card.icon} size={13} />
                  </span>
                </div>
                <p className={`text-2xl md:text-3xl font-heading ${isDark ? "text-white" : "text-primary"}`}>
                  <CountUp target={card.value} prefix={card.prefix} duration={1.5} />
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Conversion Rate */}
        <Card hover={false} className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-primary flex items-center gap-2"><CssIcon name="trend" size={16} className="text-gold" /> Monthly Conversion Rate</h3>
            <span className="text-3xl font-heading text-primary">{data.conversionRate}%</span>
          </div>
          <ProgressBar value={data.conversionRate} />
          <div className="flex justify-between mt-2 text-xs font-body text-text/50">
            <span>{data.thisMonthLeads} leads received</span>
            <span>{data.thisMonthPakki} deals won</span>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Stage Funnel */}
          <Card hover={false} className="lg:col-span-2">
            <h3 className="font-heading text-primary mb-4">Pipeline Funnel</h3>
            <div className="space-y-3">
              {data.stageBreakdown?.map((s: any) => {
                const pct = Math.round((s.count / totalStageValue) * 100);
                return (
                  <div key={s.stage}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${STAGE_COLORS[s.stage] || "bg-gray-400"}`} />
                        <span className="text-sm font-body font-medium">{s.stage}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-body">
                        <span className="text-text/50">{s.count} leads</span>
                        {s.value > 0 && <span className="font-semibold text-primary">{formatCurrency(s.value)}</span>}
                      </div>
                    </div>
                    <ProgressBar value={pct} />
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Temperature Breakdown */}
          <Card hover={false}>
            <h3 className="font-heading text-primary mb-4">Lead Temperature</h3>
            <div className="space-y-4">
              {[
                { key: "Hot",  label: "Hot",   color: "from-red-500 to-orange-500",   icon: "flame" as CssIconName },
                { key: "Warm", label: "Warm",  color: "from-orange-400 to-yellow-400", icon: "sun" as CssIconName },
                { key: "Cold", label: "Cold",  color: "from-blue-400 to-blue-600",    icon: "snow" as CssIconName },
              ].map(t => {
                const count = data.temperature?.[t.key] || 0;
                const pct = data.totalLeads > 0 ? Math.round((count / data.totalLeads) * 100) : 0;
                return (
                  <div key={t.key} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center`}>
                      <CssIcon name={t.icon} size={18} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm font-body mb-1">
                        <span>{t.label}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                      <ProgressBar value={pct} />
                    </div>
                  </div>
                );
              })}
            </div>

            <SectionDivider />
            <div className="text-center">
              <p className="text-xs font-body text-text/40 mb-1">Follow-up Status</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-danger/5 rounded-xl">
                  <p className="font-heading text-danger text-xl">{data.overdueFollowups}</p>
                  <p className="text-[10px] font-body text-danger">Overdue</p>
                </div>
                <div className="p-2 bg-primary/5 rounded-xl">
                  <p className="font-heading text-primary text-xl">{data.todayFollowups}</p>
                  <p className="text-[10px] font-body text-primary">Today</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Best Source */}
          <Card hover={false}>
            <h3 className="font-heading text-primary mb-4">Best Lead Sources</h3>
            <div className="space-y-3">
              {data.sourceBest?.slice(0, 6).map((s: any, i: number) => (
                <div key={s.source} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-softPink flex items-center justify-center text-primary">
                    <CssIcon name={SOURCE_ICONS[s.source] || "info"} size={14} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm font-body mb-1">
                      <span>{s.source}</span>
                      <span className="font-semibold">{s.count} leads</span>
                    </div>
                    <ProgressBar value={data.totalLeads > 0 ? Math.round((s.count / data.totalLeads) * 100) : 0} />
                  </div>
                  {i === 0 && <span className="text-xs font-body font-bold text-gold">#1</span>}
                </div>
              ))}
            </div>
          </Card>

          {/* Staff Performance */}
          <Card hover={false}>
            <h3 className="font-heading text-primary mb-4">Staff Performance</h3>
            <div className="space-y-4">
              {data.staffPerf?.map((s: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-2xl bg-softPink/50 border border-gold/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-maroon to-maroonLight text-white flex items-center justify-center font-heading">
                        {s.name?.[0]}
                      </div>
                      <span className="font-heading text-primary">{s.name}</span>
                    </div>
                    <span className="text-xs font-body bg-success/10 text-success px-2 py-0.5 rounded-full">
                      {s.pakki} PAKKI
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-body">
                    <div className="p-1.5 bg-white rounded-lg">
                      <p className="font-semibold text-primary">{s.total}</p>
                      <p className="text-text/40">Total</p>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg">
                      <p className="font-semibold text-success">{s.pakki}</p>
                      <p className="text-text/40">Pakki</p>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg">
                      <p className="font-semibold text-gold text-xs">{formatCurrency(s.revenue)}</p>
                      <p className="text-text/40">Revenue</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {data.staffPerf?.length === 0 && <p className="text-center text-text/30 font-body py-4">No staff data available</p>}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
