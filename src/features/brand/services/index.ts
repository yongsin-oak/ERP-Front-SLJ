import { req } from '@lib';
import type { Paginated, ApiData } from '@lib/apiTypes';
import type { Brand, CreateBrandDto, UpdateBrandDto } from '../types';

const BASE = '/brand';

export const brandService = {
  getAll: (params: { page: number; limit: number }) =>
    req.get<Paginated<Brand>>(BASE, { params }),

  getById: (id: string) => req.get<ApiData<Brand>>(`${BASE}/${id}`),

  create: (data: CreateBrandDto) => req.post<ApiData<Brand>>(BASE, data),

  bulkCreate: (data: CreateBrandDto[]) => req.post<ApiData<Brand[]>>(`${BASE}/bulk`, data),

  update: (id: string, data: UpdateBrandDto) => req.patch<ApiData<Brand>>(`${BASE}/${id}`, data),

  delete: (id: string) => req.delete<ApiData<Brand>>(`${BASE}/${id}`),
};
