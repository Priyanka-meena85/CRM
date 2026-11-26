import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // ── Product return analytics
    const returnAnalytics = await prisma.returnAnalytic.findMany({
      include: { product: true },
      orderBy: { count: "desc" },
      take: 10,
    });

    // ── Channel breakdown
    const allOrders = await prisma.order.findMany({
      select: { channel: true, finalTotal: true, status: true, paymentMode: true },
    });

    const channelMap: Record<string, { count: number; revenue: number }> = {};
    allOrders.forEach((o) => {
      if (!channelMap[o.channel]) channelMap[o.channel] = { count: 0, revenue: 0 };
      channelMap[o.channel].count += 1;
      channelMap[o.channel].revenue += o.finalTotal;
    });

    // ── COD vs Prepaid
    const codOrders = allOrders.filter((o) => o.paymentMode === "COD").length;
    const prepaidOrders = allOrders.length - codOrders;

    // ── Return reasons breakdown
    const returns = await prisma.return.findMany({
      select: { reason: true, type: true },
    });
    const reasonMap: Record<string, number> = {};
    returns.forEach((r) => {
      reasonMap[r.reason] = (reasonMap[r.reason] || 0) + 1;
    });

    // ── High risk customers
    const highRiskCustomers = await prisma.customer.findMany({
      where: { isHighRisk: true },
      select: { id: true, name: true, phone: true, rtoRate: true, returnCount: true },
      take: 10,
    });

    // ── Best sellers
    const billItems = await prisma.billItem.groupBy({
      by: ["productId"],
      _sum: { qty: true },
      orderBy: { _sum: { qty: "desc" } },
      take: 5,
    });

    const bestSellerIds = billItems.map((b) => b.productId);
    const bestSellerProducts = await prisma.product.findMany({
      where: { id: { in: bestSellerIds } },
      include: { stocks: true },
    });
    const bestSellers = billItems.map((b) => ({
      ...bestSellerProducts.find((p) => p.id === b.productId),
      totalSold: b._sum.qty || 0,
    }));

    // ── Staff performance
    const staffPerf = await prisma.staff.findMany({
      include: {
        bills: { select: { finalTotal: true } },
        supportTickets: { select: { id: true, status: true } },
      },
    });

    return NextResponse.json({
      returnAnalytics,
      channelBreakdown: Object.entries(channelMap).map(([channel, data]) => ({
        channel,
        ...data,
      })),
      codVsPrepaid: { cod: codOrders, prepaid: prepaidOrders },
      returnReasons: Object.entries(reasonMap).map(([reason, count]) => ({ reason, count })),
      highRiskCustomers,
      bestSellers,
      staffPerformance: staffPerf.map((s) => ({
        id: s.id,
        name: s.name,
        role: s.role,
        totalSales: s.bills.reduce((sum, b) => sum + b.finalTotal, 0),
        ticketsResolved: s.supportTickets.filter((t) => t.status === "Resolved").length,
      })),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
