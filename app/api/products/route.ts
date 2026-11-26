import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        stocks: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, price, photoUrl, stocks } = body;

    const product = await prisma.product.create({
      data: {
        name,
        category,
        price,
        photoUrl: photoUrl || null,
        stocks: stocks
          ? {
              create: stocks.map((s: { size: string; quantity: number }) => ({
                size: s.size,
                quantity: s.quantity,
              })),
            }
          : undefined,
      },
      include: { stocks: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Products POST error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
