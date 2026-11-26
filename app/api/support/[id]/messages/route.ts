import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Add message to ticket
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = parseInt(params.id);
    const body = await request.json();
    const { sender, body: messageBody, status } = body;

    const message = await prisma.supportMessage.create({
      data: { ticketId, sender, body: messageBody },
    });

    if (status) {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status },
      });
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Message send nahi hua" }, { status: 500 });
  }
}
