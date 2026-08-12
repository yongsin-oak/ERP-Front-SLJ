import { req, API } from '@shared';
import type { Paginated, ApiData, CursorPage, DropdownParams } from '@shared/types';
import type { Product, ProductRef, ProductDropdown, CreateProductDto, UpdateProductDto, StockEntry, CreateStockEntryDto, ShopPrice, CreateShopPriceDto, UpdateShopPriceDto } from '../types';

export interface ProductParams {
  page: number;
  limit: number;
  search?: string;
  brandId?: string;
  categoryId?: string;
  isActive?: boolean;
  lowStock?: boolean;
}

export interface StockEntryParams {
  page: number;
  limit: number;
  productBarcode?: string;
  type?: 'in' | 'return' | 'adjust';
  employeeId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const inventoryService = {
  getAll: (params: ProductParams) =>
    req.get<Paginated<Product>>(API.product.root, { params }),

  getByBarcode: (barcode: string) =>
    req.get<ApiData<Product>>(API.product.byBarcode(barcode)),

  /** barcode → { barcode, name } — ไม่ join brand/category ใช้ตอนสแกน */
  getByBarcodeRef: (barcode: string) =>
    req.get<ApiData<ProductRef>>(API.product.byBarcodeRef(barcode)),

  create: (data: CreateProductDto) =>
    req.post<ApiData<Product>>(API.product.root, data),

  update: (barcode: string, data: UpdateProductDto) =>
    req.patch<ApiData<Product>>(API.product.byBarcode(barcode), data),

  delete: (barcode: string) =>
    req.delete<ApiData<Product>>(API.product.byBarcode(barcode)),

  bulkDelete: (barcodes: string[]) =>
    req.delete<ApiData<{ deleted: Product[]; errors: unknown[] }>>(
      API.product.bulk,
      { data: { barcodes } },
    ),

  /** เส้นของ dropdown เท่านั้น — cursor + projection แคบ ห้ามเอาไปทำตาราง (ไม่มี total) */
  dropdownSearch: (params: DropdownParams = {}) =>
    req.get<CursorPage<ProductDropdown>>(API.product.dropdownSearch, { params }),

  checkExist: (barcodes: string[]) =>
    req.post<ApiData<{ existing: string[]; missing: string[] }>>(
      API.product.checkExist, { barcodes },
    ),

  bulkCreate: (dtos: CreateProductDto[]) =>
    req.post<ApiData<{ created: Product[]; errors: string[] }>>(API.product.bulk, dtos),
};

export interface BulkStockEntryDto {
  employeeId?: string;
  note?: string;
  entries: { productBarcode: string; type: 'in' | 'return' | 'adjust'; quantity: number }[];
}

export interface BulkStockAdjustDto {
  employeeId?: string;
  note?: string;
  adjustments: { productBarcode: string; actualQuantity: number }[];
}

export interface BulkStockResult {
  created: { id: string; productBarcode: string; newRemaining: number }[];
  errors: unknown[];
}

export const stockEntryService = {
  getAll: (params: StockEntryParams) =>
    req.get<Paginated<StockEntry>>(API.stockEntry.root, { params }),

  create: (data: CreateStockEntryDto) =>
    req.post<ApiData<StockEntry>>(API.stockEntry.root, data),

  bulkCreate: (data: BulkStockEntryDto) =>
    req.post<ApiData<BulkStockResult>>(API.stockEntry.bulk, data),

  bulkAdjust: (data: BulkStockAdjustDto) =>
    req.post<ApiData<BulkStockResult>>(API.stockEntry.bulkAdjust, data),
};

export const shopPriceService = {
  getAll: (barcode: string) =>
    req.get<ApiData<ShopPrice[]>>(API.product.shopPrices(barcode)),

  create: (barcode: string, body: CreateShopPriceDto) =>
    req.post<ApiData<ShopPrice>>(API.product.shopPrices(barcode), body),

  update: (barcode: string, shopId: string, body: UpdateShopPriceDto) =>
    req.patch<ApiData<ShopPrice>>(API.product.shopPrice(barcode, shopId), body),

  remove: (barcode: string, shopId: string) =>
    req.delete<ApiData<{ barcode: string; shopId: string }>>(API.product.shopPrice(barcode, shopId)),
};

export const inventoryExportService = {
  exportProducts: (params: Omit<ProductParams, 'page' | 'limit'>) =>
    req.get<Blob>(API.product.export, { params, responseType: 'blob' }),

  exportStockHistory: (params: Omit<StockEntryParams, 'page' | 'limit'>) =>
    req.get<Blob>(API.stockEntry.export, { params, responseType: 'blob' }),
};
