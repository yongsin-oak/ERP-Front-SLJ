import { req } from '@shared';
import type { Paginated, ApiData, CursorPage, DropdownParams, DropdownOption } from '@shared/types';
import type { Category, CategoryTreeNode, CreateCategoryDto, UpdateCategoryDto } from '../types';

const BASE = '/category';

export const categoryService = {
  getAll: (params: { page: number; limit: number; search?: string }) =>
    req.get<Paginated<Category>>(BASE, { params }),

  /** เส้นของ dropdown เท่านั้น — cursor + projection แคบ ห้ามเอาไปทำตาราง (ไม่มี total) */
  dropdownSearch: (params: DropdownParams) =>
    req.get<CursorPage<DropdownOption>>(`${BASE}/dropdown-search`, { params }),

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
