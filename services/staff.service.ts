import prisma from "@/lib/prisma";
import type { StaffPerformanceDTO } from "@/lib/types";

export interface CreateStaffInput {
  name: string;
  phone: string;
  role?: string;
  targetMonthly?: number;
  commissionPercent?: number;
}

/**
 * Domain service for team members, targets, and sales performance.
 */
export const StaffService = {
  async listWithPerformance(): Promise<StaffPerformanceDTO[]> {
    const staff = await prisma.staff.findMany({
      include: { bills: { select: { finalTotal: true } } },
    });

    return staff.map((s) => {
      const monthlySale = s.bills.reduce((sum, b) => sum + b.finalTotal, 0);
      return {
        id: s.id,
        name: s.name,
        phone: s.phone,
        role: s.role,
        targetMonthly: s.targetMonthly,
        commissionPercent: s.commissionPercent,
        monthlySale,
        targetPercent:
          s.targetMonthly > 0 ? Math.round((monthlySale / s.targetMonthly) * 100) : 0,
      };
    });
  },

  async create(input: CreateStaffInput) {
    return prisma.staff.create({
      data: {
        name: input.name.trim(),
        phone: input.phone.trim(),
        role: input.role || "STAFF",
        targetMonthly: Number(input.targetMonthly) || 50000,
        commissionPercent: Number(input.commissionPercent) || 2,
      },
    });
  },
};
