export { useProducts, useProductByBarcode, useProductDropdown } from './queries';
export {
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useBulkDeleteProduct,
  useCreateStockEntry,
} from './mutations';
export { productKeys, stockEntryKeys, PRODUCT_DROPDOWN_LIMIT } from './queryKeys';
export type { ProductParams, ProductDropdownSearchParams } from './queryKeys';
export { inventoryService, stockEntryService } from './services';
export type { ProductParams, StockEntryParams, BulkStockEntryDto, BulkStockAdjustDto, BulkStockResult } from './services';
