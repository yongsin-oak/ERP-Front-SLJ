import { req } from '@shared';
import type { Paginated, ApiData, CursorPage, DropdownParams } from '@shared/types';
import type { Shop, ShopOption, CreateShopDto, UpdateShopDto } from '../types';
import type { ShopListParams } from './queryKeys';

const BASE = '/shop';

export const shopService = {
  getAll: (params: ShopListParams) =>
    req.get<Paginated<Shop>>(BASE, { params }),

  /** เส้นของ dropdown เท่านั้น — cursor + projection แคบ ห้ามเอาไปทำตาราง (ไม่มี total) */
  dropdownSearch: (params: DropdownParams) =>
    req.get<CursorPage<ShopOption>>(`${BASE}/dropdown-search`, { params }),

  getById: (id: string) =>
    req.get<ApiData<Shop>>(`${BASE}/${id}`),

  create: (data: CreateShopDto) =>
    req.post<ApiData<Shop>>(BASE, data),

  update: (id: string, data: UpdateShopDto) =>
    req.patch<ApiData<Shop>>(`${BASE}/${id}`, data),

  delete: (id: string) =>
    req.delete<ApiData<Shop>>(`${BASE}/${id}`),
};
