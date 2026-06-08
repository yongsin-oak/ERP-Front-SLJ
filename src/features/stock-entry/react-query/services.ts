import { req } from '@shared';
import type { Paginated, ApiData } from '@shared/types';
import type { StockEntry, CreateStockEntryDto, BulkStockEntryDto, BulkStockAdjustDto, BulkStockResult } from '../types';

export interface StockEntryParams {
  page: number;
  limit: number;
  productBarcode?: string;
  type?: 'in' | 'return' | 'adjust' | 'damage';
  employeeId?: string;
  dateFrom?: string;
  dateTo?: string;
}

const BASE = '/stock-entry';

export const stockEntryService = {
  getAll: (params: StockEntryParams) =>
    req.get<Paginated<StockEntry>>(BASE, { params }),

  create: (data: CreateStockEntryDto) =>
    req.post<ApiData<StockEntry>>(BASE, data),

  bulkCreate: (data: BulkStockEntryDto) =>
    req.post<ApiData<BulkStockResult>>(`${BASE}/bulk`, data),

  bulkAdjust: (data: BulkStockAdjustDto) =>
    req.post<ApiData<BulkStockResult>>(`${BASE}/bulk-adjust`, data),
};
