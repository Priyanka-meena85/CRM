export const LEAD_STAGES = ["NEW", "BAAT HUI", "QUOTE", "PAKKI", "LOST"] as const;

export const LEAD_TEMPERATURES = ["Hot", "Warm", "Cold"] as const;

export const LEAD_SOURCES = [
  "Instagram",
  "Facebook",
  "WhatsApp",
  "Walk-in",
  "Call",
  "Website",
  "Reference",
] as const;

export const ORDER_CHANNELS = ["Website", "Instagram", "Offline", "WhatsApp"] as const;

export const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Returned",
  "Exchanged",
  "RTO",
] as const;

export const STAFF_ROLES = ["OWNER", "STAFF", "WAREHOUSE", "SUPPORT"] as const;

export const LEAD_STAGE_COLORS: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  "BAAT HUI": "bg-purple-50 text-purple-700 border-purple-200",
  QUOTE: "bg-yellow-50 text-yellow-700 border-yellow-200",
  PAKKI: "bg-green-50 text-green-700 border-green-200",
  LOST: "bg-red-50 text-red-700 border-red-200",
};
