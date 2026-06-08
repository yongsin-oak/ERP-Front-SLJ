import { useQuery } from '@tanstack/react-query';
import { STALE_TIME, REFETCH_INTERVAL } from '@shared';
import { dashboardService } from './services';
import { dashboardKeys } from './queryKeys';

const DASHBOARD_OPTS = {
  staleTime: STALE_TIME.REALTIME,
  refetchOnMount: 'always' as const,
} as const;

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardService.getStats().then((r) => r.data.data),
    refetchInterval: REFETCH_INTERVAL.SHORT,
    ...DASHBOARD_OPTS,
  });
}

export function useDailyRevenue(days = 7) {
  return useQuery({
    queryKey: dashboardKeys.dailyRevenue(days),
    queryFn: () => dashboardService.getDailyRevenue(days).then((r) => r.data.data),
    refetchInterval: REFETCH_INTERVAL.MEDIUM,
    ...DASHBOARD_OPTS,
  });
}

export function useRecentOrders(limit = 5) {
  return useQuery({
    queryKey: dashboardKeys.recentOrders(limit),
    queryFn: () => dashboardService.getRecentOrders(limit).then((r) => r.data.data),
    refetchInterval: REFETCH_INTERVAL.REALTIME,
    ...DASHBOARD_OPTS,
  });
}

export function useLowStock(threshold = 5) {
  return useQuery({
    queryKey: dashboardKeys.lowStock(threshold),
    queryFn: () => dashboardService.getLowStock(threshold).then((r) => r.data.data),
    refetchInterval: REFETCH_INTERVAL.MEDIUM,
    ...DASHBOARD_OPTS,
  });
}
