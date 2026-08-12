import type { SupplierParams } from './services';

export const supplierKeys = {
  all: ['suppliers'] as const,
  lists: () => [...supplierKeys.all, 'list'] as const,
  list: (params: SupplierParams) => [...supplierKeys.lists(), params] as const,
  /** แยกจาก lists() — คนละเส้น คนละ shape (cursor) จึงต้องเป็นคนละ cache entry */
  dropdown: (search?: string) => [...supplierKeys.all, 'dropdown', search ?? ''] as const,
  detail: (id: string) => [...supplierKeys.all, 'detail', id] as const,
};

export type { SupplierParams };
