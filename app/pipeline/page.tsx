"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import FloatingDots from "@/components/ui/FloatingDots";
import MarqueeStrip from "@/components/ui/MarqueeStrip";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ToastContainer, { showToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/utils";
import CssIcon, { CssIconName } from "@/components/ui/CssIcon";

const STAGES = [
  { id: "NEW",      label: "New",       color: "border-blue-400 bg-blue-50",   header: "bg-blue-500" },
  { id: "BAAT HUI", label: "Contacted", color: "border-purple-400 bg-purple-50", header: "bg-purple-500" },
  { id: "QUOTE",    label: "Quoted",    color: "border-gold bg-yellow-50",      header: "bg-yellow-500" },
  { id: "PAKKI",    label: "Won",       color: "border-success bg-green-50",    header: "bg-green-500" },
  { id: "LOST",     label: "Lost",      color: "border-danger bg-red-50",       header: "bg-red-500" },
];

const TEMP_ICONS: Record<string, { icon: CssIconName; color: string; label: string }> = {
  Hot:  { icon: "flame", color: "text-red-500",    label: "Hot"  },
  Warm: { icon: "sun",   color: "text-orange-400", label: "Warm" },
  Cold: { icon: "snow",  color: "text-blue-400",   label: "Cold" },
};

const SOURCE_ICONS: Record<string, CssIconName> = {
  Instagram: "sparkles", Facebook: "info", WhatsApp: "chat",
  "Walk-in": "user", Call: "phone", Website: "trend", Reference: "users",
};

export default function PipelinePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [dragging, setDragging] = useState<any>(null);
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [filterTemp, setFilterTemp] = useState("All");
  const [filterStaff, setFilterStaff] = useState("All");
  const [form, setForm] = useState({ naam: "", phone: "", source: "Instagram", query: "", quote: "", temperature: "Warm", assignedTo: "", nextFollowup: "", city: "" });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchLeads = async () => {
    const res = await fetch("/api/leads");
    if (res.ok) setLeads(await res.json());
  };

  useEffect(() => {
    fetchLeads();
    fetch("/api/staff").then(r => (r.ok ? r.json() : [])).then(d => setStaff(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const filteredLeads = leads.filter((l) => {
    if (filterTemp !== "All" && l.temperature !== filterTemp) return false;
    if (filterStaff !== "All" && String(l.assignedTo || "") !== filterStaff) return false;
    return true;
  });

  const leadsInStage = (stage: string) => filteredLeads.filter(l => l.stage === stage);
  const openPipelineValue = filteredLeads.filter(l => l.stage !== "LOST" && l.stage !== "PAKKI").reduce((s, l) => s + (l.quote || 0), 0);
  const wonPipelineValue = filteredLeads.filter(l => l.stage === "PAKKI").reduce((s, l) => s + (l.quote || 0), 0);

  const handleDrop = async (lead: any, newStage: string) => {
    if (lead.stage === newStage) return;

    // Optimistic update
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, stage: newStage } : l));

    await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: newStage }),
    });

    showToast(`${lead.naam} -> ${newStage}`);
    setDragging(null);
    setHoveredStage(null);
  };

  const addLead = async () => {
    if (!form.naam || !form.phone) { showToast("Name and phone are required!", "error"); return; }
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, quote: form.quote ? parseFloat(form.quote) : null, assignedTo: form.assignedTo ? parseInt(form.assignedTo) : null }),
    });
    if (res.ok) {
      showToast(`Lead added for ${form.naam}!`);
      setShowAddModal(false);
      setForm({ naam: "", phone: "", source: "Instagram", query: "", quote: "", temperature: "Warm", assignedTo: "", nextFollowup: "", city: "" });
      fetchLeads();
    } else {
      const data = await res.json();
      showToast(data.error || "Error!", "error");
    }
  };

  if (status === "loading") return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingDots />
      <MarqueeStrip />
      <Navbar />
      <ToastContainer />

      <main className="relative z-10 lg:pl-64 pt-20 pb-6 px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 max-w-full">
          <div>
            <h1 className="text-3xl font-heading text-primary flex items-center gap-2"><CssIcon name="kanban" size={24} className="text-gold" /> Lead Pipeline</h1>
            <p className="text-sm font-body text-text/50">
              {filteredLeads.length} leads • Open: <span className="font-semibold text-primary">{formatCurrency(openPipelineValue)}</span> • Won (PAKKI): <span className="font-semibold text-emerald-600">{formatCurrency(wonPipelineValue)}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {["All", "Hot", "Warm", "Cold"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterTemp(t)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-body transition-all ${filterTemp === t ? "bg-maroon text-white" : "bg-white border border-gold/20 text-text/70"}`}
              >
                {t !== "All" && <CssIcon name={t === "Hot" ? "flame" : t === "Warm" ? "sun" : "snow"} size={11} />}
                {t}
              </button>
            ))}
            <select
              value={filterStaff}
              onChange={(e) => setFilterStaff(e.target.value)}
              className="px-3 py-1.5 rounded-full text-xs font-body bg-white border border-gold/25 outline-none"
            >
              <option value="All">All Staff</option>
              {staff.map((s) => (
                <option key={s.id} value={String(s.id)}>{s.name}</option>
              ))}
            </select>
            <Button onClick={() => setShowAddModal(true)}>
              <CssIcon name="plus" size={14} /> New Lead
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: "calc(100vh - 180px)" }}>
          {STAGES.map((stage) => {
            const stageLeads = leadsInStage(stage.id);
            const isOver = hoveredStage === stage.id;

            return (
              <div
                key={stage.id}
                className={`flex-shrink-0 w-72 rounded-[24px] border-2 transition-all duration-200 ${stage.color} ${isOver && dragging?.stage !== stage.id ? "scale-[1.02] shadow-xl" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setHoveredStage(stage.id); }}
                onDragLeave={() => setHoveredStage(null)}
                onDrop={(e) => { e.preventDefault(); if (dragging) handleDrop(dragging, stage.id); }}
              >
                {/* Column Header */}
                <div className={`${stage.header} text-white px-4 py-3 rounded-t-[22px] flex items-center justify-between`}>
                  <div>
                    <span className="font-heading text-base block">{stage.label}</span>
                    <span className="text-[11px] font-body opacity-85">
                      {formatCurrency(stageLeads.reduce((s, l) => s + (l.quote || 0), 0))}
                    </span>
                  </div>
                  <span className="bg-white/20 text-white text-xs font-body font-bold px-2.5 py-0.5 rounded-full">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="p-3 space-y-3 min-h-[200px]">
                  <AnimatePresence>
                    {stageLeads.map((lead) => {
                      const temp = TEMP_ICONS[lead.temperature] || TEMP_ICONS.Warm;
                      const nextFu = lead.followups?.[0];
                      const isOverdue = nextFu && new Date(nextFu.dueAt) < new Date() && !nextFu.isDone;

                      return (
                        <motion.div
                          key={lead.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          draggable
                          onDragStart={() => setDragging(lead)}
                          onDragEnd={() => { setDragging(null); setHoveredStage(null); }}
                          onClick={() => router.push(`/leads/${lead.id}`)}
                          className="bg-white rounded-2xl p-3 shadow-sm border border-gold/10 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-gold/30 transition-all group"
                          whileHover={{ y: -2 }}
                        >
                          {/* Top row */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-body font-semibold text-text text-sm truncate">{lead.naam}</p>
                              <p className="text-xs text-text/40 font-body">{lead.phone}</p>
                            </div>
                            <CssIcon name={temp.icon} size={14} className={`${temp.color} flex-shrink-0 ml-2`} />
                          </div>

                          {/* Source + Query */}
                          <div className="flex items-center gap-1.5 mb-2">
                            <CssIcon name={SOURCE_ICONS[lead.source] || "info"} size={11} className="text-gold" />
                            <span className="text-xs font-body text-text/50 truncate">{lead.source}</span>
                            {lead.city && <span className="text-xs text-text/30 font-body">· {lead.city}</span>}
                          </div>

                          {lead.query && (
                            <p className="text-xs font-body text-text/60 bg-softPink rounded-lg px-2 py-1 mb-2 truncate">
                              "{lead.query}"
                            </p>
                          )}

                          {/* Quote */}
                          {lead.quote && (
                            <p className="text-sm font-heading text-primary mb-2">
                              {formatCurrency(lead.quote)}
                            </p>
                          )}

                          {/* Follow-up badge */}
                          {nextFu && (
                            <div className={`flex items-center gap-1 text-[10px] font-body px-2 py-0.5 rounded-full mb-2 ${isOverdue ? "bg-danger/10 text-danger" : "bg-gold/10 text-gold"}`}>
                              <CssIcon name={isOverdue ? "alert" : "calendar"} size={10} />
                              <span>{isOverdue ? "Overdue: " : ""}{nextFu.dueAt?.slice(0, 10)}</span>
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between mt-1 pt-2 border-t border-gold/10">
                            <span className="text-[10px] font-body text-text/30 flex items-center gap-1">
                              <CssIcon name="user" size={10} />
                              {lead.staff?.name || "Unassigned"}
                            </span>
                            {/* WhatsApp quick-action */}
                            <motion.a
                              href={`https://wa.me/91${lead.phone}`}
                              target="_blank"
                              onClick={(e) => e.stopPropagation()}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                            >
                              <CssIcon name="chat" size={12} />
                            </motion.a>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {/* Drop zone hint */}
                  {isOver && dragging && dragging.stage !== stage.id && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="border-2 border-dashed border-gold/40 rounded-xl h-16 flex items-center justify-center">
                      <span className="text-xs font-body text-gold">Drop here</span>
                    </motion.div>
                  )}

                  {stageLeads.length === 0 && !isOver && (
                    <p className="text-center text-xs text-text/20 font-body py-8">No leads</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Add Lead Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Lead">
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
                {["Instagram", "Facebook", "WhatsApp", "Walk-in", "Call", "Website", "Reference"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-body text-text/50 mb-1 block">Temperature</label>
              <select value={form.temperature} onChange={e => setForm(p => ({ ...p, temperature: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gold/20 bg-background font-body text-sm outline-none">
                {["Hot", "Warm", "Cold"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-body text-text/50 mb-1 block">Quote ₹</label>
              <input type="number" value={form.quote} onChange={e => setForm(p => ({ ...p, quote: e.target.value }))}
                placeholder="45000" className="w-full px-3 py-2.5 rounded-xl border border-gold/20 bg-background font-body text-sm outline-none" />
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

          <Button fullWidth onClick={addLead}><CssIcon name="check" size={14} /> Add Lead</Button>
        </div>
      </Modal>
    </div>
  );
}
