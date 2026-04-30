import { req } from '@lib';
import type { Paginated, ApiData } from '@lib/apiTypes';
import type { Shop, CreateShopDto, UpdateShopDto } from '../types';

const BASE = '/shop';

export const shopService = {
  getAll: (params?: { page?: number; limit?: number }) =>
    req.get<Paginated<Shop>>(BASE, { params }),

  getById: (id: string) =>
    req.get<ApiData<Shop>>(`${BASE}/${id}`),

  create: (data: CreateShopDto) =>
    req.post<ApiData<Shop>>(BASE, data),

  update: (id: string, data: UpdateShopDto) =>
    req.patch<ApiData<Shop>>(`${BASE}/${id}`, data),

  delete: (id: string) =>
    req.delete<ApiData<Shop>>(`${BASE}/${id}`),
};
