import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        staff: true,
        history:  { include: { staff: true }, orderBy: { createdAt: "desc" } },
        followups:{ include: { staff: true }, orderBy: { dueAt: "asc" } },
        catalogsSent: { orderBy: { sentAt: "desc" } },
      },
    });
    if (!lead) return NextResponse.json({ error: "Lead nahi mili" }, { status: 404 });
    return NextResponse.json(lead);
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id   = parseInt(params.id);
    const body = await req.json();
    const { stage, temperature, quote, assignedTo, nextFollowup,
            notes, lostReason, historyNote, historyAction, staffId } = body;

    const prevLead = await prisma.lead.findUnique({ where: { id }, select: { stage: true } });

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...(stage         !== undefined && { stage }),
        ...(temperature   !== undefined && { temperature }),
        ...(quote         !== undefined && { quote }),
        ...(assignedTo    !== undefined && { assignedTo }),
        ...(nextFollowup  !== undefined && { nextFollowup }),
        ...(notes         !== undefined && { notes }),
        ...(lostReason    !== undefined && { lostReason }),
      },
      include: { staff: true },
    });

    // Auto-log stage change
    if (stage && stage !== prevLead?.stage) {
      await prisma.leadHistory.create({
        data: {
          leadId: id, staffId: staffId || null,
          action: "Stage Changed",
          note: `${prevLead?.stage} → ${stage}`,
        },
      });
    }

    // Log custom history
    if (historyNote) {
      await prisma.leadHistory.create({
        data: { leadId: id, staffId: staffId || null, action: historyAction || "Note Added", note: historyNote },
      });
    }

    return NextResponse.json(lead);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lead update nahi hua" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    await prisma.leadCatalog.deleteMany({ where: { leadId: id } });
    await prisma.leadFollowup.deleteMany({ where: { leadId: id } });
    await prisma.leadHistory.deleteMany({ where: { leadId: id } });
    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ message: "Lead delete ho gayi" });
  } catch (e) {
    return NextResponse.json({ error: "Delete nahi hua" }, { status: 500 });
  }
}
