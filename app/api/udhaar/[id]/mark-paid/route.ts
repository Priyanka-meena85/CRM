import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const udhaar = await prisma.udhaar.update({
      where: { id },
      data: { status: "Paid" },
      include: { customer: true },
    });

    return NextResponse.json({
      message: `${udhaar.customer.name} ka ₹${udhaar.amount} Udhaar Paid ho gaya!`,
      udhaar,
    });
  } catch (error) {
    return NextResponse.json({ error: "Mark paid nahi ho paya" }, { status: 500 });
  }
}
