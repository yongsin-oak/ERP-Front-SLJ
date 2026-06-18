import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError, notify } from '@shared';
import { brandService } from './services';
import { brandKeys } from './queryKeys';
import type { CreateBrandDto, UpdateBrandDto } from '../types';

export function useCreateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBrandDto) => brandService.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: brandKeys.all });
      notify.success('เพิ่มแบรนด์สำเร็จ');
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
      qc.invalidateQueries({ queryKey: brandKeys.all }); // ครอบทั้ง list + dropdown
      qc.setQueryData(brandKeys.detail(updated.id), updated);
      notify.success('แก้ไขแบรนด์สำเร็จ');
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
      notify.success('ลบแบรนด์สำเร็จ');
    },
    onError: handleError('ลบแบรนด์'),
  });
}

export function useBulkDeleteBrand() {
  const qc = useQueryClient();
  return useMutation({
    // ไม่มี bulk-delete endpoint ฝั่ง backend — ใช้ allSettled กันลบครึ่ง ๆ กลาง ๆ แล้วรายงานผลตามจริง
    mutationFn: (ids: string[]) => Promise.allSettled(ids.map((id) => brandService.delete(id))),
    onSuccess: (results, ids) => {
      qc.invalidateQueries({ queryKey: brandKeys.all });
      const failed = results.filter((r) => r.status === 'rejected').length;
      const ok = ids.length - failed;
      if (failed === 0) notify.success('ลบแบรนด์สำเร็จ', `${ok} แบรนด์ถูกลบออกจากระบบ`);
      else if (ok === 0) notify.error('ลบแบรนด์ไม่สำเร็จ', `ลบไม่สำเร็จทั้ง ${failed} รายการ`);
      else notify.warning('ลบแบรนด์สำเร็จบางส่วน', `สำเร็จ ${ok} รายการ, ล้มเหลว ${failed} รายการ`);
    },
    onError: handleError('ลบแบรนด์'),
  });
}
