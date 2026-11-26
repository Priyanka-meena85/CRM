export type Role = "OWNER" | "STAFF";

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
}
