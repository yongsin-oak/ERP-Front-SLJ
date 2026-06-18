import { useQuery } from '@tanstack/react-query';
import { STALE_TIME, REFETCH_INTERVAL } from '@shared';
import { dashboardService } from './services';
import { dashboardKeys } from './queryKeys';
import type { DashboardFilter, DailyRevenueFilter, RecentOrdersFilter } from '../types';

const DASHBOARD_OPTS = {
  staleTime: STALE_TIME.REALTIME,
  refetchOnMount: 'always' as const,
} as const;

export function useDashboardStats(filter?: DashboardFilter) {
  return useQuery({
    queryKey: dashboardKeys.stats(filter),
    queryFn: () => dashboardService.getStats(filter).then((r) => r.data.data),
    refetchInterval: REFETCH_INTERVAL.SHORT,
    placeholderData: (prev) => prev,
    ...DASHBOARD_OPTS,
  });
}

export function useDailyRevenue(filter?: DailyRevenueFilter) {
  return useQuery({
    queryKey: dashboardKeys.dailyRevenue(filter),
    queryFn: () => dashboardService.getDailyRevenue(filter).then((r) => r.data.data),
    refetchInterval: REFETCH_INTERVAL.MEDIUM,
    placeholderData: (prev) => prev,
    ...DASHBOARD_OPTS,
  });
}

export function useRecentOrders(filter?: RecentOrdersFilter) {
  return useQuery({
    queryKey: dashboardKeys.recentOrders(filter),
    queryFn: () => dashboardService.getRecentOrders(filter).then((r) => r.data.data),
    refetchInterval: REFETCH_INTERVAL.REALTIME,
    placeholderData: (prev) => prev,
    ...DASHBOARD_OPTS,
  });
}

export function useLowStock(threshold = 5) {
  return useQuery({
    queryKey: dashboardKeys.lowStock(threshold),
    queryFn: () => dashboardService.getLowStock(threshold).then((r) => r.data.data),
    refetchInterval: REFETCH_INTERVAL.MEDIUM,
    placeholderData: (prev) => prev,
    ...DASHBOARD_OPTS,
  });
}
