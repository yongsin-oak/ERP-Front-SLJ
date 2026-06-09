import { req } from '@shared';
import type { ApiData } from '@shared/types';
import type {
  DashboardStats, DailyRevenue, RecentOrder, LowStockProduct,
  DashboardFilter, DailyRevenueFilter, RecentOrdersFilter,
} from '../types';

export const dashboardService = {
  getStats: (params?: DashboardFilter) =>
    req.get<ApiData<DashboardStats>>('/dashboard/stats', { params }),
  getDailyRevenue: (params?: DailyRevenueFilter) =>
    req.get<ApiData<DailyRevenue[]>>('/dashboard/daily-revenue', { params }),
  getRecentOrders: (params?: RecentOrdersFilter) =>
    req.get<ApiData<RecentOrder[]>>('/dashboard/recent-orders', { params }),
  getLowStock: (threshold = 5) =>
    req.get<ApiData<LowStockProduct[]>>('/dashboard/low-stock', { params: { threshold } }),
};
