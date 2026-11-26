import {
  LEAD_SOURCES,
  LEAD_STAGES,
  LEAD_TEMPERATURES,
  ORDER_CHANNELS,
  ORDER_STATUSES,
  STAFF_ROLES,
} from "./constants";

export type Role = (typeof STAFF_ROLES)[number];
export type LeadStage = (typeof LEAD_STAGES)[number];
export type LeadTemperature = (typeof LEAD_TEMPERATURES)[number];
export type LeadSource = (typeof LEAD_SOURCES)[number];
export type OrderChannel = (typeof ORDER_CHANNELS)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface DashboardStats {
  todaySale: number;
  monthSale: number;
  totalCustomers: number;
  totalUdhaar: number;
  lowStockCount: number;
  todayCustomerCount?: number;
}

export interface BillCartItem {
  productId: number;
  name: string;
  size: string;
  qty: number;
  price: number;
}

export interface Alert {
  id: string;
  type: "birthday" | "inactive" | "lowstock";
  message: string;
  action: string;
  customerId?: number;
  productId?: number;
  href?: string;
}

export interface LeadReportDTO {
  totalLeads: number;
  todayLeads: number;
  todayFollowups: number;
  overdueFollowups: number;
  thisMonthLeads: number;
  thisMonthPakki: number;
  thisMonthRevenue: number;
  conversionRate: number;
  stageBreakdown: { stage: string; count: number; value: number }[];
  sourceBest: { source: string; count: number }[];
  staffPerf: { name: string; total: number; pakki: number; revenue: number }[];
  temperature: Record<string, number>;
}

export interface StaffPerformanceDTO {
  id: number;
  name: string;
  phone: string;
  role: string;
  targetMonthly: number;
  commissionPercent: number;
  monthlySale: number;
  targetPercent: number;
}

export interface ApiErrorResponse {
  error: string;
}
