import { req } from '@shared';
import type { ApiData } from '@shared/types';
import type {
  SalesSummaryQuery, SalesSummaryItem,
  SalesByShopQuery, SalesByShopItem,
  SalesByProductQuery, SalesByProductItem,
  ManHourQuery, ManHourItem,
} from '../types';

export const reportService = {
  getSalesSummary: (params: SalesSummaryQuery) =>
    req.get<ApiData<SalesSummaryItem[]>>('/report/sales-summary', { params }),
  getSalesByShop: (params: SalesByShopQuery) =>
    req.get<ApiData<SalesByShopItem[]>>('/report/sales-by-shop', { params }),
  getSalesByProduct: (params: SalesByProductQuery) =>
    req.get<ApiData<SalesByProductItem[]>>('/report/sales-by-product', { params }),
  getManHour: (params: ManHourQuery) =>
    req.get<ApiData<ManHourItem[]>>('/report/man-hour', { params }),

  exportSalesSummary: (params: SalesSummaryQuery) =>
    req.get<Blob>('/report/sales-summary/export', { params, responseType: 'blob' }),
  exportSalesByShop: (params: SalesByShopQuery) =>
    req.get<Blob>('/report/sales-by-shop/export', { params, responseType: 'blob' }),
  exportSalesByProduct: (params: SalesByProductQuery) =>
    req.get<Blob>('/report/sales-by-product/export', { params, responseType: 'blob' }),
  exportManHour: (params: ManHourQuery) =>
    req.get<Blob>('/report/man-hour/export', { params, responseType: 'blob' }),
};
