import { req } from '@shared';
import type { Paginated, ApiData, CursorPage, DropdownParams, DropdownOption } from '@shared/types';
import type { Supplier, CreateSupplierDto, UpdateSupplierDto } from '../types';

export interface SupplierParams {
  page: number;
  limit: number;
  search?: string;
}

const BASE = '/supplier';

export const supplierService = {
  getAll: (params: SupplierParams) =>
    req.get<Paginated<Supplier>>(BASE, { params }),

  /** เส้นของ dropdown เท่านั้น — cursor + projection แคบ ห้ามเอาไปทำตาราง (ไม่มี total) */
  dropdownSearch: (params: DropdownParams) =>
    req.get<CursorPage<DropdownOption>>(`${BASE}/dropdown-search`, { params }),

  getById: (id: string) =>
    req.get<ApiData<Supplier>>(`${BASE}/${id}`),

  create: (data: CreateSupplierDto) =>
    req.post<ApiData<Supplier>>(BASE, data),

  update: (id: string, data: UpdateSupplierDto) =>
    req.patch<ApiData<Supplier>>(`${BASE}/${id}`, data),

  delete: (id: string) =>
    req.delete<ApiData<Supplier>>(`${BASE}/${id}`),

  exportXlsx: (search?: string) =>
    req.get<Blob>(`${BASE}/export`, { params: { search }, responseType: 'blob' }),
};
