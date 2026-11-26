import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "";

    const approvals = await prisma.approval.findMany({
      where: type ? { type } : {},
      include: { order: { include: { customer: true } }, staff: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(approvals);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, type, amount, requestedBy, note } = body;

    const approval = await prisma.approval.create({
      data: { orderId, type, amount, requestedBy, note },
    });

    return NextResponse.json(approval, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Approval request nahi bani" }, { status: 500 });
  }
}
