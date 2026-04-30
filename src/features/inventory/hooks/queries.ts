import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '../services';
import { productKeys } from './queryKeys';
import type { ProductParams } from './queryKeys';

export function useProducts(params: ProductParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => inventoryService.getAll(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

export function useProductByBarcode(barcode: string | null) {
  return useQuery({
    queryKey: productKeys.detail(barcode ?? ''),
    queryFn: () => inventoryService.getByBarcode(barcode!).then((r) => r.data.data),
    enabled: !!barcode,
    staleTime: 1000 * 30,
  });
}
