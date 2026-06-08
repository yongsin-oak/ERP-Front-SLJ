import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { handleError } from '@shared';
import { brandService } from './services';
import { brandKeys } from './queryKeys';
import type { CreateBrandDto, UpdateBrandDto } from '../types';

export function useCreateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBrandDto) => brandService.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: brandKeys.all });
      message.success('เพิ่มแบรนด์สำเร็จ');
    },
    onError: handleError('เพิ่มแบรนด์'),
  });
}

export function useUpdateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBrandDto }) =>
      brandService.update(id, data).then((r) => r.data.data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: brandKeys.lists() });
      qc.setQueryData(brandKeys.detail(updated.id), updated);
      message.success('แก้ไขแบรนด์สำเร็จ');
    },
    onError: handleError('แก้ไขแบรนด์'),
  });
}

export function useDeleteBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => brandService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: brandKeys.all });
      message.success('ลบแบรนด์สำเร็จ');
    },
    onError: handleError('ลบแบรนด์'),
  });
}

export function useBulkDeleteBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => brandService.delete(id))),
    onSuccess: (_, ids) => {
      qc.invalidateQueries({ queryKey: brandKeys.all });
      message.success(`ลบ ${ids.length} แบรนด์สำเร็จ`);
    },
    onError: handleError('ลบแบรนด์'),
  });
}
