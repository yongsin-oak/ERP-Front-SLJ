import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { STALE_TIME } from '@shared';
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

export function useEmployees() {
  return useQuery({
    queryKey: [...employeeKeys.all, 'all'],
    queryFn: () => employeeService.getAll({ page: 1, limit: 100 }).then((r) => r.data.data),
    staleTime: STALE_TIME.LONG,
  });
}

const DROPDOWN_LIMIT = 20;

export function useEmployeeDropdown(search?: string) {
  return useInfiniteQuery({
    queryKey: [...employeeKeys.all, 'dropdown', search ?? ''],
    queryFn: ({ pageParam = 1 }) =>
      employeeService.getAll({ page: pageParam as number, limit: DROPDOWN_LIMIT, search }).then((r) => r.data),
    getNextPageParam: (last) => last.pagination.hasNextPage ? last.pagination.page + 1 : undefined,
    initialPageParam: 1,
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
