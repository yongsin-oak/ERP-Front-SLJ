import type { Department } from '../types';

export interface EmployeeListParams {
  page: number;
  limit: number;
  search?: string;
  department?: Department;
}

export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (params: EmployeeListParams) => [...employeeKeys.lists(), params] as const,
  detail: (id: string) => [...employeeKeys.all, 'detail', id] as const,
};
