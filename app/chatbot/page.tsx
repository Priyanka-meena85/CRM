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
import ToastContainer, { showToast } from "@/components/ui/Toast";
import CssIcon from "@/components/ui/CssIcon";

interface ChatMsg {
  id: number;
  sender: "user" | "bot";
  text: string;
  time: string;
}

const SAMPLE_PROMPTS = [
  "Bridal lehenga ka rate kya hai?",
  "Size chart bhejo please",
  "Store timing aur address kya hai?",
  "Mera order track karna hai",
];

function generateBotReply(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("lehenga") || q.includes("rate") || q.includes("price")) {
    return "Namaste! Priya Boutique mein Bridal Lehenga ₹15,000 se ₹45,000 tak available hain. Custom fitting aur blouse stitching included hai! Kya aap apna wedding month aur pasandida color batayengi? Hum WhatsApp pe catalog bhej sakte hain.";
  }
  if (q.includes("size") || q.includes("chart")) {
    return "Priya Boutique Size Chart:\n• S: Bust 34\", Waist 28\"\n• M: Bust 36\", Waist 30\"\n• L: Bust 38\", Waist 32\"\n• XL: Bust 40\", Waist 34\"\nCustom alteration bhi 2 din mein ho jaati hai!";
  }
  if (q.includes("timing") || q.includes("address") || q.includes("kahan") || q.includes("store")) {
    return "Priya Boutique, Main Bazaar, Nathdwara (Raj.)\nTiming: Subah 10:30 AM se Raat 8:30 PM (Rozana khula hai)\nGoogle Maps pin aur video call trial ke liye 'BOOK' reply karein!";
  }
  if (q.includes("track") || q.includes("order")) {
    return "Apna Order ID (jaise PB202411002) ya registered mobile number batayein — main abhi live courier status check karke batati hoon!";
  }
  return "Namaste ji! Main Priya AI Assistant hoon (24x7 Hindi / English / Hinglish). Aap Bridal Lehenga, Kurti, Size Chart, ya Order Tracking ke baare mein pooch sakti hain. Hamari team bhi jaldi aapse connect karegi!";
}

export default function ChatbotPage() {
  const { status } = useSession();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<"Hinglish" | "Hindi" | "English">("Hinglish");
  const [botActive, setBotActive] = useState(true);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 1,
      sender: "bot",
      text: "Namaste! Main Priya Boutique ki 24x7 AI Assistant hoon. Hindi, English ya Hinglish mein kuch bhi poochein!",
      time: "Abhi",
    },
  ]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const sendMessage = (textToSend?: string) => {
    const query = (textToSend ?? input).trim();
    if (!query) return;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMsg = { id: Date.now(), sender: "user", text: query, time: now };
    const botMsg: ChatMsg = {
      id: Date.now() + 1,
      sender: "bot",
      text: generateBotReply(query),
      time: now,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    if (!textToSend) setInput("");
  };

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingDots />
      <MarqueeStrip />
      <Navbar />
      <ToastContainer />

      <main className="relative z-10 pt-20 pb-12 px-4 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading text-primary flex items-center gap-2">
              <CssIcon name="bot" size={26} className="text-gold" /> 24x7 AI Chatbot (Hindi / Hinglish)
            </h1>
            <p className="text-sm font-body text-text/60">Raat ko bhi customer query miss na ho — auto-reply + lead capture</p>
          </div>
          <Button
            variant={botActive ? "primary" : "secondary"}
            onClick={() => {
              setBotActive(!botActive);
              showToast(!botActive ? "AI Bot ON ho gaya!" : "AI Bot pause kiya gaya");
            }}
          >
            <CssIcon name="sparkles" size={14} className="mr-1.5" />
            {botActive ? "Bot Status: ACTIVE (24x7)" : "Bot Status: PAUSED"}
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Live Chat Simulator */}
          <Card className="lg:col-span-2 flex flex-col h-[540px]">
            <div className="flex items-center justify-between pb-3 border-b border-gold/20 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                <span className="font-heading text-primary">Priya AI Assistant (Live Demo)</span>
              </div>
              <div className="flex items-center gap-1.5">
                {(["Hinglish", "Hindi", "English"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-2.5 py-1 rounded-full text-xs font-body transition-all ${
                      language === lang ? "bg-maroon text-white" : "bg-softPink text-text/70"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-body whitespace-pre-line ${
                      m.sender === "user"
                        ? "bg-maroon text-white rounded-br-sm"
                        : "bg-softPink text-text border border-gold/20 rounded-bl-sm"
                    }`}
                  >
                    <p>{m.text}</p>
                    <p className={`text-[10px] mt-1 ${m.sender === "user" ? "text-white/70" : "text-text/40"}`}>{m.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick sample prompts */}
            <div className="flex flex-wrap gap-1.5 py-2 border-t border-gold/10 mt-2">
              {SAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="text-xs font-body px-3 py-1 rounded-full bg-gold/10 text-primary hover:bg-gold/20 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2 mt-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Customer ki tarah message likho (e.g. Bridal lehenga rate?)..."
                className="flex-1 px-4 py-2.5 rounded-full border border-gold/30 bg-white text-sm font-body focus:outline-none focus:border-maroon"
              />
              <Button type="submit" size="sm">
                <CssIcon name="send" size={14} />
              </Button>
            </form>
          </Card>

          {/* Right: API Integration & Capabilities */}
          <div className="space-y-4">
            <Card>
              <h3 className="font-heading text-lg text-primary flex items-center gap-2 mb-3">
                <CssIcon name="sparkles" size={16} className="text-gold" /> AI Bot Capabilities
              </h3>
              <ul className="space-y-2.5 text-sm font-body text-text/80">
                <li className="flex items-start gap-2">
                  <CssIcon name="check" size={14} className="text-success shrink-0 mt-1" />
                  <span>24x7 instant reply in Hindi, English & Hinglish</span>
                </li>
                <li className="flex items-start gap-2">
                  <CssIcon name="check" size={14} className="text-success shrink-0 mt-1" />
                  <span>Auto-saves new WhatsApp/Instagram DMs directly as Hot/Warm Leads</span>
                </li>
                <li className="flex items-start gap-2">
                  <CssIcon name="check" size={14} className="text-success shrink-0 mt-1" />
                  <span>Instant Size Chart, Catalog PDF & Store Location sharing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CssIcon name="check" size={14} className="text-success shrink-0 mt-1" />
                  <span>Complex queries ko seedha Staff Inbox mein handoff karta hai</span>
                </li>
              </ul>
            </Card>

            <Card className="bg-gradient-to-br from-maroon/5 to-gold/10 border border-gold/30">
              <div className="flex items-center gap-2 mb-2">
                <CssIcon name="chat" size={16} className="text-maroon" />
                <h3 className="font-heading text-base text-primary">Live Production Setup</h3>
              </div>
              <p className="text-xs font-body text-text/70 mb-3">
                Connect Dialogflow / OpenAI API + WhatsApp Business API (Interakt / Wati / AiSensy) for live automated replies.
              </p>
              <Badge variant="vip">Demo Mode Active</Badge>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
