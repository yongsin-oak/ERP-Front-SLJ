/** Items per page for the dropdown-search endpoint. API max is 50. */
export const PRODUCT_DROPDOWN_LIMIT = 20;

export interface ProductParams {
  page: number;
  limit: number;
  search?: string;
  brandId?: string;
  categoryId?: string;
  isActive?: boolean;
}

export interface ProductDropdownSearchParams {
  search?: string;
  limit?: number;
}

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductParams) => [...productKeys.lists(), params] as const,
  detail: (barcode: string) => [...productKeys.all, 'detail', barcode] as const,
  dropdown: (params: ProductDropdownSearchParams) =>
    [...productKeys.all, 'dropdown', params] as const,
};

export const stockEntryKeys = {
  all: ['stock-entries'] as const,
  lists: () => [...stockEntryKeys.all, 'list'] as const,
  list: (params: object) => [...stockEntryKeys.lists(), params] as const,
};
