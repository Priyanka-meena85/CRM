import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      include: {
        staff: { select: { id: true, name: true } },
        followups: { where: { isDone: false }, take: 1 },
      },
    });

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const today = now.toISOString().slice(0, 10);

    // ── Stage breakdown
    const stages = ["NEW", "BAAT HUI", "QUOTE", "PAKKI", "LOST"];
    const stageBreakdown = stages.map(s => ({
      stage: s,
      count: leads.filter(l => l.stage === s).length,
      value: leads.filter(l => l.stage === s).reduce((sum, l) => sum + (l.quote || 0), 0),
    }));

    // ── Source breakdown
    const sourceMap: Record<string, number> = {};
    leads.forEach(l => { sourceMap[l.source] = (sourceMap[l.source] || 0) + 1; });
    const sourceBest = Object.entries(sourceMap).sort((a, b) => b[1] - a[1]).map(([source, count]) => ({ source, count }));

    // ── This month leads
    const thisMonthLeads = leads.filter(l => new Date(l.createdAt).toISOString() >= thisMonth);
    const thisMonthPakki = thisMonthLeads.filter(l => l.stage === "PAKKI");
    const conversionRate = thisMonthLeads.length > 0
      ? Math.round((thisMonthPakki.length / thisMonthLeads.length) * 100)
      : 0;

    // ── Today's follow-ups
    const todayFollowups = await prisma.leadFollowup.count({
      where: { isDone: false, dueAt: { startsWith: today } },
    });

    // ── Overdue follow-ups
    const overdueFollowups = await prisma.leadFollowup.count({
      where: { isDone: false, dueAt: { lt: today } },
    });

    // ── Staff performance
    const staffLeads = await prisma.staff.findMany({
      include: {
        leads: { select: { stage: true, quote: true } },
      },
    });
    const staffPerf = staffLeads.map(s => ({
      name: s.name,
      total: s.leads.length,
      pakki: s.leads.filter(l => l.stage === "PAKKI").length,
      revenue: s.leads.filter(l => l.stage === "PAKKI").reduce((sum, l) => sum + (l.quote || 0), 0),
    }));

    // ── Temperature
    const tempMap: Record<string, number> = { Hot: 0, Warm: 0, Cold: 0 };
    leads.forEach(l => { tempMap[l.temperature] = (tempMap[l.temperature] || 0) + 1; });

    // ── Today's new leads
    const todayLeads = leads.filter(l => new Date(l.createdAt).toISOString().slice(0, 10) === today);

    return NextResponse.json({
      totalLeads: leads.length,
      todayLeads: todayLeads.length,
      todayFollowups,
      overdueFollowups,
      thisMonthLeads: thisMonthLeads.length,
      thisMonthPakki: thisMonthPakki.length,
      thisMonthRevenue: thisMonthPakki.reduce((sum, l) => sum + (l.quote || 0), 0),
      conversionRate,
      stageBreakdown,
      sourceBest,
      staffPerf,
      temperature: tempMap,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
