import type { SalesSummaryQuery, SalesByShopQuery, SalesByProductQuery, ManHourQuery } from '../types';

export const reportKeys = {
  all: ['report'] as const,
  salesSummary: (q: SalesSummaryQuery) => [...reportKeys.all, 'sales-summary', q] as const,
  salesByShop: (q: SalesByShopQuery) => [...reportKeys.all, 'sales-by-shop', q] as const,
  salesByProduct: (q: SalesByProductQuery) => [...reportKeys.all, 'sales-by-product', q] as const,
  manHour: (q: ManHourQuery) => [...reportKeys.all, 'man-hour', q] as const,
};
