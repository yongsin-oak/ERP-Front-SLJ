import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { STALE_TIME, DROPDOWN } from '@shared';
import { employeeService } from './services';
import { employeeKeys } from './queryKeys';
import type { EmployeeListParams } from './queryKeys';

export function useEmployeeList(params: EmployeeListParams) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => employeeService.getAll(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

/**
 * ตัวเลือกพนักงานสำหรับ `EmployeeSearchSelect` — ยิง `/employee/dropdown-search` (cursor)
 * ไม่ใช่เส้นตาราง `/employee` · `pageParam` คือ `nextCursor` ทึบๆ, `undefined` = หน้าแรก
 */
export function useEmployeeDropdown(search?: string) {
  return useInfiniteQuery({
    queryKey: employeeKeys.dropdown(search),
    queryFn: ({ pageParam }) =>
      employeeService
        .dropdownSearch({ cursor: pageParam, limit: DROPDOWN.DEFAULT_LIMIT, search })
        .then((r) => r.data),
    // null = หมดลิสต์ → ต้องคืน undefined ให้ react-query ปิด hasNextPage
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: STALE_TIME.SHORT,
  });
}

export function useEmployeeDetail(id: string | null) {
  return useQuery({
    queryKey: employeeKeys.detail(id ?? ''),
    queryFn: () => employeeService.getById(id!).then((r) => r.data.data),
    enabled: !!id,
  });
}
