import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { handleError } from '@lib';
import { orderService } from '../services';
import { orderKeys } from './queryKeys';
import type { CreateOrderDto, UpdateOrderDto } from '../types';

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderDto) => orderService.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.lists() });
      message.success('สร้าง Order สำเร็จ');
    },
    onError: handleError('สร้าง Order'),
  });
}

export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderDto }) =>
      orderService.update(id, data).then((r) => r.data.data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: orderKeys.lists() });
      qc.setQueryData(orderKeys.detail(updated.id), updated);
      message.success('แก้ไข Order สำเร็จ');
    },
    onError: handleError('แก้ไข Order'),
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => orderService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.lists() });
      message.success('ลบ Order สำเร็จ');
    },
    onError: handleError('ลบ Order'),
  });
}

export function useBulkDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => orderService.bulkDelete(ids).then((r) => r.data.data),
    onSuccess: (result, ids) => {
      qc.invalidateQueries({ queryKey: orderKeys.lists() });
      const deleted = result.deleted?.length ?? 0;
      const failed = result.errors?.length ?? Math.max(0, ids.length - deleted);
      if (failed > 0) {
        message.warning(`ลบสำเร็จ ${deleted} / ล้มเหลว ${failed} รายการ`);
      } else {
        message.success(`ลบ ${deleted} รายการสำเร็จ`);
      }
    },
    onError: handleError('ลบ Order'),
  });
}
