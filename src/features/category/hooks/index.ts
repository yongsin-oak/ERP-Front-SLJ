import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { handleError } from '@lib';
import { categoryService } from '../services';
import type { CreateCategoryDto, UpdateCategoryDto } from '../types';

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (params: object) => [...categoryKeys.lists(), params] as const,
  tree: () => [...categoryKeys.all, 'tree'] as const,
  detail: (id: string) => [...categoryKeys.all, 'detail', id] as const,
};

export function useCategories(params: { page: number; limit: number } = { page: 1, limit: 200 }) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoryService.getAll(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

export function useCategoryTree() {
  return useQuery({
    queryKey: categoryKeys.tree(),
    queryFn: () => categoryService.getTree().then((r) => r.data.data),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryDto) => categoryService.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.all });
      message.success('เพิ่มหมวดหมู่สำเร็จ');
    },
    onError: handleError('เพิ่มหมวดหมู่'),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) =>
      categoryService.update(id, data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.all });
      message.success('แก้ไขหมวดหมู่สำเร็จ');
    },
    onError: handleError('แก้ไขหมวดหมู่'),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, deleteChild }: { id: string; deleteChild?: boolean }) =>
      categoryService.delete(id, deleteChild),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.all });
      message.success('ลบหมวดหมู่สำเร็จ');
    },
    onError: handleError('ลบหมวดหมู่'),
  });
}
