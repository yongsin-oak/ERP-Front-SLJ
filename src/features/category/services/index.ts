import { req } from '@lib';
import type { Paginated, ApiData } from '@lib/apiTypes';
import type { Category, CategoryTreeNode, CreateCategoryDto, UpdateCategoryDto } from '../types';

const BASE = '/category';

export const categoryService = {
  getAll: (params: { page: number; limit: number }) =>
    req.get<Paginated<Category>>(BASE, { params }),

  getTree: () => req.get<ApiData<CategoryTreeNode[]>>(`${BASE}/tree`),

  getById: (id: string) => req.get<ApiData<Category>>(`${BASE}/${id}`),

  create: (data: CreateCategoryDto) => req.post<ApiData<Category>>(BASE, data),

  update: (id: string, data: UpdateCategoryDto) =>
    req.patch<ApiData<Category>>(`${BASE}/${id}`, data),

  delete: (id: string, deleteChild = false) =>
    req.delete<ApiData<Category>>(`${BASE}/${id}`, {
      params: deleteChild ? { deleteChild: 'true' } : undefined,
    }),
};
