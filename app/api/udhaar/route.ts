import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const udhaars = await prisma.udhaar.findMany({
      include: { customer: true },
      orderBy: { dueDate: "asc" },
    });
    return NextResponse.json(udhaars);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch udhaar" }, { status: 500 });
  }
}
