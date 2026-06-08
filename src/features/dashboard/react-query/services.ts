import { req } from '@shared';
import type { ApiData } from '@shared/types';
import type { DashboardStats, DailyRevenue, RecentOrder, LowStockProduct } from '../types';

export const dashboardService = {
  getStats: () => req.get<ApiData<DashboardStats>>('/dashboard/stats'),
  getDailyRevenue: (days = 7) =>
    req.get<ApiData<DailyRevenue[]>>('/dashboard/daily-revenue', { params: { days } }),
  getRecentOrders: (limit = 5) =>
    req.get<ApiData<RecentOrder[]>>('/dashboard/recent-orders', { params: { limit } }),
  getLowStock: (threshold = 5) =>
    req.get<ApiData<LowStockProduct[]>>('/dashboard/low-stock', { params: { threshold } }),
};
