import { useQuery } from '@tanstack/react-query';
import { supplierService } from '../services';
import { supplierKeys } from './queryKeys';
import type { SupplierParams } from './queryKeys';

export function useSuppliers(params: SupplierParams) {
  return useQuery({
    queryKey: supplierKeys.list(params),
    queryFn: () => supplierService.getAll(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}
