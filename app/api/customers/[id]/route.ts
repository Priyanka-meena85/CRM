import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
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

    if (!customer) return NextResponse.json({ error: "Customer nahi mila" }, { status: 404 });

    // Calculate RTO rate
    const totalOrders = customer.orders.length + customer.bills.length;
    const rtoRate = totalOrders > 0 ? customer.returnCount / totalOrders : 0;

    return NextResponse.json({ ...customer, rtoRate: Math.round(rtoRate * 100) });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    const customer = await prisma.customer.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json({ error: "Customer update nahi hua" }, { status: 500 });
  }
}
