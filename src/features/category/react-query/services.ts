import { req } from '@shared';
import type { Paginated, ApiData } from '@shared/types';
import type { Category, CategoryTreeNode, CreateCategoryDto, UpdateCategoryDto } from '../types';

const BASE = '/category';

export const categoryService = {
  getAll: (params: { page: number; limit: number; search?: string }) =>
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
