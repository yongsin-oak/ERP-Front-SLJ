import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardService.getStats().then((r) => r.data),
    refetchInterval: 1000 * 60, // auto-refresh ทุก 1 นาที
  });
}

export function useDailyRevenue(days = 7) {
  return useQuery({
    queryKey: ['dashboard', 'daily-revenue', days],
    queryFn: () => dashboardService.getDailyRevenue(days).then((r) => r.data),
    refetchInterval: 1000 * 60 * 5,
  });
}

export function useRecentOrders(limit = 5) {
  return useQuery({
    queryKey: ['dashboard', 'recent-orders', limit],
    queryFn: () => dashboardService.getRecentOrders(limit).then((r) => r.data),
    refetchInterval: 1000 * 30, // refresh บ่อยกว่า — เห็นออเดอร์ใหม่เร็ว
  });
}

export function useLowStock(threshold = 5) {
  return useQuery({
    queryKey: ['dashboard', 'low-stock', threshold],
    queryFn: () => dashboardService.getLowStock(threshold).then((r) => r.data),
    refetchInterval: 1000 * 60 * 5,
  });
}
