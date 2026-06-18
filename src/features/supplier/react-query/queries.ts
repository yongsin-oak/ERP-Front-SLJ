import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { STALE_TIME } from '@shared';
import { supplierService } from './services';
import { supplierKeys } from './queryKeys';
import type { SupplierParams } from './queryKeys';

const DROPDOWN_LIMIT = 20;

export function useSupplierDropdown(search?: string) {
  return useInfiniteQuery({
    queryKey: [...supplierKeys.all, 'dropdown', search ?? ''],
    queryFn: ({ pageParam = 1 }) =>
      supplierService.getAll({ page: pageParam as number, limit: DROPDOWN_LIMIT, search }).then((r) => r.data),
    getNextPageParam: (last) => last.pagination.hasNextPage ? last.pagination.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: STALE_TIME.SHORT,
  });
}

export function useSuppliers(params: SupplierParams) {
  return useQuery({
    queryKey: supplierKeys.list(params),
    queryFn: () => supplierService.getAll(params).then((r) => r.data),
    placeholderData: (prev) => prev,
    staleTime: STALE_TIME.MASTER,
  });
}
