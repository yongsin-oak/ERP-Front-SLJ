import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { inventoryService, stockEntryService } from '../services';
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
    onError: () => message.error('เพิ่มสินค้าไม่สำเร็จ'),
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
    onError: () => message.error('แก้ไขสินค้าไม่สำเร็จ'),
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
    onError: () => message.error('ลบสินค้าไม่สำเร็จ'),
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
    onError: () => message.error('บันทึกไม่สำเร็จ'),
  });
}
