import { useQuery } from '@tanstack/react-query';
import { STALE_TIME, PAGINATION } from '@shared';
import { brandService } from './services';
import { brandKeys } from './queryKeys';
import type { BrandListParams } from './queryKeys';

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
