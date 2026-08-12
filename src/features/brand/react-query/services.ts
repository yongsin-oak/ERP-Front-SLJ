import { req } from '@shared';
import type { Paginated, ApiData, CursorPage, DropdownParams, DropdownOption } from '@shared/types';
import type { Brand, CreateBrandDto, UpdateBrandDto } from '../types';

const BASE = '/brand';

export const brandService = {
  getAll: (params: { page: number; limit: number; search?: string }) =>
    req.get<Paginated<Brand>>(BASE, { params }),

  /** เส้นของ dropdown เท่านั้น — cursor + projection แคบ ห้ามเอาไปทำตาราง (ไม่มี total) */
  dropdownSearch: (params: DropdownParams) =>
    req.get<CursorPage<DropdownOption>>(`${BASE}/dropdown-search`, { params }),

  getById: (id: string) => req.get<ApiData<Brand>>(`${BASE}/${id}`),

  create: (data: CreateBrandDto) => req.post<ApiData<Brand>>(BASE, data),

  bulkCreate: (data: CreateBrandDto[]) => req.post<ApiData<Brand[]>>(`${BASE}/bulk`, data),

  update: (id: string, data: UpdateBrandDto) => req.patch<ApiData<Brand>>(`${BASE}/${id}`, data),

  delete: (id: string) => req.delete<ApiData<Brand>>(`${BASE}/${id}`),
};
