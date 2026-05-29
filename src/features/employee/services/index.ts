import { req } from '@lib';
import type { Paginated, ApiData } from '@lib/apiTypes';
import type { Employee, CreateEmployeeDto, UpdateEmployeeDto, Department } from '../types';

export interface EmployeeParams {
  page: number;
  limit: number;
  search?: string;
  department?: Department;
  isActive?: boolean;
}

const BASE = '/employee';

export const employeeService = {
  getAll: (params: EmployeeParams) =>
    req.get<Paginated<Employee>>(BASE, { params }),

  getById: (id: string) =>
    req.get<ApiData<Employee>>(`${BASE}/${id}`),

  create: (data: CreateEmployeeDto) =>
    req.post<ApiData<Employee>>(BASE, data),

  update: (id: string, data: UpdateEmployeeDto) =>
    req.patch<ApiData<Employee>>(`${BASE}/${id}`, data),

  delete: (id: string) =>
    req.delete<ApiData<Employee>>(`${BASE}/${id}`),

  bulkDelete: (ids: string[]) =>
    req.delete<ApiData<Employee[]>>(`${BASE}/bulk`, { data: { ids } }),

  setPin: (id: string, pin: string) =>
    req.patch<ApiData<null>>(`${BASE}/${id}/pin`, { pin }),
};
