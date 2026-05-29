import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { STALE_TIME, PAGINATION } from '@lib';
import { inventoryService } from '../services';
import { productKeys, PRODUCT_DROPDOWN_LIMIT } from './queryKeys';
import type { ProductParams, ProductDropdownSearchParams } from './queryKeys';

export function useProducts(params: ProductParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => inventoryService.getAll(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

export function useProductByBarcode(barcode: string | null) {
  return useQuery({
    queryKey: productKeys.detail(barcode ?? ''),
    queryFn: () => inventoryService.getByBarcode(barcode!).then((r) => r.data.data),
    enabled: !!barcode,
    staleTime: STALE_TIME.SHORT,
  });
}

/**
 * Infinite-scroll query for the product dropdown-search endpoint.
 * Fetches page-by-page as the user scrolls; resets to page 1 when search changes.
 */
export function useProductDropdown(params: ProductDropdownSearchParams = {}) {
  const limit = params.limit ?? PRODUCT_DROPDOWN_LIMIT;
  return useInfiniteQuery({
    queryKey: productKeys.dropdown({ search: params.search, limit }),
    queryFn: ({ pageParam }) =>
      inventoryService
        .dropdownSearch({ search: params.search, page: pageParam, limit })
        .then((r) => r.data),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: PAGINATION.DEFAULT_PAGE,
    staleTime: STALE_TIME.SHORT,
  });
}
