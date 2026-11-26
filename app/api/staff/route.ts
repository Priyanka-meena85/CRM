import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      include: { bills: { select: { finalTotal: true } } },
    });

    const staffWithSales = staff.map((s) => ({
      id: s.id,
      name: s.name,
      phone: s.phone,
      role: s.role,
      targetMonthly: s.targetMonthly,
      commissionPercent: s.commissionPercent,
      monthlySale: s.bills.reduce((sum, b) => sum + b.finalTotal, 0),
      targetPercent:
        s.targetMonthly > 0
          ? Math.round(
              (s.bills.reduce((sum, b) => sum + b.finalTotal, 0) / s.targetMonthly) * 100
            )
          : 0,
    }));

    return NextResponse.json(staffWithSales);
  } catch (error) {
    console.error("Staff GET error:", error);
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, role, targetMonthly, commissionPercent } = body;
    if (!name || !phone) {
      return NextResponse.json({ error: "Naam aur phone zaroori hai" }, { status: 400 });
    }
    const created = await prisma.staff.create({
      data: {
        name,
        phone,
        role: role || "STAFF",
        targetMonthly: Number(targetMonthly) || 50000,
        commissionPercent: Number(commissionPercent) || 2,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Staff POST error:", error);
    return NextResponse.json({ error: "Failed to create staff" }, { status: 500 });
  }
}
