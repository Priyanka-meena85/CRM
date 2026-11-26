import { apiOk, withApiHandler } from "@/lib/api-response";
import { LeadService } from "@/services/lead.service";

export const dynamic = "force-dynamic";

export async function GET() {
  return withApiHandler("GET /api/leads/reports", async () => {
    const reports = await LeadService.getReports();
    return apiOk(reports);
  });
}
