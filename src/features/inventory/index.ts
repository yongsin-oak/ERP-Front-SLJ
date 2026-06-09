export { InventoryPage } from './pages/InventoryPage';
export { ProductImportModal } from './components/ProductImportModal';
export { useProducts, useProductByBarcode, useCreateProduct, useUpdateProduct, useDeleteProduct, useBulkCreateProducts, useCreateStockEntry } from './react-query';
export { productKeys, stockEntryKeys } from './react-query';
export type { ProductParams } from './react-query';
export { inventoryService, stockEntryService } from './react-query';
export type { Product, CreateProductDto, UpdateProductDto, StockEntry, CreateStockEntryDto, StockEntryType } from './types';
