import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { STALE_TIME } from '@shared';
import { shopService } from './services';
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

const DROPDOWN_LIMIT = 20;

export function useShopDropdown(search?: string) {
  return useInfiniteQuery({
    queryKey: [...shopKeys.all, 'dropdown', search ?? ''],
    queryFn: ({ pageParam = 1 }) =>
      shopService.getAll({ page: pageParam as number, limit: DROPDOWN_LIMIT, search }).then((r) => r.data),
    getNextPageParam: (last) => last.pagination.hasNextPage ? last.pagination.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: STALE_TIME.SHORT,
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
