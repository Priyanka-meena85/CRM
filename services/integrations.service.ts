import { isSafeExternalUrl, safeErrorLog } from "@/lib/security";

export interface IntegrationResult {
  mode: "live" | "sandbox";
  delivered: boolean;
  provider: string;
  detail?: string;
}

/**
 * Production Integration Service with automatic sandbox fallback when API keys are unset.
 */
export const IntegrationsService = {
  getStatus() {
    return {
      whatsapp: Boolean(process.env.WHATSAPP_API_URL && process.env.WHATSAPP_TOKEN),
      openai: Boolean(process.env.OPENAI_API_KEY),
      shiprocket: Boolean(process.env.SHIPROCKET_TOKEN),
      razorpay: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      redisRateLimit: Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
    };
  },

  async sendWhatsAppMessage(phone: string, message: string): Promise<IntegrationResult> {
    const apiUrl = process.env.WHATSAPP_API_URL;
    const token = process.env.WHATSAPP_TOKEN;

    if (!apiUrl || !token || !isSafeExternalUrl(apiUrl)) {
      return { mode: "sandbox", delivered: true, provider: "WhatsApp Cloud (Sandbox)" };
    }

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ to: `91${phone.replace(/\D/g, "").slice(-10)}`, text: message }),
      });
      return {
        mode: "live",
        delivered: res.ok,
        provider: "WhatsApp Business API",
        detail: res.ok ? "Sent" : `HTTP ${res.status}`,
      };
    } catch (err) {
      safeErrorLog("IntegrationsService.sendWhatsAppMessage", err);
      return { mode: "live", delivered: false, provider: "WhatsApp Business API" };
    }
  },

  async generateAiReply(prompt: string): Promise<{ reply: string; mode: "live" | "sandbox" }> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are Flo India's 24x7 Sleep Concierge (floindia.com). Help customers choose between Flo Ortho (firm orthopedic), Flo Ergo (Aloe Vera memory foam), Flo Anti-Gravity (100% natural latex), Flo Float (pocket spring), Flo Wave, and Adjustable Pillows. Mention the 100-Night Free Trial and 10-Year Warranty concisely.",
              },
              { role: "user", content: prompt },
            ],
            max_tokens: 220,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const content = data?.choices?.[0]?.message?.content?.trim();
          if (content) return { reply: content, mode: "live" };
        }
      } catch (err) {
        safeErrorLog("IntegrationsService.generateAiReply", err);
      }
    }

    const q = prompt.toLowerCase();
    if (q.includes("ortho") || q.includes("ergo") || q.includes("anti") || q.includes("price") || q.includes("better")) {
      return {
        mode: "sandbox",
        reply:
          "Hello! Flo Ortho (from ₹4,764) is firm (8/10) with Pain Release foam for back pain, while Flo Ergo (from ₹5,199) offers medium-firm Aloe Vera gel memory foam, and Flo Anti-Gravity uses 100% natural pin-core latex. All include a 100-Night Free Trial!",
      };
    }
    if (q.includes("trial") || q.includes("return") || q.includes("refund")) {
      return {
        mode: "sandbox",
        reply:
          "Flo India 100-Night Free Trial: Try your Flo Mattress at home for 100 nights. If you're not 100% satisfied, we schedule a free pickup and issue a full refund or size exchange.",
      };
    }
    if (q.includes("size") || q.includes("warranty") || q.includes("delivery")) {
      return {
        mode: "sandbox",
        reply:
          "Available Sizes: Single (72x36), Diwan (72x48), Queen (72x60), King (78x72), plus Custom Sizes. Every mattress includes a 10-Year Warranty and Free Pan-India Delivery.",
      };
    }
    if (q.includes("track") || q.includes("order")) {
      return {
        mode: "sandbox",
        reply:
          "Please share your Flo Order ID (e.g. FLO20261102) or registered phone number, and I will check your live Delhivery / BlueDart tracking status.",
      };
    }
    return {
      mode: "sandbox",
      reply:
        "Hello! I am Flo India's 24x7 Sleep Concierge. Ask me about Flo Ortho, Flo Ergo, Anti-Gravity Latex, 100-Night Trial, Sizing, or Order Tracking!",
    };
  },
};
