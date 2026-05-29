import { req } from '@lib';
import type { Paginated, ApiData } from '@lib/apiTypes';
import type { Order, CreateOrderDto, UpdateOrderDto } from '../types';
import type { OrderParams } from '../hooks/queryKeys';

const BASE = '/order';

export const orderService = {
  getAll: (params?: OrderParams) =>
    req.get<Paginated<Order>>(BASE, { params }),

  getById: (id: string) => req.get<ApiData<Order>>(`${BASE}/${id}`),

  create: (data: CreateOrderDto) => req.post<ApiData<Order>>(BASE, data),

  update: (id: string, data: UpdateOrderDto) =>
    req.patch<ApiData<Order>>(`${BASE}/${id}`, data),

  delete: (id: string) => req.delete<ApiData<Order>>(`${BASE}/${id}`),

  bulkDelete: (ids: string[]) =>
    req.delete<ApiData<string[]>>(`${BASE}/bulk`, { data: { ids } }),

  checkExist: (ids: string[]) =>
    req.post<ApiData<{ existing: string[]; missing: string[] }>>(`${BASE}/check-exist`, { ids }),
};
