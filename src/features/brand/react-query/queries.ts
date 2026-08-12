import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { STALE_TIME, PAGINATION, DROPDOWN } from '@shared';
import { brandService } from './services';
import { brandKeys } from './queryKeys';
import type { BrandListParams } from './queryKeys';

/**
 * ตัวเลือกแบรนด์สำหรับ `BrandSearchSelect` — ยิง `/brand/dropdown-search` (cursor)
 * ไม่ใช่เส้นตาราง `/brand` · `pageParam` คือ `nextCursor` ทึบๆ, `undefined` = หน้าแรก
 */
export function useBrandDropdown(search?: string) {
  return useInfiniteQuery({
    queryKey: brandKeys.dropdown(search),
    queryFn: ({ pageParam }) =>
      brandService
        .dropdownSearch({ cursor: pageParam, limit: DROPDOWN.DEFAULT_LIMIT, search })
        .then((r) => r.data),
    // null = หมดลิสต์ → ต้องคืน undefined ให้ react-query ปิด hasNextPage
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
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
