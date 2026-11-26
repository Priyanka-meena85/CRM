"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import FloatingDots from "@/components/ui/FloatingDots";
import MarqueeStrip from "@/components/ui/MarqueeStrip";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import ToastContainer, { showToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import CssIcon, { CssIconName } from "@/components/ui/CssIcon";

const STAGES = ["NEW","BAAT HUI","QUOTE","PAKKI","LOST"];
const STAGE_COLORS: Record<string, string> = {
  NEW: "bg-blue-500", "BAAT HUI": "bg-purple-500",
  QUOTE: "bg-yellow-500", PAKKI: "bg-green-500", LOST: "bg-red-500",
};

const ACTION_ICONS: Record<string, CssIconName> = {
  "Lead Added": "sparkles", "Called": "phone", "WhatsApp": "chat",
  "Stage Changed": "refresh", "Note Added": "info", "Follow-up Set": "calendar",
  "Follow-up Done": "check", "Quote Sent": "rupee", "Catalog Sent": "bag",
};

export default function LeadDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [lead, setLead] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [noteText, setNoteText] = useState("");
  const [noteAction, setNoteAction] = useState("Note Added");
  const [fuDate, setFuDate] = useState("");
  const [fuNote, setFuNote] = useState("");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

  const fetchLead = async () => {
    const res = await fetch(`/api/leads/${id}`);
    if (res.ok) {
      const data = await res.json();
      setLead(data);
      setEditForm({ stage: data.stage, temperature: data.temperature, quote: data.quote || "", assignedTo: data.assignedTo || "", notes: data.notes || "", nextFollowup: data.nextFollowup || "" });
    }
  };

  useEffect(() => {
    if (id) fetchLead();
    fetch("/api/staff").then(r => r.json()).then(setStaff).catch(() => {});
  }, [id]);

  const addNote = async () => {
    if (!noteText.trim()) { showToast("Please enter a note!", "error"); return; }
    setLoading(true);
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ historyNote: noteText, historyAction: noteAction }),
    });
    showToast("Note added!");
    setNoteText("");
    fetchLead();
    setLoading(false);
  };

  const addFollowup = async () => {
    if (!fuDate) { showToast("Follow-up date is required!", "error"); return; }
    await fetch(`/api/leads/${id}/followup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dueAt: fuDate, note: fuNote }),
    });
    showToast("Follow-up scheduled!");
    setFuDate(""); setFuNote("");
    fetchLead();
  };

  const markFollowupDone = async (fuId: number) => {
    await fetch("/api/followups", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: fuId }),
    });
    showToast("Follow-up completed!");
    fetchLead();
  };

  const saveEdit = async () => {
    setLoading(true);
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stage: editForm.stage, temperature: editForm.temperature,
        quote: editForm.quote ? parseFloat(editForm.quote) : null,
        assignedTo: editForm.assignedTo ? parseInt(editForm.assignedTo) : null,
        notes: editForm.notes,
        historyNote: `Lead updated by staff`,
        historyAction: "Note Added",
      }),
    });
    showToast("Lead updated!");
    setEditing(false);
    fetchLead();
    setLoading(false);
  };

  const moveStage = async (newStage: string) => {
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: newStage }),
    });
    showToast(`Stage -> ${newStage}`);
    fetchLead();
  };

  if (!lead) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="font-heading text-primary animate-pulse text-2xl">Loading...</p>
    </div>
  );

  const stageIndex = STAGES.indexOf(lead.stage);

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingDots /><MarqueeStrip /><Navbar /><ToastContainer />

      <main className="relative z-10 pt-20 pb-10 px-4 max-w-6xl mx-auto">
        {/* Back + Header */}
        <div className="flex items-center gap-4 mb-6">
          <motion.button whileHover={{ x: -4 }} onClick={() => router.push("/leads")}
            className="p-2 rounded-full hover:bg-softPink transition-colors">
            <CssIcon name="arrow-left" size={18} className="text-primary" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-heading text-primary">{lead.naam}</h1>
            <p className="text-sm font-body text-text/50">{lead.phone} · {lead.source} {lead.city ? `· ${lead.city}` : ""}</p>
          </div>
          <div className="ml-auto flex gap-3">
            <motion.a href={`https://wa.me/91${lead.phone}`} target="_blank"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366] text-white font-body text-sm font-semibold shadow-md hover:shadow-lg transition-all">
              <CssIcon name="chat" size={15} /> WhatsApp
              <span className="absolute inset-0 rounded-full border-2 border-[#25D366] animate-ping opacity-30" />
            </motion.a>
            <motion.a href={`tel:${lead.phone}`}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white font-body text-sm font-semibold">
              <CssIcon name="phone" size={15} /> Call
            </motion.a>
          </div>
        </div>

        {/* Stage Pipeline Stepper */}
        <Card hover={false} className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto">
            {STAGES.map((s, i) => {
              const isCurrent = s === lead.stage;
              const isPast = i < stageIndex;
              return (
                <div key={s} className="flex items-center gap-2 flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => moveStage(s)}
                    className={`px-4 py-2 rounded-full text-sm font-body font-semibold transition-all ${
                      isCurrent ? `${STAGE_COLORS[s]} text-white shadow-md` :
                      isPast ? "bg-success/10 text-success" :
                      "bg-softPink text-text/50 hover:bg-softPink/80"
                    }`}>
                    {isPast && <CssIcon name="check" size={11} className="inline mr-1" />}{s}
                  </motion.button>
                  {i < STAGES.length - 1 && <CssIcon name="arrow-right" size={12} className="text-text/30 flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Details + Edit */}
          <div className="lg:col-span-1 space-y-6">
            <Card hover={false}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-primary">Lead Details</h3>
                <Button size="sm" variant="secondary" onClick={() => setEditing(!editing)}>
                  {editing ? "Cancel" : "Edit"}
                </Button>
              </div>

              {editing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-body text-text/50">Stage</label>
                    <select value={editForm.stage} onChange={e => setEditForm((p: any) => ({ ...p, stage: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-gold/20 bg-background font-body text-sm outline-none">
                      {STAGES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-body text-text/50">Temperature</label>
                    <select value={editForm.temperature} onChange={e => setEditForm((p: any) => ({ ...p, temperature: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-gold/20 bg-background font-body text-sm outline-none">
                      {["Hot","Warm","Cold"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-body text-text/50">Quote ₹</label>
                    <input type="number" value={editForm.quote} onChange={e => setEditForm((p: any) => ({ ...p, quote: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-gold/20 bg-background font-body text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-body text-text/50">Assign To</label>
                    <select value={editForm.assignedTo} onChange={e => setEditForm((p: any) => ({ ...p, assignedTo: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-gold/20 bg-background font-body text-sm outline-none">
                      <option value="">Unassigned</option>
                      {staff.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-body text-text/50">Notes</label>
                    <textarea value={editForm.notes} onChange={e => setEditForm((p: any) => ({ ...p, notes: e.target.value }))} rows={3}
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-gold/20 bg-background font-body text-sm outline-none resize-none" />
                  </div>
                  <Button fullWidth onClick={saveEdit} disabled={loading}>Save Changes</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { label: "Stage",    value: <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${STAGE_COLORS[lead.stage]}`}>{lead.stage}</span> },
                    { label: "Temperature", value: lead.temperature },
                    { label: "Source",   value: lead.source },
                    { label: "Query",    value: lead.query || "—" },
                    { label: "Quote",    value: lead.quote ? formatCurrency(lead.quote) : "—" },
                    { label: "Assigned", value: lead.staff?.name || "Unassigned" },
                    { label: "Notes",    value: lead.notes || "—" },
                  ].map((row, i) => (
                    <div key={i} className="flex items-start gap-3 py-2 border-b border-gold/5">
                      <span className="text-xs font-body text-text/40 w-24 flex-shrink-0 pt-0.5">{row.label}</span>
                      <span className="text-sm font-body text-text flex-1">{row.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Follow-ups */}
            <Card hover={false}>
              <h3 className="font-heading text-primary mb-4 flex items-center gap-2"><CssIcon name="calendar" size={16} className="text-gold" /> Follow-ups</h3>
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {lead.followups?.map((fu: any) => (
                  <div key={fu.id} className={`flex items-center justify-between p-2.5 rounded-xl ${fu.isDone ? "bg-success/5 opacity-50" : new Date(fu.dueAt) < new Date() ? "bg-danger/5 border border-danger/20" : "bg-softPink"}`}>
                    <div>
                      <p className="text-xs font-body font-medium">{fu.dueAt?.slice(0, 16).replace("T", " ")}</p>
                      {fu.note && <p className="text-[10px] text-text/50 font-body">{fu.note}</p>}
                    </div>
                    {!fu.isDone && (
                      <Button size="sm" variant="success" onClick={() => markFollowupDone(fu.id)}><CssIcon name="check" size={12} /></Button>
                    )}
                    {fu.isDone && <span className="text-xs text-success font-body">Done</span>}
                  </div>
                ))}
                {lead.followups?.length === 0 && <p className="text-text/30 text-xs font-body text-center py-3">No follow-ups scheduled</p>}
              </div>

              <div className="border-t border-gold/10 pt-3 space-y-2">
                <input type="datetime-local" value={fuDate} onChange={e => setFuDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gold/20 bg-background font-body text-xs outline-none" />
                <input value={fuNote} onChange={e => setFuNote(e.target.value)} placeholder="Note (optional)"
                  className="w-full px-3 py-2 rounded-xl border border-gold/20 bg-background font-body text-xs outline-none" />
                <Button fullWidth size="sm" onClick={addFollowup}><CssIcon name="plus" size={12} /> Add Follow-up</Button>
              </div>
            </Card>
          </div>

          {/* Right: History Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <Card hover={false}>
              <h3 className="font-heading text-primary mb-4">Activity History</h3>

              {/* Add Note */}
              <div className="p-4 bg-softPink rounded-2xl mb-6 space-y-3">
                <div className="flex gap-2 flex-wrap">
                  {["Called","WhatsApp","Quote Sent","Note Added","Catalog Sent"].map(a => (
                    <button key={a} onClick={() => setNoteAction(a)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body transition-all ${noteAction === a ? "bg-primary text-white" : "bg-white text-text/60"}`}>
                      <CssIcon name={ACTION_ICONS[a] || "info"} size={11} /> {a}
                    </button>
                  ))}
                </div>
                <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={2}
                  placeholder="Call summary, quote sent, or next update..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-white font-body text-sm outline-none resize-none" />
                <Button size="sm" onClick={addNote} disabled={loading}>
                  <CssIcon name="plus" size={12} /> Add Note
                </Button>
              </div>

              {/* Timeline */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {lead.history?.map((h: any, i: number) => (
                  <motion.div key={h.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-maroon to-maroonLight text-white flex items-center justify-center flex-shrink-0">
                        <CssIcon name={ACTION_ICONS[h.action] || "info"} size={14} />
                      </div>
                      {i < lead.history.length - 1 && <div className="w-0.5 h-full bg-gold/20 mt-1" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-body font-semibold text-text">{h.action}</span>
                        <span className="text-xs font-body text-text/30">
                          {new Date(h.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-sm font-body text-text/60 mt-0.5">{h.note}</p>
                      {h.staff && <p className="text-xs text-text/30 font-body mt-0.5">by {h.staff.name}</p>}
                    </div>
                  </motion.div>
                ))}
                {lead.history?.length === 0 && <p className="text-center text-text/30 font-body py-8">No activity recorded yet</p>}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
