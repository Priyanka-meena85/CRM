import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    const wishlists = await prisma.wishlist.findMany({
      where: customerId ? { customerId: parseInt(customerId) } : {},
      include: { customer: true, product: { include: { stocks: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(wishlists);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, productId, size } = body;

    const item = await prisma.wishlist.create({
      data: { customerId, productId, size: size || null },
      include: { product: true, customer: true },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Wishlist add nahi hua" }, { status: 500 });
  }
}
