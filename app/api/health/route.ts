import prisma from "@/lib/prisma";
import { apiError, apiOk } from "@/lib/api-response";
import { IntegrationsService } from "@/services/integrations.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return apiOk({
      status: "ok",
      database: "connected",
      integrations: IntegrationsService.getStatus(),
      timestamp: new Date().toISOString(),
    });
  } catch {
    return apiError("Database connection failed", 503);
  }
}
