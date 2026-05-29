export interface BrandListParams {
  page: number;
  limit: number;
  search?: string;
}

export const brandKeys = {
  all: ['brands'] as const,
  lists: () => [...brandKeys.all, 'list'] as const,
  list: (params: BrandListParams) => [...brandKeys.lists(), params] as const,
  detail: (id: string) => [...brandKeys.all, 'detail', id] as const,
};
