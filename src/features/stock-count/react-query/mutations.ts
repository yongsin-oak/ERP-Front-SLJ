import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError } from '@shared';
import { stockCountKeys } from './queryKeys';
import { stockCountService } from './services';
import type { CreateStockCountDto, UpdateStockCountItemsDto } from '../types';

export function useCreateStockCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateStockCountDto) => stockCountService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: stockCountKeys.lists() }),
    onError: handleError('สร้างรายการนับสต็อก'),
  });
}

export function useUpdateStockCountItems(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateStockCountItemsDto) => stockCountService.updateItems(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: stockCountKeys.detail(id) }),
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
    },
    onError: handleError('สิ้นสุดการนับสต็อก'),
  });
}

export function useDeleteStockCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => stockCountService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: stockCountKeys.lists() }),
    onError: handleError('ลบรายการนับสต็อก'),
  });
}
