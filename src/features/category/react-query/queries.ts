import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { STALE_TIME, PAGINATION, DROPDOWN } from '@shared';
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

/**
 * ตัวเลือกหมวดหมู่สำหรับ `CategorySearchSelect` — ยิง `/category/dropdown-search` (cursor)
 * ไม่ใช่เส้นตาราง `/category` · `pageParam` คือ `nextCursor` ทึบๆ, `undefined` = หน้าแรก
 */
export function useCategoryDropdown(search?: string) {
  return useInfiniteQuery({
    queryKey: categoryKeys.dropdown(search),
    queryFn: ({ pageParam }) =>
      categoryService
        .dropdownSearch({ cursor: pageParam, limit: DROPDOWN.DEFAULT_LIMIT, search })
        .then((r) => r.data),
    // null = หมดลิสต์ → ต้องคืน undefined ให้ react-query ปิด hasNextPage
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
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
