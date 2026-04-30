export interface DashboardStats {
  todayOrders: number;
  todayItems: number;
  todayRevenue: number;
  todayCost: number;
  lowStockCount: number;
  totalProducts: number;
  totalEmployees: number;
}

export interface DailyRevenue {
  date: string;        // 'DD/MM'
  revenue: number;
  cost: number;
  orders: number;
}

export interface RecentOrder {
  id: string;
  orderNumber?: string;
  shopName?: string;
  platform?: string;
  employeeName?: string;
  totalQuantity: number;
  totalSellingPrice: number;
  status: string;
  createdAt: string;
}

export interface LowStockProduct {
  id: string;
  barcode: string;
  name: string;
  stock: number;
}
