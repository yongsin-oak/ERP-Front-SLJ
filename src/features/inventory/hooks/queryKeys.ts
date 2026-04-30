export interface ProductParams {
  page: number;
  limit: number;
  search?: string;
  brandId?: string;
  categoryId?: string;
}

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductParams) => [...productKeys.lists(), params] as const,
  detail: (barcode: string) => [...productKeys.all, 'detail', barcode] as const,
};

export const stockEntryKeys = {
  all: ['stock-entries'] as const,
  lists: () => [...stockEntryKeys.all, 'list'] as const,
  list: (params: object) => [...stockEntryKeys.lists(), params] as const,
};
