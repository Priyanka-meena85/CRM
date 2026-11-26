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
import { formatCurrency } from "@/lib/utils";
import CssIcon, { CssIconName } from "@/components/ui/CssIcon";

const STAGE_COLORS: Record<string, string> = {
  NEW:       "bg-blue-50 text-blue-700 border-blue-200",
  "BAAT HUI":"bg-purple-50 text-purple-700 border-purple-200",
  QUOTE:     "bg-yellow-50 text-yellow-700 border-yellow-200",
  PAKKI:     "bg-green-50 text-green-700 border-green-200",
  LOST:      "bg-red-50 text-red-700 border-red-200",
};

const TEMP_COLOR: Record<string, string> = {
  Hot: "text-red-500", Warm: "text-orange-400", Cold: "text-blue-400",
};

const TEMP_LABEL: Record<string, string> = { Hot: "Hot", Warm: "Warm", Cold: "Cold" };
const SOURCE_ICONS: Record<string, CssIconName> = {
  Instagram: "sparkles", Facebook: "info", WhatsApp: "chat",
  "Walk-in": "user", Call: "phone", Website: "trend", Reference: "users",
};

export default function LeadsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage]   = useState("All");
  const [filterSource, setFilterSource] = useState("All");
  const [filterTemp, setFilterTemp]     = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ naam: "", phone: "", source: "Instagram", query: "", quote: "", temperature: "Warm", assignedTo: "", nextFollowup: "", city: "", notes: "" });

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

  const fetchLeads = async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterStage !== "All")  params.set("stage", filterStage);
    if (filterSource !== "All") params.set("source", filterSource);
    if (filterTemp !== "All")   params.set("temp", filterTemp);
    const res = await fetch(`/api/leads?${params}`);
    if (res.ok) setLeads(await res.json());
  };

  useEffect(() => { fetchLeads(); }, [search, filterStage, filterSource, filterTemp]);

  useEffect(() => {
    fetch("/api/staff").then(r => r.json()).then(setStaff).catch(() => {});
  }, []);

  const addLead = async () => {
    if (!form.naam || !form.phone) { showToast("Naam aur phone zaroori hai!", "error"); return; }
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, quote: form.quote ? parseFloat(form.quote) : null, assignedTo: form.assignedTo ? parseInt(form.assignedTo) : null }),
    });
    if (res.ok) {
      showToast("Lead add ho gayi!");
      setShowAddModal(false);
      setForm({ naam: "", phone: "", source: "Instagram", query: "", quote: "", temperature: "Warm", assignedTo: "", nextFollowup: "", city: "", notes: "" });
      fetchLeads();
    }
  };

  const deleteLead = async (id: number, naam: string) => {
    if (!confirm(`${naam} ki lead delete karein?`)) return;
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
    showToast("Lead delete ho gayi", "info");
    fetchLeads();
  };

  const quickUpdateLead = async (id: number, patch: Record<string, any>) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) showToast("Lead updated!");
  };

  const exportLeadsCSV = () => {
    const header = ["Naam", "Phone", "Source", "Query", "Quote", "Stage", "Temperature", "Assigned"];
    const rows = leads.map((l) => [
      `"${(l.naam || "").replace(/"/g, '""')}"`,
      `"${l.phone || ""}"`,
      `"${l.source || ""}"`,
      `"${(l.query || "").replace(/"/g, '""')}"`,
      l.quote || 0,
      l.stage,
      l.temperature,
      `"${l.staff?.name || ""}"`,
    ]);
    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `priya-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV export ho gaya!");
  };

  const totalQuoteValue = leads.filter((l) => l.stage !== "LOST").reduce((s, l) => s + (l.quote || 0), 0);
  const hotCount = leads.filter((l) => l.temperature === "Hot" && l.stage !== "LOST").length;
  const pakkiCount = leads.filter((l) => l.stage === "PAKKI").length;
  const convRate = leads.length > 0 ? Math.round((pakkiCount / leads.length) * 100) : 0;

  if (status === "loading") return null;

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingDots /><MarqueeStrip /><Navbar /><ToastContainer />

      <main className="relative z-10 pt-20 pb-10 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-heading text-primary flex items-center gap-2"><CssIcon name="users" size={24} className="text-gold" /> All Leads</h1>
            <p className="text-sm font-body text-text/50">{leads.length} leads — filter, search, manage</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={exportLeadsCSV}><CssIcon name="download" size={14} /> Export CSV</Button>
            <Button size="sm" variant="secondary" onClick={() => router.push("/pipeline")}><CssIcon name="kanban" size={14} /> Pipeline View</Button>
            <Button onClick={() => setShowAddModal(true)}><CssIcon name="plus" size={14} /> New Lead</Button>
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gold/20 shadow-sm">
            <p className="text-xs font-body text-text/50">Active Pipeline Value</p>
            <p className="text-xl font-heading text-primary">{formatCurrency(totalQuoteValue)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gold/20 shadow-sm">
            <p className="text-xs font-body text-text/50 flex items-center gap-1"><CssIcon name="flame" size={12} className="text-red-500" /> Hot Leads</p>
            <p className="text-xl font-heading text-red-600">{hotCount}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gold/20 shadow-sm">
            <p className="text-xs font-body text-text/50 flex items-center gap-1"><CssIcon name="check" size={12} className="text-emerald-600" /> PAKKI Deals</p>
            <p className="text-xl font-heading text-emerald-600">{pakkiCount}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gold/20 shadow-sm">
            <p className="text-xs font-body text-text/50">Conversion Rate</p>
            <p className="text-xl font-heading text-gold">{convRate}%</p>
          </div>
        </div>

        {/* Filters */}
        <Card hover={false} className="mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <SearchInput value={search} onChange={setSearch} placeholder="Naam ya phone..." className="flex-1 min-w-48" />

            {/* Stage filter */}
            <div className="flex gap-1 flex-wrap">
              {["All","NEW","BAAT HUI","QUOTE","PAKKI","LOST"].map(s => (
                <button key={s} onClick={() => setFilterStage(s)}
                  className={`px-3 py-1 rounded-full text-xs font-body transition-all ${filterStage === s ? "bg-primary text-white" : "bg-softPink text-text/60"}`}>
                  {s}
                </button>
              ))}
            </div>

            {/* Source filter */}
            <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gold/20 bg-background font-body text-sm outline-none">
              <option value="All">All Sources</option>
              {["Instagram","Facebook","WhatsApp","Walk-in","Call","Website","Reference"].map(s => <option key={s}>{s}</option>)}
            </select>

            {/* Temp filter */}
            <div className="flex gap-1">
              {["All","Hot","Warm","Cold"].map(t => (
                <button key={t} onClick={() => setFilterTemp(t)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-body transition-all ${filterTemp === t ? "bg-primary text-white" : "bg-softPink text-text/60"}`}>
                  {t !== "All" && <CssIcon name={t === "Hot" ? "flame" : t === "Warm" ? "sun" : "snow"} size={11} />}
                  {t}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Leads Table */}
        <Card hover={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="text-left text-text/40 border-b border-gold/10">
                  <th className="pb-3 pr-4">Naam</th>
                  <th className="pb-3 pr-4">Phone</th>
                  <th className="pb-3 pr-4">Source</th>
                  <th className="pb-3 pr-4">Query</th>
                  <th className="pb-3 pr-4">Quote</th>
                  <th className="pb-3 pr-4">Stage</th>
                  <th className="pb-3 pr-4">Temp</th>
                  <th className="pb-3 pr-4">Follow-up</th>
                  <th className="pb-3 pr-4">Assigned</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {leads.map((lead) => {
                    const nextFu = lead.followups?.[0];
                    const isOverdue = nextFu && new Date(nextFu.dueAt) < new Date();
                    return (
                      <motion.tr key={lead.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="border-b border-gold/5 hover:bg-softPink/30 transition-colors">
                        <td className="py-3 pr-4 font-semibold">{lead.naam}</td>
                        <td className="py-3 pr-4 text-text/60">{lead.phone}</td>
                        <td className="py-3 pr-4">
                          <span className="flex items-center gap-1.5 text-xs">
                            <CssIcon name={SOURCE_ICONS[lead.source] || "info"} size={12} className="text-gold" /> {lead.source}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-text/60 max-w-32 truncate">{lead.query || "—"}</td>
                        <td className="py-3 pr-4 font-heading text-primary text-sm">
                          {lead.quote ? formatCurrency(lead.quote) : "—"}
                        </td>
                        <td className="py-3 pr-4">
                          <select
                            value={lead.stage}
                            onChange={(e) => quickUpdateLead(lead.id, { stage: e.target.value })}
                            className={`px-2 py-0.5 rounded-full text-xs font-medium border outline-none cursor-pointer ${STAGE_COLORS[lead.stage] || ""}`}
                          >
                            {["NEW", "BAAT HUI", "QUOTE", "PAKKI", "LOST"].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 pr-4">
                          <select
                            value={lead.temperature}
                            onChange={(e) => quickUpdateLead(lead.id, { temperature: e.target.value })}
                            className={`text-xs font-medium bg-transparent outline-none cursor-pointer ${TEMP_COLOR[lead.temperature]}`}
                          >
                            <option value="Hot">Hot</option>
                            <option value="Warm">Warm</option>
                            <option value="Cold">Cold</option>
                          </select>
                        </td>
                        <td className="py-3 pr-4 text-xs">
                          {nextFu ? (
                            <span className={`inline-flex items-center gap-1 ${isOverdue ? "text-danger font-bold" : "text-text/50"}`}>
                              <CssIcon name={isOverdue ? "alert" : "calendar"} size={11} />{nextFu.dueAt?.slice(0,10)}
                            </span>
                          ) : <span className="text-text/30">—</span>}
                        </td>
                        <td className="py-3 pr-4 text-xs text-text/50">{lead.staff?.name || "—"}</td>
                        <td className="py-3">
                          <div className="flex gap-1">
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              onClick={() => router.push(`/leads/${lead.id}`)}
                              className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors" title="View Detail">
                              <CssIcon name="eye" size={14} />
                            </motion.button>
                            <motion.a href={`tel:${lead.phone}`}
                              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Call">
                              <CssIcon name="phone" size={14} />
                            </motion.a>
                            <motion.a href={`https://wa.me/91${lead.phone}`} target="_blank"
                              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              className="p-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors" title="WhatsApp">
                              <CssIcon name="chat" size={14} />
                            </motion.a>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              onClick={() => deleteLead(lead.id, lead.naam)}
                              className="p-1.5 rounded-lg hover:bg-danger/10 text-danger transition-colors" title="Delete">
                              <CssIcon name="trash" size={14} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
            {leads.length === 0 && <p className="text-center text-text/30 font-body py-12">Koi lead nahi mili 🔍</p>}
          </div>
        </Card>
      </main>

      {/* Add Lead Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="➕ Naya Lead Add Karo">
        <div className="space-y-3">
          {[
            { label: "Naam *", key: "naam", placeholder: "Priya Sharma" },
            { label: "Phone *", key: "phone", placeholder: "9876543210" },
            { label: "City", key: "city", placeholder: "Nathdwara" },
            { label: "Query", key: "query", placeholder: "Kya poochh raha/rahi hai" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-body text-text/50 mb-1 block">{f.label}</label>
              <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-background font-body text-sm outline-none focus:border-gold/40" />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-body text-text/50 mb-1 block">Source</label>
              <select value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gold/20 bg-background font-body text-sm outline-none">
                {["Instagram","Facebook","WhatsApp","Walk-in","Call","Website","Reference"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-body text-text/50 mb-1 block">Temperature</label>
              <select value={form.temperature} onChange={e => setForm(p => ({ ...p, temperature: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gold/20 bg-background font-body text-sm outline-none">
                {["Hot","Warm","Cold"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-body text-text/50 mb-1 block">Quote ₹</label>
              <input type="number" value={form.quote} onChange={e => setForm(p => ({ ...p, quote: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gold/20 bg-background font-body text-sm outline-none" placeholder="45000" />
            </div>
            <div>
              <label className="text-xs font-body text-text/50 mb-1 block">Assign To</label>
              <select value={form.assignedTo} onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gold/20 bg-background font-body text-sm outline-none">
                <option value="">Unassigned</option>
                {staff.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-body text-text/50 mb-1 block">Next Follow-up</label>
            <input type="datetime-local" value={form.nextFollowup} onChange={e => setForm(p => ({ ...p, nextFollowup: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gold/20 bg-background font-body text-sm outline-none" />
          </div>

          <div>
            <label className="text-xs font-body text-text/50 mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-gold/20 bg-background font-body text-sm outline-none resize-none" placeholder="Kuch bhi note karo..." />
          </div>

          <Button fullWidth onClick={addLead}>✅ Lead Add Karo</Button>
        </div>
      </Modal>
    </div>
  );
}
