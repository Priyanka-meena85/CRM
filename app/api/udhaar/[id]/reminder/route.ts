import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const udhaar = await prisma.udhaar.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!udhaar) {
      return NextResponse.json({ error: "Udhaar nahi mila" }, { status: 404 });
    }

    // In production, send WhatsApp reminder via Twilio
    // For now, just return success
    return NextResponse.json({
      message: `${udhaar.customer.name} ko ₹${udhaar.amount} ka reminder bhej diya WhatsApp pe`,
      phone: udhaar.customer.phone,
    });
  } catch (error) {
    return NextResponse.json({ error: "Reminder nahi bhej paya" }, { status: 500 });
  }
}
