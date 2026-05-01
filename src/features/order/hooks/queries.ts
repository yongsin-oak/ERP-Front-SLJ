import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services';
import { orderKeys } from './queryKeys';
import type { OrderParams } from './queryKeys';

export function useOrders(params: OrderParams = {}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => orderService.getAll(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

export function useOrderDetail(id: string | null) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? ''),
    queryFn: () => orderService.getById(id!).then((r) => r.data.data),
    enabled: !!id,
  });
}
