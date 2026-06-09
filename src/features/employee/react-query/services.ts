import { req } from '@shared';
import type { Paginated, ApiData } from '@shared/types';
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

  bulkCreate: (dtos: CreateEmployeeDto[]) =>
    req.post<ApiData<Employee[]>>(`${BASE}/bulk`, { employees: dtos }),
};
