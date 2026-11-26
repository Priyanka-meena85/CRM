import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { status } = body;

    const approval = await prisma.approval.update({
      where: { id },
      data: { status },
      include: { order: { include: { customer: true } } },
    });

    return NextResponse.json(approval);
  } catch (error) {
    return NextResponse.json({ error: "Approval update nahi hua" }, { status: 500 });
  }
}
