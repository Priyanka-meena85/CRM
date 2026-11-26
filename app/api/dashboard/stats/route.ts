import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Today's sale
    const allBills = await prisma.bill.findMany({
      select: { finalTotal: true, createdAt: true, customerId: true },
    });

    const todayBills = allBills.filter(
      (b) => new Date(b.createdAt).toISOString().slice(0, 10) === todayStr
    );
    const todaySale = todayBills.reduce((sum, b) => sum + b.finalTotal, 0);

    const monthBills = allBills.filter(
      (b) => new Date(b.createdAt).toISOString() >= startOfMonth
    );
    const monthSale = monthBills.reduce((sum, b) => sum + b.finalTotal, 0);

    const todayCustomerIds = new Set(todayBills.map((b) => b.customerId));

    // Total customers
    const totalCustomers = await prisma.customer.count();

    // Total udhaar pending
    const pendingUdhaars = await prisma.udhaar.findMany({
      where: { status: "Pending" },
    });
    const totalUdhaar = pendingUdhaars.reduce((sum, u) => sum + u.amount, 0);

    // Low stock items
    const lowStockCount = await prisma.stock.count({
      where: { quantity: { lte: 2 } },
    });

    // Birthday alerts
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tMonth = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const tDay = String(tomorrow.getDate()).padStart(2, "0");

    const allCustomers = await prisma.customer.findMany({
      where: { birthday: { not: null } },
      select: { id: true, name: true, birthday: true },
    });

    const birthdayAlerts = allCustomers.filter((c) => {
      if (!c.birthday) return false;
      const bd = c.birthday;
      // birthday stored as ISO string, extract MM-DD
      const bdMonth = bd.slice(5, 7);
      const bdDay = bd.slice(8, 10);
      return (
        (bdMonth === month && bdDay === day) ||
        (bdMonth === tMonth && bdDay === tDay)
      );
    });

    // Inactive customers (90+ days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const inactiveCustomers = await prisma.customer.findMany({
      where: {
        OR: [
          { isInactive: true },
          { lastVisit: null },
        ],
      },
      select: { id: true, name: true, lastVisit: true },
      take: 10,
    });

    // Low stock products
    const lowStockItems = await prisma.stock.findMany({
      where: { quantity: { lte: 2 } },
      include: { product: true },
      take: 10,
    });

    return NextResponse.json({
      todaySale,
      monthSale,
      totalCustomers,
      totalUdhaar,
      lowStockCount,
      todayCustomerCount: todayCustomerIds.size,
      alerts: {
        birthdays: birthdayAlerts.map((c) => ({
          id: `bday-${c.id}`,
          type: "birthday",
          message: `${c.name} ka Birthday hai! 🎂`,
          action: "Send Offer",
          customerId: c.id,
        })),
        inactive: inactiveCustomers.map((c) => ({
          id: `inactive-${c.id}`,
          type: "inactive",
          message: `${c.name} bahut din se nahi aaya`,
          action: "Call Karo",
          customerId: c.id,
        })),
        lowStock: lowStockItems.map((s) => ({
          id: `lowstock-${s.id}`,
          type: "lowstock",
          message: `${s.product.name} ${s.size} - Sirf ${s.quantity} bacha`,
          action: "Order Karo",
          productId: s.productId,
        })),
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
