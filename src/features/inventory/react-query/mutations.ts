import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError, notify } from '@shared';
import { inventoryService, stockEntryService, shopPriceService } from './services';
import { productKeys, stockEntryKeys, shopPriceKeys } from './queryKeys';
import type { CreateProductDto, UpdateProductDto, CreateStockEntryDto, CreateShopPriceDto, UpdateShopPriceDto } from '../types';

export function useBulkCreateProducts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dtos: CreateProductDto[]) =>
      inventoryService.bulkCreate(dtos).then((r) => r.data.data),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: productKeys.lists() });
      const created = result.created?.length ?? 0;
      const failed = result.errors?.length ?? 0;
      if (failed > 0) {
        notify.warning(
          'นำเข้าสินค้าสำเร็จบางส่วน',
          `สำเร็จ ${created} รายการ, ข้าม/ผิดพลาด ${failed} รายการ`,
        );
      } else {
        notify.success('นำเข้าสินค้าสำเร็จ', `${created} รายการ`);
      }
    },
    onError: handleError('นำเข้าสินค้า'),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductDto) =>
      inventoryService.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.lists() });
      notify.success('เพิ่มสินค้าสำเร็จ');
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
      notify.success('แก้ไขสินค้าสำเร็จ');
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
      notify.success('ลบสินค้าสำเร็จ');
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
        notify.warning('ลบสำเร็จบางส่วน', `สำเร็จ ${deleted} รายการ, ล้มเหลว ${failed} รายการ`);
      } else {
        notify.success('ลบสำเร็จ', `${deleted} รายการ`);
      }
    },
    onError: handleError('ลบสินค้า'),
  });
}

export function useCreateShopPrice(barcode: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateShopPriceDto) => shopPriceService.create(barcode, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shopPriceKeys.byProduct(barcode) });
      notify.success('เพิ่มราคาร้านค้าสำเร็จ');
    },
    onError: handleError('เพิ่มราคาร้านค้า'),
  });
}

export function useUpdateShopPrice(barcode: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ shopId, dto }: { shopId: string; dto: UpdateShopPriceDto }) =>
      shopPriceService.update(barcode, shopId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shopPriceKeys.byProduct(barcode) });
      notify.success('แก้ไขราคาร้านค้าสำเร็จ');
    },
    onError: handleError('แก้ไขราคาร้านค้า'),
  });
}

export function useDeleteShopPrice(barcode: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (shopId: string) => shopPriceService.remove(barcode, shopId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shopPriceKeys.byProduct(barcode) });
      notify.success('ลบราคาร้านค้าสำเร็จ');
    },
    onError: handleError('ลบราคาร้านค้า'),
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
      notify.success('บันทึกการรับสินค้าสำเร็จ');
    },
    onError: handleError('บันทึกการรับสินค้า'),
  });
}
