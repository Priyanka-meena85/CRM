import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const channel = searchParams.get("channel") || "";
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (status) where.status = status;
    if (channel) where.channel = channel;
    if (search) {
      where.OR = [
        { orderNo: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { phone: { contains: search } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        items: { include: { product: true } },
        returns: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, channel, paymentMode, items, discount, shippingCharge, notes, addressId } = body;

    const total = items.reduce((sum: number, i: any) => sum + i.qty * i.price, 0);
    const finalTotal = total - (discount || 0) + (shippingCharge || 0);

    const orderNo = `PB${Date.now()}`;
    const isHighRisk = paymentMode === "COD" && (await isCodHighRisk(customerId));

    const order = await prisma.order.create({
      data: {
        orderNo,
        customerId,
        channel: channel || "Offline",
        paymentMode,
        total,
        discount: discount || 0,
        finalTotal,
        shippingCharge: shippingCharge || 0,
        notes: notes || null,
        addressId: addressId || null,
        isHighRisk,
        items: {
          create: items.map((i: any) => ({
            productId: i.productId,
            size: i.size,
            qty: i.qty,
            price: i.price,
          })),
        },
      },
      include: { items: { include: { product: true } }, customer: true },
    });

    // Update customer stats
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        totalKharida: { increment: finalTotal },
        totalOrders: { increment: 1 },
        lastVisit: new Date().toISOString(),
        isInactive: false,
      },
    });

    // Add loyalty points (1 point per ₹100)
    const pointsEarned = Math.floor(finalTotal / 100);
    if (pointsEarned > 0) {
      await prisma.loyaltyTransaction.create({
        data: {
          customerId,
          points: pointsEarned,
          reason: `Order ${orderNo} pe earned`,
        },
      });
      await prisma.customer.update({
        where: { id: customerId },
        data: { loyaltyPoints: { increment: pointsEarned } },
      });
    }

    // Auto VIP
    const updated = await prisma.customer.findUnique({ where: { id: customerId } });
    if (updated && updated.totalKharida >= 50000 && !updated.isVip) {
      await prisma.customer.update({ where: { id: customerId }, data: { isVip: true } });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Orders POST error:", error);
    return NextResponse.json({ error: "Order nahi bana" }, { status: 500 });
  }
}

async function isCodHighRisk(customerId: number): Promise<boolean> {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) return false;
  return customer.rtoRate > 0.3 || customer.isHighRisk;
}
