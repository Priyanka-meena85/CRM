import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Update QC status of a return
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { qcStatus, qcPhotoUrl, status, refundAmount } = body;

    const ret = await prisma.return.update({
      where: { id },
      data: {
        ...(qcStatus && { qcStatus }),
        ...(qcPhotoUrl && { qcPhotoUrl }),
        ...(status && { status }),
        ...(refundAmount !== undefined && { refundAmount }),
      },
      include: { order: { include: { customer: true } } },
    });

    return NextResponse.json(ret);
  } catch (error) {
    return NextResponse.json({ error: "QC update nahi hua" }, { status: 500 });
  }
}
