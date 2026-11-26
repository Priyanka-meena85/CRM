import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiError, apiOk, parseIntParam, withApiHandler } from "@/lib/api-response";
import { requireSession, sanitizeText } from "@/lib/security";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiHandler("GET /api/customers/[id]", async () => {
    const user = await requireSession();
    if (!user) return apiError("Unauthorized", 401);

    const id = parseIntParam(params.id);
    if (!id) return apiError("Invalid customer ID", 400);

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        bills: { include: { items: { include: { product: true } } }, orderBy: { createdAt: "desc" }, take: 10 },
        orders: { orderBy: { createdAt: "desc" }, take: 10 },
        measurements: true,
        alterations: true,
        udhaars: true,
        loyaltyTx: { orderBy: { createdAt: "desc" }, take: 20 },
        wishlists: { include: { product: true } },
        deliveryAddresses: true,
        supportTickets: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    });

    if (!customer) return apiError("Customer nahi mila", 404);

    const totalOrders = customer.orders.length + customer.bills.length;
    const rtoRate = totalOrders > 0 ? customer.returnCount / totalOrders : 0;

    return apiOk({ ...customer, rtoRate: Math.round(rtoRate * 100) });
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiHandler("PATCH /api/customers/[id]", async () => {
    const user = await requireSession();
    if (!user) return apiError("Unauthorized", 401);

    const id = parseIntParam(params.id);
    if (!id) return apiError("Invalid customer ID", 400);

    const body = await request.json();

    // Whitelist updatable fields to prevent mass-assignment
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = sanitizeText(body.name);
    if (body.phone !== undefined) data.phone = sanitizeText(body.phone);
    if (body.email !== undefined) data.email = sanitizeText(body.email);
    if (body.city !== undefined) data.city = sanitizeText(body.city);
    if (body.size !== undefined) data.size = sanitizeText(body.size);
    if (body.fitPreference !== undefined) data.fitPreference = sanitizeText(body.fitPreference);
    if (body.pasand !== undefined) data.pasand = sanitizeText(body.pasand);
    if (body.notes !== undefined) data.notes = sanitizeText(body.notes);

    const customer = await prisma.customer.update({
      where: { id },
      data,
    });

    return apiOk(customer);
  });
}
