import { req, API } from '@shared';
import type { Paginated, ApiData } from '@shared/types';
import type { Order, CreateOrderDto, UpdateOrderDto } from '../types';
import type { OrderParams } from './queryKeys';

export const orderService = {
  getAll: (params?: OrderParams) =>
    req.get<Paginated<Order>>(API.order.root, { params }),

  getById: (id: string) => req.get<ApiData<Order>>(API.order.byId(id)),

  create: (data: CreateOrderDto) => req.post<ApiData<Order>>(API.order.root, data),

  update: (id: string, data: UpdateOrderDto) =>
    req.patch<ApiData<Order>>(API.order.byId(id), data),

  delete: (id: string) => req.delete<ApiData<Order>>(API.order.byId(id)),

  bulkDelete: (ids: string[]) =>
    req.delete<ApiData<{ deleted: string[]; errors: string[] }>>(API.order.bulk, { data: { ids } }),

  checkExist: (ids: string[]) =>
    req.post<ApiData<{ existing: string[]; missing: string[] }>>(API.order.checkExist, { ids }),

  exportXlsx: (params: Omit<OrderParams, 'page' | 'limit'>) =>
    req.get<Blob>(API.order.export, { params, responseType: 'blob' }),
};
