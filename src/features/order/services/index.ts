import { req } from '@lib';
import type { Order, CreateOrderDto, UpdateOrderDto } from '../types';

const BASE = '/order';

export const orderService = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    req.get<{ data: Order[]; total: number }>(BASE, { params }),

  getById: (id: string) => req.get<Order>(`${BASE}/${id}`),

  create: (data: CreateOrderDto) => req.post<Order>(BASE, data),

  update: (id: string, data: UpdateOrderDto) => req.patch<Order>(`${BASE}/${id}`, data),

  delete: (id: string) => req.delete(`${BASE}/${id}`),
};
