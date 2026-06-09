import { useQuery } from '@tanstack/react-query';
import { STALE_TIME } from '@shared';
import { stockCountKeys } from './queryKeys';
import { stockCountService } from './services';
import type { StockCountParams } from './services';

export function useStockCounts(params: StockCountParams) {
  return useQuery({
    queryKey: stockCountKeys.list(params as unknown as Record<string, unknown>),
    queryFn: () => stockCountService.getAll(params).then((r) => r.data),
    placeholderData: (prev) => prev,
    staleTime: STALE_TIME.SHORT,
  });
}

export function useStockCount(id: string) {
  return useQuery({
    queryKey: stockCountKeys.detail(id),
    queryFn: () => stockCountService.getById(id).then((r) => r.data),
    staleTime: STALE_TIME.SHORT,
    enabled: !!id,
  });
}
