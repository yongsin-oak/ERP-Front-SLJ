import { req } from '@shared';
import type { Paginated, ApiData, CursorPage, DropdownParams } from '@shared/types';
import type { Employee, EmployeeOption, CreateEmployeeDto, UpdateEmployeeDto, Department } from '../types';

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

  /** เส้นของ dropdown เท่านั้น — cursor + projection แคบ ห้ามเอาไปทำตาราง (ไม่มี total) */
  dropdownSearch: (params: DropdownParams) =>
    req.get<CursorPage<EmployeeOption>>(`${BASE}/dropdown-search`, { params }),

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

  exportXlsx: (params: Omit<EmployeeParams, 'page' | 'limit'>) =>
    req.get<Blob>(`${BASE}/export`, { params, responseType: 'blob' }),
};
