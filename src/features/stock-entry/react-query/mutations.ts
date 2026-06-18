import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError, notify } from '@shared';
import { productKeys } from '@features/inventory';
import { stockEntryService } from './services';
import { stockEntryKeys } from './queryKeys';
import type { CreateStockEntryDto, BulkStockEntryDto, BulkStockAdjustDto } from '../types';

export function useCreateStockEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStockEntryDto) =>
      stockEntryService.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: stockEntryKeys.lists() });
      qc.invalidateQueries({ queryKey: productKeys.all });
      notify.success('บันทึกรายการสำเร็จ');
    },
    onError: handleError('บันทึกรายการ'),
  });
}

export function useBulkCreateStockEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkStockEntryDto) =>
      stockEntryService.bulkCreate(data).then((r) => r.data.data),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: stockEntryKeys.lists() });
      qc.invalidateQueries({ queryKey: productKeys.all });
      const created = result.created?.length ?? 0;
      const failed = result.errors?.length ?? 0;
      if (failed > 0) {
        notify.warning('รับสินค้าสำเร็จบางส่วน', `สำเร็จ ${created} รายการ, ล้มเหลว ${failed} รายการ`);
      } else {
        notify.success('รับสินค้าสำเร็จ', `${created} รายการ`);
      }
    },
    onError: handleError('รับสินค้าเข้า'),
  });
}

export function useBulkDamage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkStockEntryDto) =>
      stockEntryService.bulkCreate(data).then((r) => r.data.data),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: stockEntryKeys.lists() });
      qc.invalidateQueries({ queryKey: productKeys.all });
      const created = result.created?.length ?? 0;
      const failed = result.errors?.length ?? 0;
      if (failed > 0) {
        notify.warning('บันทึกของเสียสำเร็จบางส่วน', `สำเร็จ ${created} รายการ, ล้มเหลว ${failed} รายการ`);
      } else {
        notify.success('บันทึกของเสียสำเร็จ', `${created} รายการ`);
      }
    },
    onError: handleError('บันทึกของเสีย'),
  });
}

export function useBulkAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkStockAdjustDto) =>
      stockEntryService.bulkAdjust(data).then((r) => r.data.data),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: stockEntryKeys.lists() });
      qc.invalidateQueries({ queryKey: productKeys.all });
      const created = result.created?.length ?? 0;
      const failed = result.errors?.length ?? 0;
      if (failed > 0) {
        notify.warning('ปรับสต็อกสำเร็จบางส่วน', `สำเร็จ ${created} รายการ, ล้มเหลว ${failed} รายการ`);
      } else {
        notify.success('ปรับสต็อกสำเร็จ', `${created} รายการ`);
      }
    },
    onError: handleError('ปรับสต็อก'),
  });
}
