import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, staffId, items, discount, paymentMethod } = body;

    if (!customerId || !staffId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Customer, Staff aur Items zaroori hai" },
        { status: 400 }
      );
    }

    // Calculate totals
    const total = items.reduce(
      (sum: number, item: { qty: number; price: number }) => sum + item.qty * item.price,
      0
    );
    const finalTotal = total - (discount || 0);

    // Get next bill number
    const lastBill = await prisma.bill.findFirst({ orderBy: { billNo: "desc" } });
    const billNo = lastBill ? lastBill.billNo + 1 : 1025;

    // Create bill
    const newBill = await prisma.bill.create({
      data: {
        billNo,
        customerId,
        staffId,
        total,
        discount: discount || 0,
        finalTotal,
        paymentMethod: paymentMethod || "Cash",
        status: "Completed",
        items: {
          create: items.map(
            (item: { productId: number; size: string; qty: number; price: number }) => ({
              productId: item.productId,
              size: item.size,
              qty: item.qty,
              price: item.price,
            })
          ),
        },
      },
      include: { items: { include: { product: true } }, customer: true },
    });

    // Update stock for each item
    for (const item of items) {
      await prisma.stock.updateMany({
        where: { productId: item.productId, size: item.size },
        data: { quantity: { decrement: item.qty } },
      });
    }

    // Update customer total and last visit
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    const newTotal = (customer?.totalKharida || 0) + finalTotal;
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        totalKharida: newTotal,
        lastVisit: new Date().toISOString(),
        isInactive: false,
        isVip: newTotal >= 50000,
      },
    });

    // If payment is Udhaar, create udhaar entry
    if (paymentMethod === "Udhaar") {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      await prisma.udhaar.create({
        data: {
          customerId,
          amount: finalTotal,
          dueDate: dueDate.toISOString(),
        },
      });
    }

    return NextResponse.json(newBill, { status: 201 });
  } catch (error) {
    console.error("Bills POST error:", error);
    return NextResponse.json({ error: "Bill nahi ban paya" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const bills = await prisma.bill.findMany({
      include: {
        customer: true,
        staff: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(bills);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bills" }, { status: 500 });
  }
}
