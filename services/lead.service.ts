import prisma from "@/lib/prisma";
import { LEAD_STAGES } from "@/lib/constants";
import type { LeadReportDTO } from "@/lib/types";

export interface UpdateLeadInput {
  stage?: string;
  temperature?: string;
  quote?: number | null;
  assignedTo?: number | null;
  nextFollowup?: string | null;
  notes?: string | null;
  lostReason?: string | null;
  historyNote?: string;
  historyAction?: string;
  staffId?: number | null;
}

/**
 * Domain service encapsulating Lead pipeline, history, and reporting logic.
 */
export const LeadService = {
  async getById(id: number) {
    return prisma.lead.findUnique({
      where: { id },
      include: {
        staff: true,
        history: { include: { staff: true }, orderBy: { createdAt: "desc" } },
        followups: { include: { staff: true }, orderBy: { dueAt: "asc" } },
        catalogsSent: { orderBy: { sentAt: "desc" } },
      },
    });
  },

  async update(id: number, input: UpdateLeadInput) {
    const prevLead = await prisma.lead.findUnique({
      where: { id },
      select: { stage: true },
    });

    if (!prevLead) return null;

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...(input.stage !== undefined && { stage: input.stage }),
        ...(input.temperature !== undefined && { temperature: input.temperature }),
        ...(input.quote !== undefined && { quote: input.quote }),
        ...(input.assignedTo !== undefined && { assignedTo: input.assignedTo }),
        ...(input.nextFollowup !== undefined && { nextFollowup: input.nextFollowup }),
        ...(input.notes !== undefined && { notes: input.notes }),
        ...(input.lostReason !== undefined && { lostReason: input.lostReason }),
      },
      include: { staff: true },
    });

    if (input.stage && input.stage !== prevLead.stage) {
      await prisma.leadHistory.create({
        data: {
          leadId: id,
          staffId: input.staffId || null,
          action: "Stage Changed",
          note: `${prevLead.stage} -> ${input.stage}`,
        },
      });
    }

    if (input.historyNote) {
      await prisma.leadHistory.create({
        data: {
          leadId: id,
          staffId: input.staffId || null,
          action: input.historyAction || "Note Added",
          note: input.historyNote,
        },
      });
    }

    return lead;
  },

  async delete(id: number) {
    await prisma.leadCatalog.deleteMany({ where: { leadId: id } });
    await prisma.leadFollowup.deleteMany({ where: { leadId: id } });
    await prisma.leadHistory.deleteMany({ where: { leadId: id } });
    return prisma.lead.delete({ where: { id } });
  },

  async getReports(): Promise<LeadReportDTO> {
    const leads = await prisma.lead.findMany({
      include: {
        staff: { select: { id: true, name: true } },
        followups: { where: { isDone: false }, take: 1 },
      },
    });

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const today = now.toISOString().slice(0, 10);

    const stageBreakdown = LEAD_STAGES.map((stage) => {
      const matching = leads.filter((l) => l.stage === stage);
      return {
        stage,
        count: matching.length,
        value: matching.reduce((sum, l) => sum + (l.quote || 0), 0),
      };
    });

    const sourceMap: Record<string, number> = {};
    leads.forEach((l) => {
      sourceMap[l.source] = (sourceMap[l.source] || 0) + 1;
    });
    const sourceBest = Object.entries(sourceMap)
      .sort((a, b) => b[1] - a[1])
      .map(([source, count]) => ({ source, count }));

    const thisMonthLeads = leads.filter((l) => new Date(l.createdAt).toISOString() >= thisMonth);
    const thisMonthPakki = thisMonthLeads.filter((l) => l.stage === "PAKKI");
    const conversionRate =
      thisMonthLeads.length > 0
        ? Math.round((thisMonthPakki.length / thisMonthLeads.length) * 100)
        : 0;

    const [todayFollowups, overdueFollowups, staffLeads] = await Promise.all([
      prisma.leadFollowup.count({ where: { isDone: false, dueAt: { startsWith: today } } }),
      prisma.leadFollowup.count({ where: { isDone: false, dueAt: { lt: today } } }),
      prisma.staff.findMany({ include: { leads: { select: { stage: true, quote: true } } } }),
    ]);

    const staffPerf = staffLeads.map((s) => ({
      name: s.name,
      total: s.leads.length,
      pakki: s.leads.filter((l) => l.stage === "PAKKI").length,
      revenue: s.leads
        .filter((l) => l.stage === "PAKKI")
        .reduce((sum, l) => sum + (l.quote || 0), 0),
    }));

    const temperature: Record<string, number> = { Hot: 0, Warm: 0, Cold: 0 };
    leads.forEach((l) => {
      temperature[l.temperature] = (temperature[l.temperature] || 0) + 1;
    });

    const todayLeads = leads.filter(
      (l) => new Date(l.createdAt).toISOString().slice(0, 10) === today
    );

    return {
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
      temperature,
    };
  },
};
