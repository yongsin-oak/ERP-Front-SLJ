import type { Department } from '../types';

export interface EmployeeListParams {
  page: number;
  limit: number;
  search?: string;
  department?: Department;
  isActive?: boolean;
}

export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (params: EmployeeListParams) => [...employeeKeys.lists(), params] as const,
  /** แยกจาก lists() — คนละเส้น คนละ shape (cursor) จึงต้องเป็นคนละ cache entry */
  dropdown: (search?: string) => [...employeeKeys.all, 'dropdown', search ?? ''] as const,
  detail: (id: string) => [...employeeKeys.all, 'detail', id] as const,
};
