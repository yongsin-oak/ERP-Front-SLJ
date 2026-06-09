import { useQuery } from '@tanstack/react-query';
import { STALE_TIME } from '@shared';
import { reportService } from './services';
import { reportKeys } from './queryKeys';
import type { SalesSummaryQuery, SalesByShopQuery, SalesByProductQuery, ManHourQuery } from '../types';

export function useSalesSummary(query: SalesSummaryQuery) {
  return useQuery({
    queryKey: reportKeys.salesSummary(query),
    queryFn: () => reportService.getSalesSummary(query).then((r) => r.data.data),
    staleTime: STALE_TIME.MEDIUM,
    placeholderData: (prev) => prev,
    enabled: !!query.dateFrom && !!query.dateTo,
  });
}

export function useSalesByShop(query: SalesByShopQuery) {
  return useQuery({
    queryKey: reportKeys.salesByShop(query),
    queryFn: () => reportService.getSalesByShop(query).then((r) => r.data.data),
    staleTime: STALE_TIME.MEDIUM,
    placeholderData: (prev) => prev,
    enabled: !!query.dateFrom && !!query.dateTo,
  });
}

export function useSalesByProduct(query: SalesByProductQuery) {
  return useQuery({
    queryKey: reportKeys.salesByProduct(query),
    queryFn: () => reportService.getSalesByProduct(query).then((r) => r.data.data),
    staleTime: STALE_TIME.MEDIUM,
    placeholderData: (prev) => prev,
    enabled: !!query.dateFrom && !!query.dateTo,
  });
}

export function useManHour(query: ManHourQuery) {
  return useQuery({
    queryKey: reportKeys.manHour(query),
    queryFn: () => reportService.getManHour(query).then((r) => r.data.data),
    staleTime: STALE_TIME.MEDIUM,
    placeholderData: (prev) => prev,
    enabled: !!query.dateFrom && !!query.dateTo,
  });
}
