import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { orderService } from '../services';
import { orderKeys } from './queryKeys';
import type { CreateOrderDto, UpdateOrderDto } from '../types';

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderDto) => orderService.create(data).then((r) => r.data),
    onSuccess: () => {
      // invalidate ทุก list — ทำให้ refetch อัตโนมัติ
      qc.invalidateQueries({ queryKey: orderKeys.lists() });
      message.success('สร้าง order สำเร็จ');
    },
    onError: () => message.error('สร้าง order ไม่สำเร็จ'),
  });
}

export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderDto }) =>
      orderService.update(id, data).then((r) => r.data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: orderKeys.lists() });
      // update cache ของ detail ด้วย — ไม่ต้อง refetch ซ้ำ
      qc.setQueryData(orderKeys.detail(updated.id), updated);
      message.success('แก้ไข order สำเร็จ');
    },
    onError: () => message.error('แก้ไข order ไม่สำเร็จ'),
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => orderService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.lists() });
      message.success('ลบ order สำเร็จ');
    },
    onError: () => message.error('ลบ order ไม่สำเร็จ'),
  });
}
