import { req } from '@lib';
import type { Paginated, ApiData } from '@lib/apiTypes';
import type { Product, ProductDropdown, CreateProductDto, UpdateProductDto, StockEntry, CreateStockEntryDto } from '../types';

export interface ProductParams {
  page: number;
  limit: number;
  search?: string;
  brandId?: string;
  categoryId?: string;
  isActive?: boolean;
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
