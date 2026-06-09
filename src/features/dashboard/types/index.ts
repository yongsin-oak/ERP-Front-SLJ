export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCost: number;
  totalProducts: number;
  totalEmployees: number;
  todayOrders: number;
  todayRevenue: number;
  todayCost: number;
  lowStockCount: number;
}

export interface DashboardFilter {
  shopId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DailyRevenueFilter {
  days?: number;
  shopId?: string;
}

export interface RecentOrdersFilter {
  limit?: number;
  shopId?: string;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  cost: number;
}

export interface RecentOrder {
  id: string;
  shopName?: string;
  platform?: string;
  totalPrice: number;
  createdAt: string;
}

export interface LowStockProduct {
  barcode: string;
  name: string;
  remaining: number;
  minStock?: number;
}
