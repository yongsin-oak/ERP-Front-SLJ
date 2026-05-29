import type { Platform } from '../types';

export interface ShopListParams {
  page: number;
  limit: number;
  platform?: Platform;
}

export const shopKeys = {
  all: ['shops'] as const,
  lists: () => [...shopKeys.all, 'list'] as const,
  list: (params: ShopListParams) => [...shopKeys.lists(), params] as const,
  all_flat: () => [...shopKeys.all, 'all'] as const,
  detail: (id: string) => [...shopKeys.all, 'detail', id] as const,
};
