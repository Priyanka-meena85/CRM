"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import FloatingDots from "@/components/ui/FloatingDots";
import MarqueeStrip from "@/components/ui/MarqueeStrip";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import ToastContainer, { showToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";
import CssIcon, { CssIconName } from "@/components/ui/CssIcon";

const channelIcons: Record<string, { icon: CssIconName; color: string }> = {
  WhatsApp: { icon: "chat", color: "text-[#25D366] bg-[#25D366]/10" },
  Instagram: { icon: "sparkles", color: "text-pink-500 bg-pink-50" },
  Facebook: { icon: "info", color: "text-blue-500 bg-blue-50" },
  Email: { icon: "send", color: "text-primary bg-softPink" },
};

const QUICK_REPLIES = [
  { title: "Size Chart", body: "Priya Boutique Size Chart:\nS: Bust 34\", Waist 28\"\nM: Bust 36\", Waist 30\"\nL: Bust 38\", Waist 32\"\nXL: Bust 40\", Waist 34\"" },
  { title: "Return Policy", body: "Our Return Policy:\nReturns and exchanges are accepted within 7 days with original tags and packaging.\nContact: 9876543210" },
  { title: "Care Instructions", body: "Care Instructions:\n• Hand wash gently in cold water\n• Dry in shade away from direct sunlight\n• Iron on reverse side" },
  { title: "Tracking Link", body: "Track your order here:\nhttps://track.shiprocket.in/[TRACKING_ID]\n\nNeed help? Call us at 9876543210" },
  { title: "Special Offer", body: "Exclusive Offer for You!\n20% OFF on all Kurtis this week!\nCode: PRIYA20\nShop now at priyaboutique.in" },
];

export default function InboxPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [filterStatus, setFilterStatus] = useState("Open");
  const [filterChannel, setFilterChannel] = useState("All");
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchTickets = async () => {
    const params = new URLSearchParams();
    if (filterStatus !== "All") params.set("status", filterStatus);
    const res = await fetch(`/api/support?${params}`);
    if (res.ok) setTickets(await res.json());
  };

  useEffect(() => { fetchTickets(); }, [filterStatus, filterChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket?.messages]);

  const sendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;

    const res = await fetch(`/api/support/${selectedTicket.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: "staff", body: replyText }),
    });

    if (res.ok) {
      showToast("Reply sent!");
      setReplyText("");
      // Refresh ticket
      const ticketRes = await fetch(`/api/support?status=${filterStatus}`);
      if (ticketRes.ok) {
        const updatedTickets = await ticketRes.json();
        setTickets(updatedTickets);
        setSelectedTicket(updatedTickets.find((t: any) => t.id === selectedTicket.id) || null);
      }
    }
  };

  const resolveTicket = async (ticketId: number) => {
    await fetch(`/api/support/${ticketId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: "staff", body: "Ticket resolved.", status: "Resolved" }),
    });
    showToast("Ticket resolved!");
    fetchTickets();
    setSelectedTicket(null);
  };

  const filteredTickets = tickets.filter((t) =>
    filterChannel === "All" || t.channel === filterChannel
  );

  if (status === "loading") return null;

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingDots />
      <MarqueeStrip />
      <Navbar />
      <ToastContainer />

      <main className="relative z-10 pt-20 pb-4 px-4 max-w-7xl mx-auto h-screen">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <h1 className="text-3xl font-heading text-primary flex items-center gap-2"><CssIcon name="chat" size={24} className="text-gold" /> Support Inbox</h1>
          <p className="text-sm font-body text-text/50">WhatsApp, Instagram, Facebook, Email — all in one inbox</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-180px)]">
          {/* Ticket List */}
          <div className="flex flex-col gap-3">
            {/* Filters */}
            <div className="flex gap-2">
              {["Open", "In-Progress", "Resolved", "All"].map((s) => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`flex-1 py-1.5 rounded-full text-xs font-body font-medium transition-all ${filterStatus === s ? "bg-primary text-white" : "bg-white text-text/50 border border-gold/10"}`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {["All", "WhatsApp", "Instagram", "Email"].map((ch) => (
                <button key={ch} onClick={() => setFilterChannel(ch)}
                  className={`flex-1 py-1 rounded-full text-xs font-body transition-all ${filterChannel === ch ? "bg-gold text-white" : "bg-white text-text/40 border border-gold/10"}`}>
                  {ch}
                </button>
              ))}
            </div>

            {/* Tickets */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredTickets.map((ticket) => {
                const ch = channelIcons[ticket.channel] || channelIcons.WhatsApp;
                const lastMsg = ticket.messages?.[ticket.messages.length - 1];
                return (
                  <motion.div key={ticket.id} whileHover={{ x: 4 }}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-3 rounded-2xl cursor-pointer transition-all border ${selectedTicket?.id === ticket.id ? "border-gold/40 bg-softPink shadow-md" : "border-gold/10 bg-white hover:border-gold/20"}`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${ch.color}`}><CssIcon name={ch.icon} size={14} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-body font-semibold text-sm text-text truncate">
                            {ticket.customer?.name || "Unknown"}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-body ${ticket.status === "Open" ? "bg-danger/10 text-danger" : ticket.status === "Resolved" ? "bg-success/10 text-success" : "bg-gold/10 text-gold"}`}>
                            {ticket.status}
                          </span>
                        </div>
                        <p className="text-xs text-text/40 font-body truncate mt-0.5">
                          {lastMsg?.body || ticket.subject || "New ticket"}
                        </p>
                        <p className="text-[10px] text-text/30 mt-1">{ticket.channel}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {filteredTickets.length === 0 && (
                <p className="text-center text-text/30 text-sm font-body py-8">No tickets found</p>
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 flex flex-col bg-white rounded-[28px] border border-gold/10 shadow-md overflow-hidden">
            {selectedTicket ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-gold/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-softPink flex items-center justify-center">
                      <CssIcon name="user" size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-heading text-primary">{selectedTicket.customer?.name || "Unknown Customer"}</p>
                      <p className="text-xs font-body text-text/50 flex items-center gap-1">
                        <CssIcon name="phone" size={10} /> {selectedTicket.customer?.phone || "—"}
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-softPink text-primary text-[10px]">
                          {selectedTicket.channel}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="success" onClick={() => resolveTicket(selectedTicket.id)}>
                      <CssIcon name="check" size={12} /> Resolve
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f0ece4]">
                  {selectedTicket.messages?.map((msg: any) => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === "staff" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm font-body shadow-sm ${msg.sender === "staff"
                        ? "bg-gradient-to-br from-maroon to-maroonLight text-white rounded-br-sm"
                        : "bg-white text-text rounded-bl-sm"}`}>
                        {msg.body}
                        <p className={`text-[10px] mt-1 ${msg.sender === "staff" ? "text-white/60" : "text-text/40"}`}>
                          {new Date(msg.sentAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                <AnimatePresence>
                  {showQuickReplies && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} className="border-t border-gold/10 overflow-hidden">
                      <div className="p-3 flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                        {QUICK_REPLIES.map((qr) => (
                          <button key={qr.title} onClick={() => { setReplyText(qr.body); setShowQuickReplies(false); }}
                            className="px-3 py-1.5 rounded-full text-xs font-body bg-softPink text-primary hover:bg-primary hover:text-white transition-all">
                            {qr.title}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Reply Box */}
                <div className="p-3 border-t border-gold/10 flex gap-2 items-end">
                  <button onClick={() => setShowQuickReplies(!showQuickReplies)}
                    className="p-2 rounded-full bg-softPink text-primary hover:bg-primary hover:text-white transition-colors flex-shrink-0" title="Quick Replies">
                    <CssIcon name="sparkles" size={14} />
                  </button>
                  <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                    placeholder="Write a reply... (Enter to send)"
                    className="flex-1 resize-none rounded-2xl border border-gold/20 bg-background px-4 py-2.5 font-body text-sm outline-none focus:border-gold/40 max-h-24"
                    rows={1} />
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={sendReply}
                    className="p-2.5 rounded-full bg-gradient-to-r from-maroon to-maroonLight text-white shadow-md flex-shrink-0">
                    <CssIcon name="send" size={14} />
                  </motion.button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <div className="flex justify-center mb-3"><CssIcon name="chat" size={32} className="text-gold" /></div>
                  <p className="font-heading text-primary text-xl mb-2">Select a Ticket</p>
                  <p className="font-body text-text/40 text-sm">Click any conversation on the left to view messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
