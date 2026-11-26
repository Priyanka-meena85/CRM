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
  "Flo Ortho vs Flo Ergo — which is better?",
  "How does the 100-night free trial work?",
  "What mattress sizes and warranty do you offer?",
  "I want to track my Flo order",
];

function generateBotReply(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("ortho") || q.includes("ergo") || q.includes("anti") || q.includes("price") || q.includes("better")) {
    return "Hello! Flo Ortho (from ₹4,764) is firm (8/10) with Pain Release foam for back pain, while Flo Ergo (from ₹5,199) offers medium-firm Aloe Vera gel memory foam, and Flo Anti-Gravity uses 100% natural pin-core latex. All include a 100-Night Free Trial!";
  }
  if (q.includes("trial") || q.includes("return") || q.includes("refund")) {
    return "Flo India 100-Night Free Trial:\nTry your Flo Mattress at home for 100 nights. If you're not 100% satisfied, we schedule a free pickup and issue a full refund or size exchange.";
  }
  if (q.includes("size") || q.includes("warranty") || q.includes("delivery")) {
    return "Available Sizes: Single (72x36), Diwan (72x48), Queen (72x60), King (78x72), plus Custom Sizes!\nEvery mattress includes a 10-Year Warranty and Free Pan-India Mattress-in-a-Box Delivery.";
  }
  if (q.includes("track") || q.includes("order")) {
    return "Please share your Flo Order ID (e.g. FLO20261102) or registered phone number, and I will check your live Delhivery / BlueDart tracking status.";
  }
  return "Hello! I am Flo India's 24x7 Sleep Concierge. Ask me about Flo Ortho, Flo Ergo, Anti-Gravity Latex, 100-Night Trial, Sizing, or Order Tracking!";
}

export default function ChatbotPage() {
  const { status } = useSession();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<"English" | "Hinglish" | "Hindi">("English");
  const [botActive, setBotActive] = useState(true);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 1,
      sender: "bot",
      text: "Hello! I am Flo India's 24x7 Sleep Concierge. Ask me about mattresses, 100-night trial, sizing, or order tracking!",
      time: "Just now",
    },
  ]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend ?? input).trim();
    if (!query) return;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMsg = { id: Date.now(), sender: "user", text: query, time: now };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");

    let replyText = generateBotReply(query);
    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.reply) replyText = data.reply;
      }
    } catch {}

    const botMsg: ChatMsg = {
      id: Date.now() + 1,
      sender: "bot",
      text: replyText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, botMsg]);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingDots />
      <MarqueeStrip />
      <Navbar />
      <ToastContainer />

      <main className="relative z-10 lg:pl-64 pt-20 pb-12 px-4 sm:px-6 max-w-[1600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading text-primary flex items-center gap-2">
              <CssIcon name="bot" size={26} className="text-gold" /> 24x7 AI Chatbot Assistant
            </h1>
            <p className="text-sm font-body text-text/60">Never miss an after-hours inquiry — instant auto-replies and lead capture</p>
          </div>
          <Button
            variant={botActive ? "primary" : "secondary"}
            onClick={() => {
              setBotActive(!botActive);
              showToast(!botActive ? "AI Bot enabled!" : "AI Bot paused");
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
                <span className="font-heading text-primary">Flo Sleep Concierge (Live Demo)</span>
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
                placeholder="Type a customer inquiry (e.g. Flo Ortho vs Ergo?)..."
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
                  <span>Hands off complex inquiries directly to the Staff Inbox</span>
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
