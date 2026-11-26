import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiError, apiOk, parseIntParam, withApiHandler } from "@/lib/api-response";
import { requireRole, sanitizeText } from "@/lib/security";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiHandler("PATCH /api/approvals/[id]", async () => {
    const owner = await requireRole(["OWNER"]);
    if (!owner) return apiError("Forbidden: Sirf Owner approve/reject kar sakta hai", 403);

    const id = parseIntParam(params.id);
    if (!id) return apiError("Invalid approval ID", 400);

    const body = await request.json();
    const status = sanitizeText(body?.status);
    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return apiError("Invalid approval status", 400);
    }

    const approval = await prisma.approval.update({
      where: { id },
      data: { status },
      include: { order: { include: { customer: true } } },
    });

    return apiOk(approval);
  });
}
