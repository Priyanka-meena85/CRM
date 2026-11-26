import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Add follow-up to a lead
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const leadId = parseInt(params.id);
    const { dueAt, note, staffId } = await req.json();

    const fu = await prisma.leadFollowup.create({
      data: { leadId, dueAt, note: note || null, staffId: staffId || null },
      include: { lead: true },
    });

    await prisma.lead.update({ where: { id: leadId }, data: { nextFollowup: dueAt } });

    await prisma.leadHistory.create({
      data: { leadId, staffId: staffId || null, action: "Follow-up Set", note: `Follow-up: ${dueAt}` },
    });

    return NextResponse.json(fu, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Follow-up add nahi hua" }, { status: 500 });
  }
}
