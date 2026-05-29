export interface CategoryListParams {
  page: number;
  limit: number;
  search?: string;
}

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (params: CategoryListParams) => [...categoryKeys.lists(), params] as const,
  tree: () => [...categoryKeys.all, 'tree'] as const,
  detail: (id: string) => [...categoryKeys.all, 'detail', id] as const,
};
