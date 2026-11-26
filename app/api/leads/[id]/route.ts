import { NextRequest } from "next/server";
import { apiError, apiOk, parseIntParam, withApiHandler } from "@/lib/api-response";
import { LeadService } from "@/services/lead.service";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiHandler("GET /api/leads/[id]", async () => {
    const id = parseIntParam(params.id);
    if (!id) return apiError("Invalid lead ID", 400);

    const lead = await LeadService.getById(id);
    if (!lead) return apiError("Lead nahi mili", 404);

    return apiOk(lead);
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiHandler("PATCH /api/leads/[id]", async () => {
    const id = parseIntParam(params.id);
    if (!id) return apiError("Invalid lead ID", 400);

    const body = await req.json();
    const updated = await LeadService.update(id, body);
    if (!updated) return apiError("Lead nahi mili", 404);

    return apiOk(updated);
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiHandler("DELETE /api/leads/[id]", async () => {
    const id = parseIntParam(params.id);
    if (!id) return apiError("Invalid lead ID", 400);

    await LeadService.delete(id);
    return apiOk({ message: "Lead delete ho gayi" });
  });
}
