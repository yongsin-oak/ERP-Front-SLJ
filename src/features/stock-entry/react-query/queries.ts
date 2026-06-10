import { useQuery } from '@tanstack/react-query';
import { STALE_TIME } from '@shared';
import { stockEntryService } from './services';
import { stockEntryKeys } from './queryKeys';
import type { StockEntryParams } from './queryKeys';

export function useStockEntries(params: StockEntryParams) {
  return useQuery({
    queryKey: stockEntryKeys.list(params),
    queryFn: () => stockEntryService.getAll(params).then((r) => r.data),
    placeholderData: (prev) => prev,
    staleTime: STALE_TIME.SHORT,
  });
}
