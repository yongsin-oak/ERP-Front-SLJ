import { req } from '@shared';
import type { Paginated, ApiData } from '@shared/types';
import type { Shop, CreateShopDto, UpdateShopDto } from '../types';
import type { ShopListParams } from './queryKeys';

const BASE = '/shop';

export const shopService = {
  getAll: (params: ShopListParams) =>
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
