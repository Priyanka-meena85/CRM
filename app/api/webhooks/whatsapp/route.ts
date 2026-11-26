import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiError, apiOk, withApiHandler } from "@/lib/api-response";
import { sanitizeText, verifyWebhookSignature } from "@/lib/security";

export async function POST(req: NextRequest) {
  return withApiHandler("POST /api/webhooks/whatsapp", async () => {
    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256");
    const secret = process.env.WEBHOOK_SECRET;

    if (!verifyWebhookSignature(rawBody, signature, secret)) {
      return apiError("Invalid webhook signature", 401);
    }

    const payload = JSON.parse(rawBody);
    const phone = sanitizeText(payload?.from || payload?.phone);
    const name = sanitizeText(payload?.name) || "WhatsApp Lead";
    const query = sanitizeText(payload?.message || payload?.text);

    if (!phone) return apiError("Missing sender phone", 400);

    const lead = await prisma.lead.create({
      data: {
        naam: name,
        phone,
        source: "WhatsApp",
        query: query || "Inbound WhatsApp inquiry",
        stage: "NEW",
        temperature: "Hot",
        history: {
          create: {
            action: "Lead Created",
            note: `Inbound WhatsApp webhook: ${query}`,
          },
        },
      },
    });

    return apiOk({ received: true, leadId: lead.id }, 201);
  });
}
