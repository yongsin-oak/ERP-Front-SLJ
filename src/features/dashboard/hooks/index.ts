import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services';

const DEFAULT_OPTS = {
  refetchOnMount: 'always' as const,
  staleTime: 0,
};

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardService.getStats().then((r) => r.data.data),
    refetchInterval: 1000 * 60,
    ...DEFAULT_OPTS,
  });
}

export function useDailyRevenue(days = 7) {
  return useQuery({
    queryKey: ['dashboard', 'daily-revenue', days],
    queryFn: () => dashboardService.getDailyRevenue(days).then((r) => r.data.data),
    refetchInterval: 1000 * 60 * 5,
    ...DEFAULT_OPTS,
  });
}

export function useRecentOrders(limit = 5) {
  return useQuery({
    queryKey: ['dashboard', 'recent-orders', limit],
    queryFn: () => dashboardService.getRecentOrders(limit).then((r) => r.data.data),
    refetchInterval: 1000 * 30,
    ...DEFAULT_OPTS,
  });
}

export function useLowStock(threshold = 5) {
  return useQuery({
    queryKey: ['dashboard', 'low-stock', threshold],
    queryFn: () => dashboardService.getLowStock(threshold).then((r) => r.data.data),
    refetchInterval: 1000 * 60 * 5,
    ...DEFAULT_OPTS,
  });
}
