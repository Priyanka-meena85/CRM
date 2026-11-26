import { NextRequest } from "next/server";
import { apiError, apiOk, parseIntParam, withApiHandler } from "@/lib/api-response";
import { requireRole, requireSession, sanitizeText } from "@/lib/security";
import { LeadService } from "@/services/lead.service";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiHandler("GET /api/leads/[id]", async () => {
    const user = await requireSession();
    if (!user) return apiError("Unauthorized", 401);

    const id = parseIntParam(params.id);
    if (!id) return apiError("Invalid lead ID", 400);

    const lead = await LeadService.getById(id);
    if (!lead) return apiError("Lead nahi mili", 404);

    // BOLA / IDOR check: Staff can only view unassigned or self-assigned leads
    if (user.role !== "OWNER" && lead.assignedTo && String(lead.assignedTo) !== String(user.id)) {
      return apiError("Forbidden: Yeh lead aapke paas assigned nahi hai", 403);
    }

    return apiOk(lead);
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiHandler("PATCH /api/leads/[id]", async () => {
    const user = await requireSession();
    if (!user) return apiError("Unauthorized", 401);

    const id = parseIntParam(params.id);
    if (!id) return apiError("Invalid lead ID", 400);

    const existing = await LeadService.getById(id);
    if (!existing) return apiError("Lead nahi mili", 404);

    if (user.role !== "OWNER" && existing.assignedTo && String(existing.assignedTo) !== String(user.id)) {
      return apiError("Forbidden", 403);
    }

    const body = await req.json();
    const updated = await LeadService.update(id, {
      ...body,
      notes: body.notes !== undefined ? sanitizeText(body.notes) : undefined,
      lostReason: body.lostReason !== undefined ? sanitizeText(body.lostReason) : undefined,
      historyNote: body.historyNote !== undefined ? sanitizeText(body.historyNote) : undefined,
    });

    return apiOk(updated);
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiHandler("DELETE /api/leads/[id]", async () => {
    const owner = await requireRole(["OWNER"]);
    if (!owner) return apiError("Forbidden: Sirf Owner delete kar sakta hai", 403);

    const id = parseIntParam(params.id);
    if (!id) return apiError("Invalid lead ID", 400);

    await LeadService.delete(id);
    return apiOk({ message: "Lead delete ho gayi" });
  });
}
