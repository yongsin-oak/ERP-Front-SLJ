import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { handleError } from '@shared';
import { inventoryService, stockEntryService } from './services';
import { productKeys, stockEntryKeys } from './queryKeys';
import type { CreateProductDto, UpdateProductDto, CreateStockEntryDto } from '../types';

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductDto) =>
      inventoryService.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.lists() });
      message.success('เพิ่มสินค้าสำเร็จ');
    },
    onError: handleError('เพิ่มสินค้า'),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ barcode, data }: { barcode: string; data: UpdateProductDto }) =>
      inventoryService.update(barcode, data).then((r) => r.data.data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: productKeys.lists() });
      qc.setQueryData(productKeys.detail(updated.barcode), updated);
      message.success('แก้ไขสินค้าสำเร็จ');
    },
    onError: handleError('แก้ไขสินค้า'),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (barcode: string) => inventoryService.delete(barcode),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.lists() });
      message.success('ลบสินค้าสำเร็จ');
    },
    onError: handleError('ลบสินค้า'),
  });
}

export function useBulkDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (barcodes: string[]) =>
      inventoryService.bulkDelete(barcodes).then((r) => r.data.data),
    onSuccess: (result, barcodes) => {
      qc.invalidateQueries({ queryKey: productKeys.lists() });
      const deleted = result.deleted?.length ?? barcodes.length;
      const failed = result.errors?.length ?? 0;
      if (failed > 0) {
        message.warning(`ลบสำเร็จ ${deleted} รายการ, ล้มเหลว ${failed} รายการ`);
      } else {
        message.success(`ลบ ${deleted} รายการสำเร็จ`);
      }
    },
    onError: handleError('ลบสินค้า'),
  });
}

export function useCreateStockEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStockEntryDto) =>
      stockEntryService.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.lists() });
      qc.invalidateQueries({ queryKey: stockEntryKeys.lists() });
      message.success('บันทึกการรับสินค้าสำเร็จ');
    },
    onError: handleError('บันทึกการรับสินค้า'),
  });
}
