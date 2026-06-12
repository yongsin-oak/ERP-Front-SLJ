import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError, notify } from '@shared';
import { productKeys } from '@features/inventory/react-query';
import { stockCountKeys } from './queryKeys';
import { stockCountService } from './services';
import type { CreateStockCountDto, UpdateStockCountItemsDto } from '../types';

export function useCreateStockCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateStockCountDto) => stockCountService.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: stockCountKeys.lists() });
      notify.success('สร้างรายการนับสต็อกสำเร็จ');
    },
    onError: handleError('สร้างรายการนับสต็อก'),
  });
}

export function useUpdateStockCountItems(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateStockCountItemsDto) => stockCountService.updateItems(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: stockCountKeys.detail(id) });
      notify.success('บันทึกจำนวนที่นับสำเร็จ');
    },
    onError: handleError('บันทึกจำนวนที่นับ'),
  });
}

export function useCompleteStockCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => stockCountService.complete(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: stockCountKeys.detail(id) });
      qc.invalidateQueries({ queryKey: stockCountKeys.lists() });
      notify.success('สิ้นสุดการนับสต็อกสำเร็จ');
    },
    onError: handleError('สิ้นสุดการนับสต็อก'),
  });
}

export function useDeleteStockCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => stockCountService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: stockCountKeys.lists() });
      notify.success('ลบรายการนับสต็อกสำเร็จ');
    },
    onError: handleError('ลบรายการนับสต็อก'),
  });
}

export function useApplyStockCountAdjustments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => stockCountService.applyAdjustments(id),
    onSuccess: (data, id) => {
      const adjusted = data.data.data?.adjusted ?? 0;
      notify.success('ปรับสต็อกสำเร็จ', `ปรับแล้ว ${adjusted} รายการ`);
      qc.invalidateQueries({ queryKey: stockCountKeys.detail(id) });
      qc.invalidateQueries({ queryKey: stockCountKeys.lists() });
      qc.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: handleError('ปรับสต็อกตามผลนับ'),
  });
}
