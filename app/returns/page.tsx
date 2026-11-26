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
import SearchInput from "@/components/ui/SearchInput";
import Modal from "@/components/ui/Modal";
import ToastContainer, { showToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import CssIcon from "@/components/ui/CssIcon";

const statusColors: Record<string, string> = {
  Requested: "bg-yellow-50 text-yellow-700",
  "QC Pending": "bg-blue-50 text-blue-700",
  "QC Done": "bg-purple-50 text-purple-700",
  "Refund Initiated": "bg-orange-50 text-orange-700",
  Exchanged: "bg-green-50 text-green-700",
  Closed: "bg-gray-100 text-gray-600",
};

export default function ReturnsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [returns, setReturns] = useState<any[]>([]);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [qcStatus, setQcStatus] = useState("OK");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchReturns = async () => {
    const res = await fetch("/api/returns");
    if (res.ok) setReturns(await res.json());
  };

  useEffect(() => { fetchReturns(); }, []);

  const updateQC = async () => {
    if (!selectedReturn) return;
    const res = await fetch(`/api/returns/${selectedReturn.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qcStatus, status: "QC Done" }),
    });
    if (res.ok) {
      showToast(`QC marked as ${qcStatus}!`);
      setSelectedReturn(null);
      fetchReturns();
    }
  };

  const initiateRefund = async (ret: any) => {
    await fetch(`/api/returns/${ret.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Refund Initiated" }),
    });
    showToast("Refund initiated!");
    fetchReturns();
  };

  if (status === "loading") return null;

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingDots />
      <MarqueeStrip />
      <Navbar />
      <ToastContainer />

      <main className="relative z-10 pt-20 pb-10 px-4 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-heading text-primary flex items-center gap-2"><CssIcon name="refresh" size={24} className="text-gold" /> Returns & Exchanges</h1>
          <p className="text-sm font-body text-text/50">QC management, refunds, and size exchanges</p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Returns", value: returns.length, color: "from-orange-500 to-orange-600" },
            { label: "QC Pending", value: returns.filter(r => r.status === "QC Pending").length, color: "from-blue-500 to-blue-600" },
            { label: "Exchanges", value: returns.filter(r => r.type === "Exchange").length, color: "from-purple-500 to-purple-600" },
            { label: "RTOs", value: returns.filter(r => r.type === "RTO").length, color: "from-danger to-red-700" },
          ].map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br ${card.color} text-white rounded-[28px] p-4 shadow-lg`}>
              <p className="text-xs font-body opacity-80">{card.label}</p>
              <p className="text-3xl font-heading">{card.value}</p>
            </motion.div>
          ))}
        </div>

        <Card hover={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="text-left text-text/40 border-b border-gold/10">
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Order</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Reason</th>
                  <th className="pb-3 pr-4">QC</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((ret: any) => (
                  <motion.tr key={ret.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="border-b border-gold/5 hover:bg-softPink/30">
                    <td className="py-3 pr-4 font-medium">{ret.order?.customer?.name}</td>
                    <td className="py-3 pr-4 text-primary font-mono text-xs">{ret.order?.orderNo}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        ret.type === "RTO" ? "bg-danger/10 text-danger" :
                        ret.type === "Exchange" ? "bg-purple-50 text-purple-700" :
                        "bg-orange-50 text-orange-700"}`}>
                        {ret.type}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-text/60 max-w-32 truncate">{ret.reason}</td>
                    <td className="py-3 pr-4">
                      {ret.qcStatus ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          ret.qcStatus === "OK" ? "bg-success/10 text-success" :
                          ret.qcStatus === "Damaged" ? "bg-danger/10 text-danger" :
                          "bg-orange-50 text-orange-700"}`}>
                          {ret.qcStatus}
                        </span>
                      ) : <span className="text-text/30">—</span>}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[ret.status] || "bg-gray-50 text-gray-600"}`}>
                        {ret.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        {ret.status === "QC Pending" && (
                          <Button size="sm" variant="secondary" onClick={() => setSelectedReturn(ret)}>
                            <CssIcon name="eye" size={12} /> Run QC
                          </Button>
                        )}
                        {ret.status === "QC Done" && ret.qcStatus === "OK" && (
                          <Button size="sm" variant="success" onClick={() => initiateRefund(ret)}>
                            <CssIcon name="check" size={12} /> Refund
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {returns.length === 0 && <p className="text-center text-text/30 font-body py-12">No returns found</p>}
          </div>
        </Card>
      </main>

      {/* QC Modal */}
      <Modal isOpen={!!selectedReturn} onClose={() => setSelectedReturn(null)} title="QC Check">
        <div className="space-y-4">
          <p className="text-sm font-body text-text/60">
            Customer: <strong>{selectedReturn?.order?.customer?.name}</strong><br />
            Reason: {selectedReturn?.reason}
          </p>
          <div>
            <label className="text-sm font-body text-text/60 mb-2 block">Item Condition</label>
            <div className="flex gap-3">
              {["OK", "Damaged", "Used"].map((s) => (
                <button key={s} onClick={() => setQcStatus(s)}
                  className={`flex-1 py-3 rounded-xl text-sm font-body font-medium transition-all ${qcStatus === s
                    ? s === "OK" ? "bg-success text-white" : s === "Damaged" ? "bg-danger text-white" : "bg-orange-500 text-white"
                    : "bg-softPink text-text/60"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="p-3 bg-softPink rounded-xl text-sm font-body text-text/60">
            Photo upload: Connected to Cloudinary in production
          </div>
          <Button fullWidth onClick={updateQC}>Submit QC</Button>
        </div>
      </Modal>
    </div>
  );
}
