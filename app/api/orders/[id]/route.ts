import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { status, trackingId, courier, trackingStatus, codVerified } = body;

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(trackingId && { trackingId }),
        ...(courier && { courier }),
        ...(trackingStatus && { trackingStatus }),
        ...(codVerified !== undefined && { codVerified }),
      },
      include: { customer: true, items: { include: { product: true } } },
    });

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: "Order update nahi hua" }, { status: 500 });
  }
}
