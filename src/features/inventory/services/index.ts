import { req } from '@lib';
import type { Paginated, ApiData } from '@lib/apiTypes';
import type { Product, CreateProductDto, UpdateProductDto, StockEntry, CreateStockEntryDto } from '../types';

export interface ProductParams {
  page: number;
  limit: number;
  search?: string;
  brandId?: string;
  categoryId?: string;
}

export interface StockEntryParams {
  page: number;
  limit: number;
  productBarcode?: string;
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

  /** Lightweight search for autocomplete/dropdown — สูงสุด 50 รายการ */
  dropdownSearch: (search?: string) =>
    req.get<ApiData<{
      barcode: string;
      name: string;
      remaining: number;
      sellPrice?: { pack?: number; carton?: number };
    }[]>>(`${BASE}/dropdown-search`, { params: { search } }),

  checkExist: (barcodes: string[]) =>
    req.post<ApiData<{ existing: string[]; missing: string[] }>>(
      `${BASE}/check-exist`, { barcodes },
    ),
};

export const stockEntryService = {
  getAll: (params: StockEntryParams) =>
    req.get<Paginated<StockEntry>>(STOCK_BASE, { params }),

  create: (data: CreateStockEntryDto) =>
    req.post<ApiData<StockEntry>>(STOCK_BASE, data),
};
