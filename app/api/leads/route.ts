import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search   = searchParams.get("search")  || "";
    const stage    = searchParams.get("stage")   || "";
    const source   = searchParams.get("source")  || "";
    const temp     = searchParams.get("temp")    || "";
    const assigned = searchParams.get("assigned")|| "";
    const date     = searchParams.get("date")    || "";

    const where: any = {};
    if (stage)    where.stage       = stage;
    if (source)   where.source      = source;
    if (temp)     where.temperature = temp;
    if (assigned) where.assignedTo  = parseInt(assigned);
    if (search)   where.OR = [
      { naam: { contains: search } },
      { phone: { contains: search } },
    ];

    const leads = await prisma.lead.findMany({
      where,
      include: {
        staff: { select: { id: true, name: true } },
        history: { orderBy: { createdAt: "desc" }, take: 1 },
        followups: { where: { isDone: false }, orderBy: { dueAt: "asc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(leads);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { naam, phone, email, source, query, quote, stage, temperature,
            assignedTo, nextFollowup, notes, city } = body;

    if (!naam || !phone || !source) {
      return NextResponse.json({ error: "Naam, phone aur source zaroori hai" }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        naam, phone, email: email || null, source,
        query: query || null, quote: quote || null,
        stage: stage || "NEW", temperature: temperature || "Warm",
        assignedTo: assignedTo || null, nextFollowup: nextFollowup || null,
        notes: notes || null, city: city || null,
      },
      include: { staff: true },
    });

    // Auto-create first follow-up if nextFollowup given
    if (nextFollowup) {
      await prisma.leadFollowup.create({
        data: { leadId: lead.id, staffId: assignedTo || null, dueAt: nextFollowup, note: "Initial follow-up" },
      });
    }

    // Log history
    await prisma.leadHistory.create({
      data: { leadId: lead.id, staffId: assignedTo || null, action: "Lead Added", note: `New lead from ${source}` },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lead nahi bani" }, { status: 500 });
  }
}
