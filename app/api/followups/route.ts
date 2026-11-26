import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Get today's + overdue follow-ups
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "today"; // today / overdue / upcoming / all

    const now    = new Date();
    const today  = now.toISOString().slice(0, 10);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tmrStr = tomorrow.toISOString().slice(0, 10);

    let where: any = { isDone: false };

    if (filter === "today")    where.dueAt = { startsWith: today };
    if (filter === "overdue")  where.dueAt = { lt: today };
    if (filter === "upcoming") where.dueAt = { startsWith: tmrStr };

    const followups = await prisma.leadFollowup.findMany({
      where,
      include: {
        lead:  { include: { staff: true } },
        staff: true,
      },
      orderBy: { dueAt: "asc" },
    });

    return NextResponse.json(followups);
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// Mark follow-up done
export async function PATCH(request: NextRequest) {
  try {
    const { id, staffId } = await request.json();

    const fu = await prisma.leadFollowup.update({
      where: { id },
      data: { isDone: true, doneAt: new Date().toISOString() },
      include: { lead: true },
    });

    await prisma.leadHistory.create({
      data: { leadId: fu.leadId, staffId: staffId || null, action: "Follow-up Done", note: `Follow-up completed on ${new Date().toLocaleDateString("en-IN")}` },
    });

    return NextResponse.json(fu);
  } catch (e) {
    return NextResponse.json({ error: "Mark done nahi hua" }, { status: 500 });
  }
}
