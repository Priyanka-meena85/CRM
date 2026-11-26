import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const measurements = await prisma.measurement.findMany({
      include: { customer: true },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(measurements);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch measurements" }, { status: 500 });
  }
}
