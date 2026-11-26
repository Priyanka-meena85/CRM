import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");

    const tickets = await prisma.supportTicket.findMany({
      where: {
        ...(customerId && { customerId: parseInt(customerId) }),
        ...(status && { status }),
      },
      include: {
        customer: true,
        messages: { orderBy: { sentAt: "asc" } },
        staff: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, channel, subject, firstMessage, assignedTo } = body;

    const ticket = await prisma.supportTicket.create({
      data: {
        customerId: customerId || null,
        channel: channel || "WhatsApp",
        subject: subject || null,
        assignedTo: assignedTo || null,
        messages: firstMessage
          ? { create: { sender: "customer", body: firstMessage } }
          : undefined,
      },
      include: { customer: true, messages: true },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Ticket nahi bana" }, { status: 500 });
  }
}
