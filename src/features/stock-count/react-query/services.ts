import { req } from '@shared';
import { downloadFile } from '@shared';
import type { Paginated, ApiData } from '@shared/types';
import type { StockCount, CreateStockCountDto, UpdateStockCountItemsDto, StockCountStatus } from '../types';

const BASE = '/stock-count';

export interface StockCountParams {
  page: number;
  limit: number;
  status?: StockCountStatus;
}

export const stockCountService = {
  getAll: (params: StockCountParams) =>
    req.get<Paginated<StockCount>>(BASE, { params }),

  getById: (id: string) =>
    req.get<ApiData<StockCount>>(`${BASE}/${id}`),

  create: (body: CreateStockCountDto) =>
    req.post<ApiData<StockCount>>(BASE, body),

  updateItems: (id: string, body: UpdateStockCountItemsDto) =>
    req.patch<ApiData<{ success: boolean }>>(`${BASE}/${id}/items`, body),

  complete: (id: string) =>
    req.post<ApiData<{ success: boolean }>>(`${BASE}/${id}/complete`),

  remove: (id: string) =>
    req.delete<ApiData<{ success: boolean }>>(`${BASE}/${id}`),

  async exportBlank(id: string) {
    const res = await req.get<Blob>(`${BASE}/${id}/export/blank`, { responseType: 'blob' });
    downloadFile(res.data as unknown as Blob, `นับสต็อก-blank-${id}.xlsx`);
  },

  async exportResult(id: string) {
    const res = await req.get<Blob>(`${BASE}/${id}/export/result`, { responseType: 'blob' });
    downloadFile(res.data as unknown as Blob, `ผลนับสต็อก-${id}.xlsx`);
  },
};
