import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Quick Replies
export async function GET() {
  try {
    const replies = await prisma.quickReply.findMany({ orderBy: { category: "asc" } });
    return NextResponse.json(replies);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const reply = await prisma.quickReply.create({ data: body });
    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
