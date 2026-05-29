import { useQuery } from '@tanstack/react-query';
import { STALE_TIME } from '@lib';
import { shopService } from '../services';
import { shopKeys } from './queryKeys';
import type { ShopListParams } from './queryKeys';

/** All shops as flat array — for dropdowns/selects. Cached 10min. */
export function useShops() {
  return useQuery({
    queryKey: shopKeys.all_flat(),
    queryFn: () => shopService.getAll({ page: 1, limit: 100 }).then((r) => r.data.data),
    staleTime: STALE_TIME.MASTER,
  });
}

/** Paginated shop list — for the management table. */
export function useShopList(params: ShopListParams) {
  return useQuery({
    queryKey: shopKeys.list(params),
    queryFn: () => shopService.getAll(params).then((r) => r.data),
    staleTime: STALE_TIME.MASTER,
    placeholderData: (prev) => prev,
  });
}
