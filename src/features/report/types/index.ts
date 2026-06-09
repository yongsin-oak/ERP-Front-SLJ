export const REPORT_GROUP_BY = {
  DAY: 'day' as const,
  WEEK: 'week' as const,
  MONTH: 'month' as const,
};
export type ReportGroupBy = typeof REPORT_GROUP_BY[keyof typeof REPORT_GROUP_BY];

export interface SalesSummaryQuery {
  dateFrom: string;
  dateTo: string;
  shopId?: string;
  groupBy?: ReportGroupBy;
}

export interface SalesByShopQuery {
  dateFrom: string;
  dateTo: string;
}

export interface SalesByProductQuery {
  dateFrom: string;
  dateTo: string;
  shopId?: string;
  categoryId?: string;
  brandId?: string;
}

export interface ManHourQuery {
  dateFrom: string;
  dateTo: string;
  employeeId?: string;
}

export interface SalesSummaryItem {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
  orderCount: number;
}

export interface SalesByShopItem {
  shopId: string;
  shopName: string;
  platform: string;
  revenue: number;
  cost: number;
  orderCount: number;
}

export interface SalesByProductItem {
  barcode: string;
  name: string;
  quantityPack: number;
  quantityCarton: number;
  revenue: number;
  cost: number;
  profit: number;
}

export interface ManHourItem {
  employeeId: string;
  name: string;
  orderCount: number;
  totalMinutes: number;
  avgMinutesPerOrder: number;
}
