import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const returns = await prisma.return.findMany({
      include: {
        order: { include: { customer: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(returns);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch returns" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, reason, type, exchangeSize, refundAmount, refundMethod } = body;

    const ret = await prisma.return.create({
      data: {
        orderId,
        reason,
        type: type || "Return",
        exchangeSize: exchangeSize || null,
        refundAmount: refundAmount || null,
        refundMethod: refundMethod || null,
        status: "QC Pending",
      },
      include: { order: { include: { customer: true } } },
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status: type === "Exchange" ? "Exchanged" : "Returned" },
    });

    // Update customer return count
    await prisma.customer.update({
      where: { id: ret.order.customerId },
      data: { returnCount: { increment: 1 } },
    });

    return NextResponse.json(ret, { status: 201 });
  } catch (error) {
    console.error("Returns POST error:", error);
    return NextResponse.json({ error: "Return register nahi ho paya" }, { status: 500 });
  }
}
