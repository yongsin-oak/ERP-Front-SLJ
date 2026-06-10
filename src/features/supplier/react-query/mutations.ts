import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError, notify } from '@shared';
import { supplierService } from './services';
import { supplierKeys } from './queryKeys';
import type { CreateSupplierDto, UpdateSupplierDto } from '../types';

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSupplierDto) =>
      supplierService.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: supplierKeys.lists() });
      notify.success('เพิ่มซัพพลายเออร์สำเร็จ');
    },
    onError: handleError('เพิ่มซัพพลายเออร์'),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupplierDto }) =>
      supplierService.update(id, data).then((r) => r.data.data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: supplierKeys.lists() });
      qc.setQueryData(supplierKeys.detail(updated.id), updated);
      notify.success('แก้ไขซัพพลายเออร์สำเร็จ');
    },
    onError: handleError('แก้ไขซัพพลายเออร์'),
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => supplierService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: supplierKeys.lists() });
      notify.success('ลบซัพพลายเออร์สำเร็จ');
    },
    onError: handleError('ลบซัพพลายเออร์'),
  });
}
