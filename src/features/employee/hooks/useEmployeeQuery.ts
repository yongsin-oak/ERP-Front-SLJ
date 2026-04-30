import { useQuery } from '@tanstack/react-query';
import { employeeService } from '../services';

export function useEmployeeList() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getAll().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });
}
