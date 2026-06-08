export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  dailyRevenue: (days: number) => [...dashboardKeys.all, 'daily-revenue', days] as const,
  recentOrders: (limit: number) => [...dashboardKeys.all, 'recent-orders', limit] as const,
  lowStock: (threshold: number) => [...dashboardKeys.all, 'low-stock', threshold] as const,
};
