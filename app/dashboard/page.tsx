"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import SearchInput from "@/components/ui/SearchInput";
import SectionDivider from "@/components/ui/SectionDivider";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import ToastContainer, { showToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import CssIcon, { CssIconName } from "@/components/ui/CssIcon";

const tabs: { id: string; label: string; icon: CssIconName }[] = [
  { id: "customers", label: "Customers", icon: "users" },
  { id: "orders", label: "Orders", icon: "bag" },
  { id: "stock", label: "Stock", icon: "package" },
  { id: "staff", label: "Staff", icon: "trend" },
  { id: "marketing", label: "Marketing", icon: "bell" },
  { id: "udhaar", label: "Udhaar", icon: "rupee" },
  { id: "measurement", label: "Measurement", icon: "scissors" },
  { id: "approvals", label: "Approvals", icon: "check" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const cardAnim = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200 } },
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("customers");
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [udhaars, setUdhaars] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [leadStats, setLeadStats] = useState<any>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [stockSearch, setStockSearch] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      const role = (session?.user as any)?.role;
      if (role !== "OWNER") router.push("/shop");
    }
  }, [status, session, router]);

  useEffect(() => {
    const safeArr = (d: any) => (Array.isArray(d) ? d : []);
    fetch("/api/dashboard/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setStats(d && !d.error ? d : { todaySale: 0, monthSale: 0, totalCustomers: 0, totalUdhaar: 0, lowStockCount: 0, todayCustomerCount: 0, alerts: {} }))
      .catch(() => setStats({ todaySale: 0, monthSale: 0, totalCustomers: 0, totalUdhaar: 0, lowStockCount: 0, todayCustomerCount: 0, alerts: {} }));
    fetch("/api/customers").then((r) => (r.ok ? r.json() : [])).then((d) => setCustomers(safeArr(d))).catch(() => {});
    fetch("/api/orders?status=Pending").then((r) => (r.ok ? r.json() : [])).then((d) => setOrders(safeArr(d))).catch(() => {});
    fetch("/api/stock").then((r) => (r.ok ? r.json() : [])).then((d) => setStocks(safeArr(d))).catch(() => {});
    fetch("/api/staff").then((r) => (r.ok ? r.json() : [])).then((d) => setStaffList(safeArr(d))).catch(() => {});
    fetch("/api/udhaar").then((r) => (r.ok ? r.json() : [])).then((d) => setUdhaars(safeArr(d))).catch(() => {});
    fetch("/api/measurements").then((r) => (r.ok ? r.json() : [])).then((d) => setMeasurements(safeArr(d))).catch(() => {});
    fetch("/api/marketing/send").then((r) => (r.ok ? r.json() : [])).then((d) => setCampaigns(safeArr(d))).catch(() => {});
    fetch("/api/approvals").then((r) => (r.ok ? r.json() : [])).then((d) => setApprovals(safeArr(d))).catch(() => {});
    fetch("/api/leads/reports").then((r) => (r.ok ? r.json() : null)).then((d) => { if (d && !d.error) setLeadStats(d); }).catch(() => {});
  }, []);

  const filteredCustomers = customerSearch
    ? customers.filter((c: any) => c.phone?.includes(customerSearch) || c.name?.toLowerCase().includes(customerSearch.toLowerCase()))
    : customers;

  const filteredStocks = stockSearch
    ? stocks.filter((s: any) => s.product?.name?.toLowerCase().includes(stockSearch.toLowerCase()))
    : stocks;

  const pendingApprovals = approvals.filter((a: any) => a.status === "Pending");

  if (status === "loading" || !stats) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="font-heading text-primary text-2xl animate-pulse">Loading...</p>
    </div>
  );

  const bentoCards: { label: string; value: number; prefix?: string; icon: CssIconName; color: string; span: string }[] = [
    { label: "Aaj Ki Sale", value: stats.todaySale, prefix: "₹", icon: "rupee", color: "from-maroon to-maroonLight", span: "col-span-2" },
    { label: "Is Mahine", value: stats.monthSale, prefix: "₹", icon: "trend", color: "from-gold to-goldShine", span: "col-span-1" },
    { label: "Total Customers", value: stats.totalCustomers, icon: "users", color: "from-primary to-maroonLight", span: "col-span-1" },
    { label: "Udhaar Pending", value: stats.totalUdhaar, prefix: "₹", icon: "alert", color: "from-danger to-red-700", span: "col-span-1" },
    { label: "Low Stock", value: stats.lowStockCount, icon: "package", color: "from-orange-500 to-orange-600", span: "col-span-1" },
    { label: "Pending Approvals", value: pendingApprovals.length, icon: "check", color: "from-purple-500 to-purple-700", span: "col-span-1" },
    { label: "Aaj Ki Leads", value: leadStats?.todayLeads || 0, icon: "user", color: "from-pink-600 to-rose-700", span: "col-span-1" },
    { label: "Pending Follow-ups", value: leadStats?.todayFollowups || 0, icon: "calendar", color: "from-blue-600 to-indigo-700", span: "col-span-1" },
    { label: "Is Mahine PAKKI", value: leadStats?.thisMonthPakki || 0, icon: "flame", color: "from-emerald-600 to-teal-700", span: "col-span-1" },
    { label: "Overdue Follow-ups", value: leadStats?.overdueFollowups || 0, icon: "alert", color: "from-amber-600 to-red-600", span: "col-span-1" },
  ];

  const allAlerts = [
    ...(leadStats?.overdueFollowups > 0
      ? [{
          id: "overdue-followups",
          type: "inactive",
          message: `${leadStats.overdueFollowups} Lead Follow-ups overdue hain! Turant call karein.`,
          action: "Follow-ups Dekho",
          href: "/followups",
        }]
      : []),
    ...(stats.alerts?.birthdays || []),
    ...(stats.alerts?.inactive || []),
    ...(stats.alerts?.lowStock || []),
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingDots />
      <MarqueeStrip />
      <Navbar />
      <ToastContainer />

      <main className="relative z-10 pt-20 pb-10 px-4 max-w-7xl mx-auto">
        {/* Hero Header */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 150 }} className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-heading text-primary mb-2">Priya Boutique CRM</h1>
          <p className="text-sm font-body text-text/50 mb-3">"Customer Kabhi Nahi Bhoolega, Sale Kabhi Nahi Rukegi"</p>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}
            className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-1.5 rounded-full text-sm font-body">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            Aaj {stats.todayCustomerCount} Customer Aaye
          </motion.div>
        </motion.div>

        {/* Bento Grid */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {bentoCards.map((card, idx) => {
            return (
              <motion.div key={idx} variants={cardAnim}
                className={`${card.span} bg-gradient-to-br ${card.color} text-white rounded-[28px] p-5 shadow-lg relative overflow-hidden`}>
                <CssIcon name={card.icon} size={48} className="absolute right-2 bottom-2 opacity-15" />
                <p className="text-xs font-body opacity-80 mb-1">{card.label}</p>
                <p className="text-2xl md:text-3xl font-heading">
                  <CountUp target={card.value} prefix={card.prefix || ""} duration={1.5} />
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Alerts */}
        {allAlerts.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mb-8">
            <h3 className="text-lg font-heading text-primary mb-3 flex items-center gap-2"><CssIcon name="bell" size={18} className="text-gold" /> Smart Alerts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {allAlerts.slice(0, 6).map((alert: any) => (
                <motion.div key={alert.id} whileHover={{ scale: 1.02 }}
                  className={`flex items-center gap-3 p-4 rounded-2xl border ${
                    alert.type === "birthday" ? "bg-goldShine/5 border-gold/20" :
                    alert.type === "inactive" ? "bg-danger/5 border-danger/20" : "bg-orange-50 border-orange-200"}`}>
                  <CssIcon name={alert.type === "birthday" ? "star" : alert.type === "inactive" ? "alert" : "package"} size={18} className="text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body text-text truncate">{alert.message}</p>
                  </div>
                  <Button size="sm" variant={alert.type === "birthday" ? "primary" : "secondary"}
                    onClick={() => alert.href ? router.push(alert.href) : showToast(`${alert.action} done!`)}>
                    {alert.action}
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Pending High-Risk COD Orders */}
        {orders.filter((o: any) => o.isHighRisk).length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-danger/5 border border-danger/20 rounded-2xl">
            <h4 className="font-heading text-danger flex items-center gap-2 mb-2">
              <CssIcon name="alert" size={16} /> High-Risk COD Orders ({orders.filter((o: any) => o.isHighRisk).length})
            </h4>
            {orders.filter((o: any) => o.isHighRisk).slice(0, 3).map((o: any) => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-danger/10 text-sm font-body">
                <span>{o.orderNo} — {o.customer?.name}</span>
                <span className="text-danger font-semibold">{formatCurrency(o.finalTotal)}</span>
              </div>
            ))}
          </motion.div>
        )}

        <SectionDivider />

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {tabs.map((tab) => {
            return (
              <motion.button key={tab.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-body font-medium transition-all relative ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-maroon to-maroonLight text-white shadow-md"
                    : "bg-white text-text/60 hover:bg-softPink border border-gold/10"}`}>
                <CssIcon name={tab.icon} size={14} />
                {tab.label}
                {tab.id === "approvals" && pendingApprovals.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white rounded-full text-[10px] flex items-center justify-center">
                    {pendingApprovals.length}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }} transition={{ type: "spring", stiffness: 200, damping: 25 }}>

            {/* CUSTOMERS TAB */}
            {activeTab === "customers" && (
              <Card hover={false}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-heading text-primary">All Customers</h3>
                  <SearchInput value={customerSearch} onChange={setCustomerSearch} placeholder="Search..." className="w-64" />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-body">
                    <thead>
                      <tr className="text-left text-text/40 border-b border-gold/10">
                        <th className="pb-3 pr-4">Naam</th>
                        <th className="pb-3 pr-4">Phone</th>
                        <th className="pb-3 pr-4">Total Kharida</th>
                        <th className="pb-3 pr-4">Orders</th>
                        <th className="pb-3 pr-4">Loyalty Pts</th>
                        <th className="pb-3 pr-4">RTO Rate</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((c: any) => (
                        <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="border-b border-gold/5 hover:bg-softPink/50 transition-colors">
                          <td className="py-3 pr-4 font-medium">{c.name}</td>
                          <td className="py-3 pr-4 text-text/60">{c.phone}</td>
                          <td className="py-3 pr-4 font-semibold text-primary">{formatCurrency(Number(c.totalKharida))}</td>
                          <td className="py-3 pr-4 text-center">{c.totalOrders || 0}</td>
                          <td className="py-3 pr-4">
                            <span className="flex items-center gap-1 text-gold font-semibold">
                              <CssIcon name="star" size={12} /> {c.loyaltyPoints || 0}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`${Number(c.rtoRate) > 30 ? "text-danger font-bold" : "text-text/50"}`}>
                              {Number(c.rtoRate || 0).toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3">
                            {c.isVip ? <Badge variant="vip">VIP</Badge> :
                             c.isHighRisk ? <Badge variant="danger">High Risk</Badge> :
                             c.isInactive ? <Badge variant="inactive">Inactive</Badge> :
                             <Badge variant="success">Active</Badge>}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <Card hover={false}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-heading text-primary">Recent Orders</h3>
                  <Button size="sm" onClick={() => router.push("/orders")}>All Orders देखें →</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-body">
                    <thead>
                      <tr className="text-left text-text/40 border-b border-gold/10">
                        <th className="pb-3 pr-4">Order No</th>
                        <th className="pb-3 pr-4">Customer</th>
                        <th className="pb-3 pr-4">Channel</th>
                        <th className="pb-3 pr-4">Amount</th>
                        <th className="pb-3 pr-4">Payment</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 10).map((o: any) => (
                        <tr key={o.id} className={`border-b border-gold/5 hover:bg-softPink/50 ${o.isHighRisk ? "bg-danger/5" : ""}`}>
                          <td className="py-3 pr-4 font-mono text-primary">{o.orderNo}</td>
                          <td className="py-3 pr-4">{o.customer?.name}</td>
                          <td className="py-3 pr-4"><span className="px-2 py-0.5 rounded-full text-xs bg-softPink text-primary">{o.channel}</span></td>
                          <td className="py-3 pr-4 font-semibold text-primary">{formatCurrency(o.finalTotal)}</td>
                          <td className="py-3 pr-4">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.paymentMode === "COD" ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700"}`}>
                              {o.paymentMode}{o.paymentMode === "COD" && !o.codVerified ? " (!)" : ""}
                            </span>
                          </td>
                          <td className="py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-softPink text-primary">{o.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && <p className="text-center text-text/30 font-body py-8">Koi pending order nahi</p>}
                </div>
              </Card>
            )}

            {/* STOCK TAB */}
            {activeTab === "stock" && (
              <Card hover={false}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-heading text-primary">Stock Inventory</h3>
                  <SearchInput value={stockSearch} onChange={setStockSearch} placeholder="Product dhoondo..." className="w-64" />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-body">
                    <thead>
                      <tr className="text-left text-text/40 border-b border-gold/10">
                        <th className="pb-3 pr-4">Product</th>
                        <th className="pb-3 pr-4">Category</th>
                        <th className="pb-3 pr-4">Size</th>
                        <th className="pb-3 pr-4">Branch</th>
                        <th className="pb-3 pr-4">Price</th>
                        <th className="pb-3">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStocks.map((s: any) => (
                        <tr key={s.id} className={`border-b border-gold/5 ${s.quantity <= 2 ? "bg-danger/5 hover:bg-danger/10" : "hover:bg-softPink/50"}`}>
                          <td className="py-3 pr-4 font-medium">{s.product?.name}</td>
                          <td className="py-3 pr-4 text-text/60">{s.product?.category}</td>
                          <td className="py-3 pr-4">{s.size}</td>
                          <td className="py-3 pr-4 text-text/50 text-xs">{s.branch || "Main Store"}</td>
                          <td className="py-3 pr-4 text-primary font-semibold">{formatCurrency(Number(s.product?.price))}</td>
                          <td className="py-3">
                            <span className="flex items-center gap-2">
                              {s.quantity <= 2 && <span className="w-2 h-2 bg-danger rounded-full animate-ping" />}
                              <span className={s.quantity <= 2 ? "text-danger font-bold" : ""}>{s.quantity}</span>
                              {s.quantity <= 2 && <Badge variant="danger">LOW</Badge>}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* STAFF TAB */}
            {activeTab === "staff" && (
              <Card hover={false}>
                <h3 className="text-lg font-heading text-primary mb-4">Staff Performance</h3>
                <div className="space-y-6">
                  {staffList.map((s: any) => (
                    <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-softPink/50 border border-gold/10">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="font-heading text-primary text-lg">{s.name}</span>
                          <Badge variant="info" className="ml-2">{s.role}</Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-body text-text/50">Monthly Sale</p>
                          <p className="text-xl font-heading text-primary">{formatCurrency(s.monthlySale || 0)}</p>
                        </div>
                      </div>
                      <ProgressBar value={s.targetPercent || 0} label={`Target: ${formatCurrency(Number(s.targetMonthly))}`} />
                      <p className="text-xs font-body text-text/40 mt-2">Commission: {Number(s.commissionPercent)}%</p>
                    </motion.div>
                  ))}
                </div>
              </Card>
            )}

            {/* MARKETING TAB */}
            {activeTab === "marketing" && (
              <Card hover={false}>
                <h3 className="text-lg font-heading text-primary mb-4">Smart Marketing</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: "Diwali Offer", segment: "All" },
                    { label: "Birthday Offer", segment: "Birthday" },
                    { label: "Inactive Re-engage", segment: "Inactive" },
                    { label: "VIP Special", segment: "VIP" },
                  ].map((btn) => (
                    <Button key={btn.label} size="sm" variant={btn.segment === "VIP" ? "secondary" : "primary"}
                      onClick={() => showToast(`${btn.label} campaign bhej diya!`)}>
                      {btn.label}
                    </Button>
                  ))}
                </div>

                {/* WhatsApp Preview */}
                <div className="max-w-xs mx-auto bg-[#E5DDD5] rounded-2xl p-4 border-4 border-gray-800 mb-6">
                  <div className="bg-[#DCF8C6] rounded-xl p-3 ml-auto max-w-[80%] shadow-sm">
                    <p className="text-xs font-body text-gray-800"><strong>Diwali Special!</strong><br />Priya Boutique pe 20% OFF sab Kurtis pe!<br />Nathdwara | 98765-43210</p>
                    <p className="text-[10px] text-gray-500 text-right mt-1">11:30 AM</p>
                  </div>
                  <p className="text-center text-[10px] text-gray-500 font-body mt-2">WhatsApp Preview</p>
                </div>

                <SectionDivider />
                <h4 className="font-heading text-primary mb-3">Past Campaigns</h4>
                {Array.isArray(campaigns) && campaigns.map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between p-3 border-b border-gold/5 text-sm font-body">
                    <div>
                      <span className="font-medium">{c.title}</span>
                      {c.segment && <span className="ml-2 text-xs text-text/40">({c.segment})</span>}
                    </div>
                    <span className="text-text/50">{c.sentToCount} customers</span>
                  </div>
                ))}
              </Card>
            )}

            {/* UDHAAR TAB */}
            {activeTab === "udhaar" && (
              <Card hover={false}>
                <h3 className="text-lg font-heading text-primary mb-4">Udhaar Tracker</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-body">
                    <thead>
                      <tr className="text-left text-text/40 border-b border-gold/10">
                        <th className="pb-3 pr-4">Customer</th>
                        <th className="pb-3 pr-4">Amount</th>
                        <th className="pb-3 pr-4">Due Date</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {udhaars.map((u: any) => (
                        <tr key={u.id} className="border-b border-gold/5 hover:bg-softPink/50">
                          <td className="py-3 pr-4 font-medium">{u.customer?.name}</td>
                          <td className="py-3 pr-4 text-danger font-bold">{formatCurrency(Number(u.amount))}</td>
                          <td className="py-3 pr-4 text-text/60">{u.dueDate ? u.dueDate.slice(0, 10) : "—"}</td>
                          <td className="py-3 pr-4">
                            <Badge variant={u.status === "Paid" ? "success" : "danger"}>{u.status}</Badge>
                          </td>
                          <td className="py-3">
                            {u.status !== "Paid" && (
                              <div className="flex gap-2">
                                <Button size="sm" variant="whatsapp"
                                  onClick={async () => { await fetch(`/api/udhaar/${u.id}/reminder`, { method: "POST" }); showToast("Reminder bhej diya!"); }}>
                                  <CssIcon name="send" size={12} /> Remind
                                </Button>
                                <Button size="sm" variant="success"
                                  onClick={async () => { await fetch(`/api/udhaar/${u.id}/mark-paid`, { method: "POST" }); showToast("Paid!"); setUdhaars(udhaars.map((item: any) => item.id === u.id ? { ...item, status: "Paid" } : item)); }}>
                                  <CssIcon name="check" size={12} /> Paid
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* MEASUREMENT TAB */}
            {activeTab === "measurement" && (
              <Card hover={false}>
                <h3 className="text-lg font-heading text-primary mb-4">Measurements</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-body">
                    <thead>
                      <tr className="text-left text-text/40 border-b border-gold/10">
                        <th className="pb-3 pr-4">Customer</th>
                        <th className="pb-3 pr-4">Blouse</th>
                        <th className="pb-3 pr-4">Sleeve</th>
                        <th className="pb-3 pr-4">Length</th>
                        <th className="pb-3 pr-4">Waist</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3">Delivery</th>
                      </tr>
                    </thead>
                    <tbody>
                      {measurements.map((m: any) => (
                        <tr key={m.id} className="border-b border-gold/5 hover:bg-softPink/50">
                          <td className="py-3 pr-4 font-medium">{m.customer?.name}</td>
                          <td className="py-3 pr-4">{m.blouse || "—"}</td>
                          <td className="py-3 pr-4">{m.sleeve || "—"}</td>
                          <td className="py-3 pr-4">{m.length || "—"}</td>
                          <td className="py-3 pr-4">{m.waist || "—"}</td>
                          <td className="py-3 pr-4">
                            <Badge variant={m.status === "Ready Hai" || m.status === "De Diya" ? "success" : "info"}>{m.status}</Badge>
                          </td>
                          <td className="py-3 text-text/60">{m.deliveryDate ? m.deliveryDate.slice(0, 10) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* APPROVALS TAB */}
            {activeTab === "approvals" && (
              <Card hover={false}>
                <h3 className="text-lg font-heading text-primary mb-4">Manager Approvals</h3>
                {pendingApprovals.length === 0 ? (
                  <p className="text-center text-text/30 font-body py-8">Koi pending approval nahi</p>
                ) : (
                  <div className="space-y-4">
                    {pendingApprovals.map((a: any) => (
                      <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 p-4 rounded-2xl border border-gold/20 bg-softPink/30">
                        <div className="flex-1">
                          <p className="font-heading text-primary">{a.type} Request</p>
                          <p className="text-sm font-body text-text/60">
                            By: {a.staff?.name} {a.amount ? `• Amount: ${formatCurrency(a.amount)}` : ""} {a.note ? `• "${a.note}"` : ""}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="success"
                            onClick={async () => {
                              await fetch(`/api/approvals/${a.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "Approved" }) });
                              showToast("Approved!");
                              setApprovals(approvals.map((x: any) => x.id === a.id ? { ...x, status: "Approved" } : x));
                            }}>
                            <CssIcon name="check" size={12} /> Approve
                          </Button>
                          <Button size="sm" variant="danger"
                            onClick={async () => {
                              await fetch(`/api/approvals/${a.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "Rejected" }) });
                              showToast("Rejected!", "error");
                              setApprovals(approvals.map((x: any) => x.id === a.id ? { ...x, status: "Rejected" } : x));
                            }}>
                            <CssIcon name="close" size={12} /> Reject
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
