import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    let customers;
    if (search) {
      customers = await prisma.customer.findMany({
        where: {
          OR: [
            { phone: { contains: search } },
            { name: { contains: search } },
          ],
        },
        orderBy: { totalKharida: "desc" },
        take: 50,
      });
    } else {
      customers = await prisma.customer.findMany({
        orderBy: { totalKharida: "desc" },
        take: 50,
      });
    }

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Customers GET error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, city, birthday, anniversary, size, pasand } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Name aur Phone zaroori hai" }, { status: 400 });
    }

    const existing = await prisma.customer.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json({ error: "Ye phone number pehle se hai" }, { status: 400 });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        city: city || null,
        birthday: birthday || null,
        anniversary: anniversary || null,
        size: size || null,
        pasand: pasand || null,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Customers POST error:", error);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
