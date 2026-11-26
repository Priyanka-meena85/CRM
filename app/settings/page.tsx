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
import ProgressBar from "@/components/ui/ProgressBar";
import ToastContainer, { showToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/utils";
import CssIcon from "@/components/ui/CssIcon";

export default function SettingsTeamPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [staffList, setStaffList] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("STAFF");
  const [targetMonthly, setTargetMonthly] = useState("60000");
  const [commissionPercent, setCommissionPercent] = useState("2");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && (session?.user as any)?.role !== "OWNER") {
      router.push("/shop");
    }
  }, [status, session, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sRes, lRes] = await Promise.all([fetch("/api/staff"), fetch("/api/leads")]);
      const [sData, lData] = await Promise.all([sRes.json(), lRes.json()]);
      if (Array.isArray(sData)) setStaffList(sData);
      if (Array.isArray(lData)) setLeads(lData);
    } catch {
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showToast("Name and phone are required", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          role,
          targetMonthly: Number(targetMonthly) || 50000,
          commissionPercent: Number(commissionPercent) || 2,
        }),
      });
      if (!res.ok) throw new Error();
      showToast(`${name} added to team!`);
      setName("");
      setPhone("");
      loadData();
    } catch {
      showToast("Failed to add team member", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignLead = async (leadId: number, staffIdStr: string) => {
    const assignedTo = staffIdStr ? Number(staffIdStr) : null;
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedTo,
          historyAction: "Assigned",
          historyNote: assignedTo
            ? `Lead assigned to ${staffList.find((s) => s.id === assignedTo)?.name || "Staff"}`
            : "Lead unassigned",
        }),
      });
      if (!res.ok) throw new Error();
      showToast("Lead assigned!");
      loadData();
    } catch {
      showToast("Failed to assign lead", "error");
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingDots />
      <MarqueeStrip />
      <Navbar />
      <ToastContainer />

      <main className="relative z-10 lg:pl-64 pt-20 pb-12 px-4 sm:px-6 max-w-[1600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-heading text-primary flex items-center gap-2">
            <CssIcon name="users" size={26} className="text-gold" /> Team & Settings
          </h1>
          <p className="text-sm font-body text-text/60">Add team members and assign leads</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Add Team Member Form */}
          <Card>
            <h2 className="font-heading text-xl text-primary flex items-center gap-2 mb-4">
              <CssIcon name="user" size={18} className="text-gold" /> Add Team Member
            </h2>
            <form onSubmit={handleAddStaff} className="space-y-3">
              <div>
                <label className="text-xs font-body text-text/60 block mb-1">Full Name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ravi / Neha"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-gold/25 bg-white text-sm font-body focus:outline-none focus:border-maroon"
                />
              </div>
              <div>
                <label className="text-xs font-body text-text/60 block mb-1">Phone Number *</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-gold/25 bg-white text-sm font-body focus:outline-none focus:border-maroon"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-body text-text/60 block mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl border border-gold/25 bg-white text-sm font-body focus:outline-none focus:border-maroon"
                  >
                    <option value="STAFF">STAFF</option>
                    <option value="OWNER">OWNER</option>
                    <option value="WAREHOUSE">WAREHOUSE</option>
                    <option value="SUPPORT">SUPPORT</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-body text-text/60 block mb-1">Commission %</label>
                  <input
                    type="number"
                    value={commissionPercent}
                    onChange={(e) => setCommissionPercent(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-gold/25 bg-white text-sm font-body focus:outline-none focus:border-maroon"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-body text-text/60 block mb-1">Monthly Target (₹)</label>
                <input
                  type="number"
                  value={targetMonthly}
                  onChange={(e) => setTargetMonthly(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-gold/25 bg-white text-sm font-body focus:outline-none focus:border-maroon"
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Adding..." : "+ Add Team Member"}
              </Button>
            </form>
          </Card>

          {/* Team List */}
          <Card className="lg:col-span-2">
            <h2 className="font-heading text-xl text-primary flex items-center gap-2 mb-4">
              <CssIcon name="check" size={18} className="text-gold" /> Active Team ({staffList.length})
            </h2>
            {loading ? (
              <p className="text-sm font-body text-text/50">Loading team...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {staffList.map((s) => (
                  <div key={s.id} className="p-4 rounded-2xl border border-gold/20 bg-softPink/30">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-heading text-primary text-base">{s.name}</p>
                        <p className="text-xs font-body text-text/60 flex items-center gap-1"><CssIcon name="phone" size={11} /> {s.phone}</p>
                      </div>
                      <Badge variant={s.role === "OWNER" ? "vip" : "info"}>{s.role}</Badge>
                    </div>
                    <div className="text-xs font-body text-text/70 flex justify-between mb-1">
                      <span>Sale: {formatCurrency(s.monthlySale || 0)}</span>
                      <span>Target: {formatCurrency(s.targetMonthly || 0)}</span>
                    </div>
                    <ProgressBar value={s.targetPercent || 0} />
                    <p className="text-[11px] font-body text-text/50 mt-1.5">Commission: {s.commissionPercent}%</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Lead Assignment Table */}
        <Card>
          <h2 className="font-heading text-xl text-primary flex items-center gap-2 mb-4">
            <CssIcon name="refresh" size={18} className="text-gold" /> Quick Lead Assignment
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-sm">
              <thead>
                <tr className="border-b border-gold/20 text-xs text-text/60">
                  <th className="py-2.5 pr-4">Lead</th>
                  <th className="py-2.5 pr-4">Source</th>
                  <th className="py-2.5 pr-4">Stage</th>
                  <th className="py-2.5 pr-4">Quote</th>
                  <th className="py-2.5">Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-b border-gold/10 hover:bg-softPink/20">
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-primary">{l.naam}</p>
                      <p className="text-xs text-text/50">{l.phone}</p>
                    </td>
                    <td className="py-3 pr-4">{l.source}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={l.stage === "PAKKI" ? "success" : l.stage === "LOST" ? "danger" : "vip"}>
                        {l.stage}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">{l.quote ? formatCurrency(l.quote) : "—"}</td>
                    <td className="py-3">
                      <select
                        value={l.assignedTo || ""}
                        onChange={(e) => handleAssignLead(l.id, e.target.value)}
                        className="px-3 py-1.5 rounded-full border border-gold/30 bg-white text-xs font-body focus:outline-none focus:border-maroon"
                      >
                        <option value="">Unassigned</option>
                        {staffList.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.role})
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
