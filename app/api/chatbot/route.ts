import { NextRequest } from "next/server";
import { apiError, apiOk, withApiHandler } from "@/lib/api-response";
import { requireSession, sanitizeText } from "@/lib/security";
import { IntegrationsService } from "@/services/integrations.service";

export async function POST(req: NextRequest) {
  return withApiHandler("POST /api/chatbot", async () => {
    const user = await requireSession();
    if (!user) return apiError("Unauthorized", 401);

    const body = await req.json();
    const message = sanitizeText(body?.message);
    if (!message) return apiError("Message is required", 400);

    const result = await IntegrationsService.generateAiReply(message);
    return apiOk(result);
  });
}
