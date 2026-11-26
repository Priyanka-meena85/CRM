import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    let stocks;
    if (search) {
      // Get products matching search, then get their stocks
      const products = await prisma.product.findMany({
        where: { name: { contains: search } },
        select: { id: true },
      });
      const productIds = products.map((p) => p.id);
      stocks = await prisma.stock.findMany({
        where: { productId: { in: productIds } },
        include: { product: true },
        orderBy: { quantity: "asc" },
      });
    } else {
      stocks = await prisma.stock.findMany({
        include: { product: true },
        orderBy: { quantity: "asc" },
      });
    }

    return NextResponse.json(stocks);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stock" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stockId, quantity } = body;

    if (stockId) {
      const stock = await prisma.stock.update({
        where: { id: stockId },
        data: { quantity: { increment: quantity } },
        include: { product: true },
      });
      return NextResponse.json(stock);
    }

    return NextResponse.json({ error: "stockId zaroori hai" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Stock update nahi hua" }, { status: 500 });
  }
}
