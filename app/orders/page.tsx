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
import SearchInput from "@/components/ui/SearchInput";
import Modal from "@/components/ui/Modal";
import ToastContainer, { showToast } from "@/components/ui/Toast";
import SectionDivider from "@/components/ui/SectionDivider";
import { formatCurrency, formatDate } from "@/lib/utils";
import CssIcon from "@/components/ui/CssIcon";

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  Packed: "bg-purple-50 text-purple-700 border-purple-200",
  Shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Delivered: "bg-success/10 text-success border-success/20",
  Cancelled: "bg-danger/10 text-danger border-danger/20",
  Returned: "bg-orange-50 text-orange-700 border-orange-200",
  Exchanged: "bg-pink-50 text-pink-700 border-pink-200",
  RTO: "bg-red-100 text-red-800 border-red-200",
};

const channels = ["All", "Website", "Instagram", "Offline", "WhatsApp"];
const statuses = ["All", "Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled", "Returned"];

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnType, setReturnType] = useState("Return");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchOrders = async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedChannel !== "All") params.set("channel", selectedChannel);
    if (selectedStatus !== "All") params.set("status", selectedStatus);
    const res = await fetch(`/api/orders?${params}`);
    if (res.ok) setOrders(await res.json());
  };

  useEffect(() => { fetchOrders(); }, [search, selectedChannel, selectedStatus]);

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      showToast(`Order status update ho gaya: ${newStatus}`);
      fetchOrders();
      setSelectedOrder(null);
    } else {
      showToast("Status update nahi hua", "error");
    }
    setLoading(false);
  };

  const createReturn = async () => {
    if (!selectedOrder || !returnReason) {
      showToast("Reason zaroori hai!", "error");
      return;
    }
    const res = await fetch("/api/returns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: selectedOrder.id, reason: returnReason, type: returnType }),
    });
    if (res.ok) {
      showToast(`${returnType} register ho gaya!`, "success");
      setShowReturnModal(false);
      setReturnReason("");
      fetchOrders();
    }
  };

  const codVerify = async (orderId: number) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codVerified: true, status: "Confirmed" }),
    });
    if (res.ok) {
      showToast("COD Verify ho gaya! WhatsApp confirmation bhej diya");
      fetchOrders();
    }
  };

  if (status === "loading") return null;

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingDots />
      <MarqueeStrip />
      <Navbar />
      <ToastContainer />

      <main className="relative z-10 pt-20 pb-10 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-heading text-primary flex items-center gap-2"><CssIcon name="package" size={24} className="text-gold" /> Omni Orders</h1>
          <p className="text-sm font-body text-text/50">Website, Instagram, Offline — saare orders ek jagah</p>
        </motion.div>

        {/* Filters */}
        <Card hover={false} className="mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <SearchInput value={search} onChange={setSearch} placeholder="Order no, naam, phone..." className="flex-1 min-w-48" />
            <div className="flex gap-2 flex-wrap">
              {channels.map((ch) => (
                <motion.button key={ch} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedChannel(ch)}
                  className={`px-4 py-1.5 rounded-full text-sm font-body transition-all ${selectedChannel === ch ? "bg-primary text-white" : "bg-softPink text-text/60 hover:bg-primary/5"}`}
                >
                  {ch}
                </motion.button>
              ))}
            </div>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gold/20 bg-background font-body text-sm outline-none">
              {statuses.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </Card>

        {/* Orders Table */}
        <Card hover={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="text-left text-text/40 border-b border-gold/10">
                  <th className="pb-3 pr-4">Order No</th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Channel</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Payment</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Tracking</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {orders.map((order) => (
                    <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className={`border-b border-gold/5 hover:bg-softPink/30 transition-colors ${order.isHighRisk ? "bg-danger/5" : ""}`}>
                      <td className="py-3 pr-4 font-mono font-medium text-primary">{order.orderNo}</td>
                      <td className="py-3 pr-4">
                        <div>
                          <p className="font-medium">{order.customer?.name}</p>
                          <p className="text-xs text-text/40">{order.customer?.phone}</p>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="px-2 py-1 rounded-full text-xs bg-softPink text-primary font-medium">
                          {order.channel}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-primary">{formatCurrency(order.finalTotal)}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${order.paymentMode === "COD" ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                          {order.paymentMode}
                          {order.paymentMode === "COD" && !order.codVerified && (
                            <span className="ml-1 text-danger font-bold">!</span>
                          )}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[order.status] || "bg-gray-50 text-gray-600"}`}>
                          {order.status}
                        </span>
                        {order.isHighRisk && (
                          <span className="ml-1 text-xs text-danger font-bold">High Risk</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-xs text-text/50">
                        {order.trackingStatus || order.trackingId || "—"}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors" title="View">
                            <CssIcon name="eye" size={14} />
                          </motion.button>
                          {order.paymentMode === "COD" && !order.codVerified && (
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              onClick={() => codVerify(order.id)}
                              className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors" title="Verify COD">
                              <CssIcon name="check" size={14} />
                            </motion.button>
                          )}
                          {["Delivered"].includes(order.status) && (
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              onClick={() => { setSelectedOrder(order); setShowReturnModal(true); }}
                              className="p-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors" title="Return/Exchange">
                              <CssIcon name="refresh" size={14} />
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {orders.length === 0 && (
              <p className="text-center text-text/30 font-body py-12">Koi order nahi mila</p>
            )}
          </div>
        </Card>
      </main>

      {/* Order Detail Modal */}
      <Modal isOpen={!!selectedOrder && !showReturnModal} onClose={() => setSelectedOrder(null)} title={`Order ${selectedOrder?.orderNo}`} className="max-w-2xl">
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-softPink rounded-xl">
                <p className="text-xs text-text/40 font-body">Customer</p>
                <p className="font-heading text-primary">{selectedOrder.customer?.name}</p>
                <p className="text-sm font-body text-text/60">{selectedOrder.customer?.phone}</p>
              </div>
              <div className="p-3 bg-softPink rounded-xl">
                <p className="text-xs text-text/40 font-body">Payment</p>
                <p className="font-heading text-primary">{selectedOrder.paymentMode}</p>
                <p className="text-sm font-body text-text/60">{selectedOrder.paymentStatus}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-body font-medium text-text/60 mb-2">Items:</p>
              {selectedOrder.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between py-2 border-b border-gold/10 text-sm font-body">
                  <span>{item.product?.name} ({item.size}) × {item.qty}</span>
                  <span className="font-semibold">{formatCurrency(item.qty * item.price)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 font-heading text-primary">
                <span>Total</span>
                <span>{formatCurrency(selectedOrder.finalTotal)}</span>
              </div>
            </div>

            <SectionDivider />
            <div>
              <p className="text-sm font-body font-medium text-text/60 mb-3">Status Update:</p>
              <div className="flex flex-wrap gap-2">
                {["Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"].map((s) => (
                  <Button key={s} size="sm"
                    variant={s === "Cancelled" ? "danger" : s === "Delivered" ? "success" : "secondary"}
                    onClick={() => updateOrderStatus(selectedOrder.id, s)}>
                    {s}
                  </Button>
                ))}
              </div>
            </div>

            {selectedOrder.status === "Delivered" && (
              <Button fullWidth variant="secondary" onClick={() => setShowReturnModal(true)}>
                <CssIcon name="refresh" size={14} /> Return / Exchange Initiate Karo
              </Button>
            )}
          </div>
        )}
      </Modal>

      {/* Return Modal */}
      <Modal isOpen={showReturnModal} onClose={() => { setShowReturnModal(false); }} title="Return / Exchange">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-body text-text/60 mb-1 block">Type</label>
            <div className="flex gap-2">
              {["Return", "Exchange", "RTO"].map((t) => (
                <button key={t} onClick={() => setReturnType(t)}
                  className={`flex-1 py-2 rounded-xl text-sm font-body font-medium transition-all ${returnType === t ? "bg-primary text-white" : "bg-softPink text-text/60"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-body text-text/60 mb-1 block">Reason *</label>
            <textarea value={returnReason} onChange={(e) => setReturnReason(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-background font-body text-sm outline-none focus:border-gold/40 resize-none"
              rows={3} placeholder="Size fit nahi hua / Color different tha / Damage aaya..." />
          </div>
          <Button fullWidth onClick={createReturn}>
            <CssIcon name="check" size={14} /> {returnType} Register Karo
          </Button>
        </div>
      </Modal>
    </div>
  );
}
