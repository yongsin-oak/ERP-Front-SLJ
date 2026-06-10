import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { STALE_TIME, PAGINATION } from '@shared';
import { inventoryService, stockEntryService, shopPriceService } from './services';
import { productKeys, stockEntryKeys, shopPriceKeys, PRODUCT_DROPDOWN_LIMIT } from './queryKeys';
import type { ProductParams, ProductDropdownSearchParams } from './queryKeys';
import type { StockEntryParams } from './services';

export function useProducts(params: ProductParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => inventoryService.getAll(params).then((r) => r.data),
    placeholderData: (prev) => prev,
    staleTime: STALE_TIME.SHORT,
  });
}

export function useStockEntries(params: StockEntryParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: stockEntryKeys.list(params),
    queryFn: () => stockEntryService.getAll(params).then((r) => r.data),
    placeholderData: (prev) => prev,
    staleTime: STALE_TIME.SHORT,
    enabled: options?.enabled !== false,
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

export function useShopPrices(barcode: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: shopPriceKeys.byProduct(barcode),
    queryFn: () => shopPriceService.getAll(barcode).then((r) => r.data.data ?? []),
    enabled: options?.enabled !== false && !!barcode,
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
    initialPageParam: PAGINATION.DEFAULT_PAGE as number,
    staleTime: STALE_TIME.SHORT,
  });
}
