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
      qc.invalidateQueries({ queryKey: shopKeys.all }); // ครอบทั้ง list + dropdown + all_flat
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
    // ไม่มี bulk-delete endpoint ฝั่ง backend — ใช้ allSettled กันลบครึ่ง ๆ กลาง ๆ แล้วรายงานผลตามจริง
    mutationFn: (ids: string[]) => Promise.allSettled(ids.map((id) => shopService.delete(id))),
    onSuccess: (results, ids) => {
      qc.invalidateQueries({ queryKey: shopKeys.all });
      const failed = results.filter((r) => r.status === 'rejected').length;
      const ok = ids.length - failed;
      if (failed === 0) notify.success('ลบร้านค้าสำเร็จ', `${ok} ร้านค้าถูกลบออกจากระบบ`);
      else if (ok === 0) notify.error('ลบร้านค้าไม่สำเร็จ', `ลบไม่สำเร็จทั้ง ${failed} รายการ`);
      else notify.warning('ลบร้านค้าสำเร็จบางส่วน', `สำเร็จ ${ok} รายการ, ล้มเหลว ${failed} รายการ`);
    },
    onError: handleError('ลบร้านค้า'),
  });
}
