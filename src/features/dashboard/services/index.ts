import { req } from '@lib';
import type { DashboardStats, DailyRevenue, RecentOrder, LowStockProduct } from '../types';

export const dashboardService = {
  getStats: () => req.get<DashboardStats>('/dashboard/stats'),
  getDailyRevenue: (days = 7) => req.get<DailyRevenue[]>('/dashboard/daily-revenue', { params: { days } }),
  getRecentOrders: (limit = 5) => req.get<RecentOrder[]>('/dashboard/recent-orders', { params: { limit } }),
  getLowStock: (threshold = 5) => req.get<LowStockProduct[]>('/dashboard/low-stock', { params: { threshold } }),
};
