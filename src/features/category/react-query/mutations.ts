import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { handleError } from '@shared';
import { categoryService } from './services';
import { categoryKeys } from './queryKeys';
import type { CreateCategoryDto, UpdateCategoryDto } from '../types';

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
