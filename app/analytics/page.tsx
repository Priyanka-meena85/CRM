"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import FloatingDots from "@/components/ui/FloatingDots";
import MarqueeStrip from "@/components/ui/MarqueeStrip";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import CountUp from "@/components/ui/CountUp";
import ProgressBar from "@/components/ui/ProgressBar";
import ToastContainer, { showToast } from "@/components/ui/Toast";
import SectionDivider from "@/components/ui/SectionDivider";
import { formatCurrency } from "@/lib/utils";
import CssIcon, { CssIconName } from "@/components/ui/CssIcon";

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      const role = (session?.user as any)?.role;
      if (role !== "OWNER") router.push("/shop");
    }
  }, [status, session, router]);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d && !d.error ? d : { channelBreakdown: [], codVsPrepaid: { cod: 0, prepaid: 0 }, returnReasons: [], returnAnalytics: [], bestSellers: [], staffPerformance: [] }))
      .catch(() => setData({ channelBreakdown: [], codVsPrepaid: { cod: 0, prepaid: 0 }, returnReasons: [], returnAnalytics: [], bestSellers: [], staffPerformance: [] }));
  }, []);

  if (!data || status === "loading") return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="font-heading text-primary text-2xl animate-pulse">Loading Analytics...</p>
    </div>
  );

  const totalOrders = data.channelBreakdown?.reduce((sum: number, c: any) => sum + c.count, 0) || 0;
  const totalRevenue = data.channelBreakdown?.reduce((sum: number, c: any) => sum + c.revenue, 0) || 0;
  const codPercent = totalOrders > 0 ? Math.round((data.codVsPrepaid?.cod / totalOrders) * 100) : 0;

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingDots />
      <MarqueeStrip />
      <Navbar />
      <ToastContainer />

      <main className="relative z-10 lg:pl-64 pt-20 pb-10 px-4 sm:px-6 max-w-[1600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-heading text-primary flex items-center gap-2"><CssIcon name="chart" size={24} className="text-gold" /> Analytics & Reports</h1>
          <p className="text-sm font-body text-text/50">Returns, channels, and staff performance in one place</p>
        </motion.div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Revenue", value: totalRevenue, prefix: "₹", icon: "trend" as CssIconName, color: "from-maroon to-maroonLight" },
            { label: "Total Orders", value: totalOrders, icon: "bag" as CssIconName, color: "from-gold to-goldShine" },
            { label: "COD Orders", value: data.codVsPrepaid?.cod || 0, icon: "alert" as CssIconName, color: "from-orange-500 to-orange-600" },
            { label: "Prepaid Orders", value: data.codVsPrepaid?.prepaid || 0, icon: "star" as CssIconName, color: "from-success to-green-600" },
          ].map((card, i) => {
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`bg-gradient-to-br ${card.color} text-white rounded-[28px] p-5 relative overflow-hidden shadow-lg`}>
                <CssIcon name={card.icon} size={48} className="absolute -right-2 -bottom-2 opacity-15" />
                <p className="text-xs font-body opacity-80 mb-1">{card.label}</p>
                <p className="text-2xl font-heading">
                  <CountUp target={card.value} prefix={card.prefix || ""} />
                </p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Channel Breakdown */}
          <Card hover={false}>
            <h3 className="text-lg font-heading text-primary mb-4">Channel-wise Sales</h3>
            <div className="space-y-3">
              {data.channelBreakdown?.map((ch: any, i: number) => {
                const pct = totalRevenue > 0 ? Math.round((ch.revenue / totalRevenue) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm font-body mb-1">
                      <span className="font-medium">{ch.channel}</span>
                      <span className="text-text/50">{ch.count} orders • {formatCurrency(ch.revenue)}</span>
                    </div>
                    <ProgressBar value={pct} />
                  </div>
                );
              })}
              {(!data.channelBreakdown || data.channelBreakdown.length === 0) && (
                <p className="text-text/30 text-sm font-body text-center py-4">Koi data nahi</p>
              )}
            </div>
          </Card>

          {/* COD vs Prepaid */}
          <Card hover={false}>
            <h3 className="text-lg font-heading text-primary mb-4">COD vs Prepaid</h3>
            <div className="flex items-center justify-center gap-8 py-6">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full border-8 border-orange-400 flex items-center justify-center mb-3">
                  <span className="text-2xl font-heading text-orange-500">{codPercent}%</span>
                </div>
                <p className="font-body text-sm font-medium">COD</p>
                <p className="text-xs text-text/40 font-body">{data.codVsPrepaid?.cod} orders</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 rounded-full border-8 border-success flex items-center justify-center mb-3">
                  <span className="text-2xl font-heading text-success">{100 - codPercent}%</span>
                </div>
                <p className="font-body text-sm font-medium">Prepaid</p>
                <p className="text-xs text-text/40 font-body">{data.codVsPrepaid?.prepaid} orders</p>
              </div>
            </div>
            {codPercent > 50 && (
              <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 text-sm font-body text-orange-700 flex items-center gap-2">
                <CssIcon name="alert" size={14} /> High COD ratio detected! Enable COD verification.
              </div>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Return Reasons */}
          <Card hover={false}>
            <h3 className="text-lg font-heading text-primary mb-4">Return Reasons</h3>
            <div className="space-y-3">
              {data.returnReasons?.length > 0 ? data.returnReasons.map((r: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-softPink">
                  <span className="text-sm font-body">{r.reason}</span>
                  <span className="font-heading text-primary">{r.count}x</span>
                </div>
              )) : <p className="text-text/30 text-sm font-body text-center py-4">No returns recorded</p>}
            </div>
          </Card>

          {/* Product Return Analytics */}
          <Card hover={false}>
            <h3 className="text-lg font-heading text-primary mb-4">Product-wise Returns</h3>
            <div className="space-y-3">
              {data.returnAnalytics?.length > 0 ? data.returnAnalytics.map((ra: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-danger/10 bg-danger/5">
                  <div>
                    <p className="text-sm font-body font-medium">{ra.product?.name}</p>
                    <p className="text-xs text-text/40 font-body">Size: {ra.size} • Reason: {ra.reason}</p>
                  </div>
                  <Badge variant="danger">{ra.count} returns</Badge>
                </div>
              )) : <p className="text-text/30 text-sm font-body text-center py-4">No product returns recorded</p>}
            </div>
          </Card>
        </div>

        {/* Best Sellers */}
        <Card hover={false} className="mb-6">
          <h3 className="text-lg font-heading text-primary mb-4">Best Sellers</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {data.bestSellers?.map((p: any, i: number) => (
              <motion.div key={i} whileHover={{ scale: 1.04, y: -4 }}
                className="p-3 rounded-2xl bg-softPink border border-[#E6E2D8] text-center relative overflow-hidden group">
                {i < 3 && <span className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full bg-white/90 text-[10px] font-body font-bold text-gold shadow-sm">#{i + 1}</span>}
                {p.photoUrl && (
                  <div className="w-full h-28 rounded-xl overflow-hidden mb-2.5 bg-white border border-[#E6E2D8]">
                    <img
                      src={p.photoUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                )}
                <p className="font-body font-semibold text-sm text-text truncate">{p.name}</p>
                <p className="text-xs text-text/40 font-body mt-1">{p.category}</p>
                <p className="font-heading text-primary text-lg mt-2">{p.totalSold}</p>
                <p className="text-xs text-text/40 font-body">units sold</p>
              </motion.div>
            ))}
            {(!data.bestSellers || data.bestSellers.length === 0) && (
              <p className="col-span-5 text-center text-text/30 text-sm font-body py-4">No sales data yet</p>
            )}
          </div>
        </Card>

        {/* Staff Performance */}
        <Card hover={false}>
          <h3 className="text-lg font-heading text-primary mb-4">Staff Performance</h3>
          <div className="space-y-4">
            {data.staffPerformance?.map((s: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-softPink/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-maroon to-maroonLight text-white flex items-center justify-center font-heading text-lg">
                  {s.name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-heading text-primary">{s.name}</span>
                    <Badge variant="info">{s.role}</Badge>
                  </div>
                  <p className="text-xs font-body text-text/50">
                    Sales: {formatCurrency(s.totalSales)} • Tickets Resolved: {s.ticketsResolved}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-primary text-lg">{formatCurrency(s.totalSales)}</p>
                  <p className="text-xs font-body text-text/40">total sales</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
