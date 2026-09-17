import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { STALE_TIME, DROPDOWN } from '@shared';
import { supplierService } from './services';
import { supplierKeys } from './queryKeys';
import type { SupplierParams } from './queryKeys';

/**
 * ตัวเลือกซัพพลายเออร์สำหรับ `SupplierSearchSelect` — ยิง `/supplier/dropdown-search` (cursor)
 * ไม่ใช่เส้นตาราง `/supplier` · `pageParam` คือ `nextCursor` ทึบๆ, `undefined` = หน้าแรก
 */
export function useSupplierDropdown(search?: string, options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    // dropdown ห้ามยิงตอน mount — ดูเหตุผลใน useBrandDropdown
    enabled: options?.enabled ?? true,
    queryKey: supplierKeys.dropdown(search),
    queryFn: ({ pageParam }) =>
      supplierService
        .dropdownSearch({ cursor: pageParam, limit: DROPDOWN.DEFAULT_LIMIT, search })
        .then((r) => r.data),
    // null = หมดลิสต์ → ต้องคืน undefined ให้ react-query ปิด hasNextPage
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
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
