export { InventoryPage } from './pages/InventoryPage';
export { useProducts, useProductByBarcode, useCreateProduct, useUpdateProduct, useDeleteProduct, useCreateStockEntry } from './hooks';
export { productKeys, stockEntryKeys } from './hooks';
export type { ProductParams } from './hooks';
export { inventoryService, stockEntryService } from './services';
export type { Product, CreateProductDto, UpdateProductDto, StockEntry, CreateStockEntryDto, StockEntryType } from './types';
