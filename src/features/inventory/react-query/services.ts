import { req } from '@shared';
import type { Paginated, ApiData } from '@shared/types';
import type { Product, ProductDropdown, CreateProductDto, UpdateProductDto, StockEntry, CreateStockEntryDto, ShopPrice, CreateShopPriceDto, UpdateShopPriceDto } from '../types';

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

const BASE = '/product';
const STOCK_BASE = '/stock-entry';

export const inventoryService = {
  getAll: (params: ProductParams) =>
    req.get<Paginated<Product>>(BASE, { params }),

  getByBarcode: (barcode: string) =>
    req.get<ApiData<Product>>(`${BASE}/${barcode}`),

  create: (data: CreateProductDto) =>
    req.post<ApiData<Product>>(BASE, data),

  update: (barcode: string, data: UpdateProductDto) =>
    req.patch<ApiData<Product>>(`${BASE}/${barcode}`, data),

  delete: (barcode: string) =>
    req.delete<ApiData<Product>>(`${BASE}/${barcode}`),

  bulkDelete: (barcodes: string[]) =>
    req.delete<ApiData<{ deleted: Product[]; errors: unknown[] }>>(
      `${BASE}/bulk`,
      { data: { barcodes } },
    ),

  /** Paginated lightweight search for dropdown — page/limit optional (default 1/20, max limit 50) */
  dropdownSearch: (params: { search?: string; page?: number; limit?: number } = {}) =>
    req.get<Paginated<ProductDropdown>>(`${BASE}/dropdown-search`, { params }),

  checkExist: (barcodes: string[]) =>
    req.post<ApiData<{ existing: string[]; missing: string[] }>>(
      `${BASE}/check-exist`, { barcodes },
    ),

  bulkCreate: (dtos: CreateProductDto[]) =>
    req.post<ApiData<{ created: Product[]; errors: string[] }>>(`${BASE}/bulk`, dtos),
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
    req.get<Paginated<StockEntry>>(STOCK_BASE, { params }),

  create: (data: CreateStockEntryDto) =>
    req.post<ApiData<StockEntry>>(STOCK_BASE, data),

  bulkCreate: (data: BulkStockEntryDto) =>
    req.post<ApiData<BulkStockResult>>(`${STOCK_BASE}/bulk`, data),

  bulkAdjust: (data: BulkStockAdjustDto) =>
    req.post<ApiData<BulkStockResult>>(`${STOCK_BASE}/bulk-adjust`, data),
};

export const shopPriceService = {
  getAll: (barcode: string) =>
    req.get<ApiData<ShopPrice[]>>(`${BASE}/${barcode}/shop-price`),

  create: (barcode: string, body: CreateShopPriceDto) =>
    req.post<ApiData<ShopPrice>>(`${BASE}/${barcode}/shop-price`, body),

  update: (barcode: string, shopId: string, body: UpdateShopPriceDto) =>
    req.patch<ApiData<ShopPrice>>(`${BASE}/${barcode}/shop-price/${shopId}`, body),

  remove: (barcode: string, shopId: string) =>
    req.delete<ApiData<{ barcode: string; shopId: string }>>(`${BASE}/${barcode}/shop-price/${shopId}`),
};

export const inventoryExportService = {
  exportProducts: (params: Omit<ProductParams, 'page' | 'limit'>) =>
    req.get<Blob>(`${BASE}/export`, { params, responseType: 'blob' }),

  exportStockHistory: (params: Omit<StockEntryParams, 'page' | 'limit'>) =>
    req.get<Blob>(`${STOCK_BASE}/export`, { params, responseType: 'blob' }),
};
