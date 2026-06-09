import type { DashboardFilter, DailyRevenueFilter, RecentOrdersFilter } from '../types';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: (filter?: DashboardFilter) => [...dashboardKeys.all, 'stats', filter ?? {}] as const,
  dailyRevenue: (filter?: DailyRevenueFilter) => [...dashboardKeys.all, 'daily-revenue', filter ?? {}] as const,
  recentOrders: (filter?: RecentOrdersFilter) => [...dashboardKeys.all, 'recent-orders', filter ?? {}] as const,
  lowStock: (threshold: number) => [...dashboardKeys.all, 'low-stock', threshold] as const,
};
