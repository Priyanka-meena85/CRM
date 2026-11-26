import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiError, apiOk, parseIntParam, withApiHandler } from "@/lib/api-response";
import { requireSession, sanitizeText } from "@/lib/security";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiHandler("PATCH /api/orders/[id]", async () => {
    const user = await requireSession();
    if (!user) return apiError("Unauthorized", 401);

    const id = parseIntParam(params.id);
    if (!id) return apiError("Invalid order ID", 400);

    const body = await request.json();
    const status = body.status ? sanitizeText(body.status) : undefined;
    const trackingId = body.trackingId ? sanitizeText(body.trackingId) : undefined;
    const courier = body.courier ? sanitizeText(body.courier) : undefined;
    const trackingStatus = body.trackingStatus ? sanitizeText(body.trackingStatus) : undefined;

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(trackingId && { trackingId }),
        ...(courier && { courier }),
        ...(trackingStatus && { trackingStatus }),
        ...(body.codVerified !== undefined && { codVerified: Boolean(body.codVerified) }),
      },
      include: { customer: true, items: { include: { product: true } } },
    });

    return apiOk(order);
  });
}
