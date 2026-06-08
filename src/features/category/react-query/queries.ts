import { useQuery } from '@tanstack/react-query';
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

export function useCategoryTree() {
  return useQuery({
    queryKey: categoryKeys.tree(),
    queryFn: () => categoryService.getTree().then((r) => r.data.data),
    staleTime: STALE_TIME.MASTER,
  });
}
