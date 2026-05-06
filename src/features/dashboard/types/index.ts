export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCost: number;
  totalProducts: number;
  totalEmployees: number;
  todayOrders: number;
  todayRevenue: number;
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
