import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { STALE_TIME, PAGINATION } from '@shared';
import { categoryService } from './services';
import { categoryKeys } from './queryKeys';
import type { CategoryListParams } from './queryKeys';

export function useCategories(
  params: CategoryListParams = { page: PAGINATION.DEFAULT_PAGE, limit: PAGINATION.MAX_LIMIT },
) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoryService.getAll(params).then((r) => r.data),
    staleTime: STALE_TIME.MASTER,
    placeholderData: (prev) => prev,
  });
}

const DROPDOWN_LIMIT = 20;

export function useCategoryDropdown(search?: string) {
  return useInfiniteQuery({
    queryKey: ['categories', 'dropdown', search ?? ''],
    queryFn: ({ pageParam = 1 }) =>
      categoryService.getAll({ page: pageParam as number, limit: DROPDOWN_LIMIT, search }).then((r) => r.data),
    getNextPageParam: (last) => last.pagination.hasNextPage ? last.pagination.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: STALE_TIME.SHORT,
  });
}

export function useCategoryTree() {
  return useQuery({
    queryKey: categoryKeys.tree(),
    queryFn: () => categoryService.getTree().then((r) => r.data.data),
    staleTime: STALE_TIME.MASTER,
  });
}
