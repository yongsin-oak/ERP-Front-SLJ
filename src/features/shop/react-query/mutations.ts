import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError, notify } from '@shared';
import { shopService } from './services';
import { shopKeys } from './queryKeys';
import type { CreateShopDto, UpdateShopDto } from '../types';

export function useCreateShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateShopDto) => shopService.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shopKeys.all });
      notify.success('เพิ่มร้านค้าสำเร็จ');
    },
    onError: handleError('เพิ่มร้านค้า'),
  });
}

export function useUpdateShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateShopDto }) =>
      shopService.update(id, data).then((r) => r.data.data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: shopKeys.lists() });
      qc.invalidateQueries({ queryKey: shopKeys.all_flat() });
      qc.setQueryData(shopKeys.detail(updated.id), updated);
      notify.success('แก้ไขร้านค้าสำเร็จ');
    },
    onError: handleError('แก้ไขร้านค้า'),
  });
}

export function useDeleteShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shopService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shopKeys.all });
      notify.success('ลบร้านค้าสำเร็จ');
    },
    onError: handleError('ลบร้านค้า'),
  });
}

export function useBulkDeleteShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => shopService.delete(id))),
    onSuccess: (_, ids) => {
      qc.invalidateQueries({ queryKey: shopKeys.all });
      notify.success('ลบร้านค้าสำเร็จ', `${ids.length} ร้านค้าถูกลบออกจากระบบ`);
    },
    onError: handleError('ลบร้านค้า'),
  });
}
