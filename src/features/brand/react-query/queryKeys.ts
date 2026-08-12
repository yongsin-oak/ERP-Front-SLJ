export interface BrandListParams {
  page: number;
  limit: number;
  search?: string;
}

export const brandKeys = {
  all: ['brands'] as const,
  lists: () => [...brandKeys.all, 'list'] as const,
  list: (params: BrandListParams) => [...brandKeys.lists(), params] as const,
  /** แยกจาก lists() — คนละเส้น คนละ shape (cursor) จึงต้องเป็นคนละ cache entry */
  dropdown: (search?: string) => [...brandKeys.all, 'dropdown', search ?? ''] as const,
  detail: (id: string) => [...brandKeys.all, 'detail', id] as const,
};
