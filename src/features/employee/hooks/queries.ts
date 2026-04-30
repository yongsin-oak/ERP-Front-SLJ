import { useQuery } from '@tanstack/react-query';
import { employeeService } from '../services';
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
    staleTime: 1000 * 60 * 5,
  });
}

export function useEmployeeDetail(id: string | null) {
  return useQuery({
    queryKey: employeeKeys.detail(id ?? ''),
    queryFn: () => employeeService.getById(id!).then((r) => r.data.data),
    enabled: !!id,
  });
}
