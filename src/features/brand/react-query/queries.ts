import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { STALE_TIME, PAGINATION } from '@shared';
import { brandService } from './services';
import { brandKeys } from './queryKeys';
import type { BrandListParams } from './queryKeys';

const DROPDOWN_LIMIT = 20;

export function useBrandDropdown(search?: string) {
  return useInfiniteQuery({
    queryKey: [...brandKeys.all, 'dropdown', search ?? ''],
    queryFn: ({ pageParam = 1 }) =>
      brandService.getAll({ page: pageParam as number, limit: DROPDOWN_LIMIT, search }).then((r) => r.data),
    getNextPageParam: (last) => last.pagination.hasNextPage ? last.pagination.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: STALE_TIME.SHORT,
  });
}

export function useBrands(
  params: BrandListParams = { page: PAGINATION.DEFAULT_PAGE, limit: PAGINATION.MAX_LIMIT },
) {
  return useQuery({
    queryKey: brandKeys.list(params),
    queryFn: () => brandService.getAll(params).then((r) => r.data),
    staleTime: STALE_TIME.MASTER,
    placeholderData: (prev) => prev,
  });
}
