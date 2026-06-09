export const StockCountStatuses = {
  Draft:     { label: 'กำลังนับ', color: 'processing' },
  Completed: { label: 'สิ้นสุดแล้ว', color: 'success' },
} as const;

export type StockCountStatus = keyof typeof StockCountStatuses;

export interface StockCountProduct {
  barcode: string;
  name: string;
  brand?: { id: string; name: string } | null;
  category?: { id: string; name: string } | null;
}

export interface StockCountItem {
  id: string;
  stockCountId: string;
  productBarcode: string;
  product: StockCountProduct;
  systemQty: number;
  countedQty: number | null;
  diff: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface StockCountEmployee {
  id: string;
  firstName: string;
  nickname: string;
}

export interface StockCount {
  id: string;
  countDate: string;
  status: StockCountStatus;
  employeeId: string | null;
  employee?: StockCountEmployee | null;
  note: string | null;
  completedAt: string | null;
  items: StockCountItem[];
  totalItems?: number;
  countedItems?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStockCountDto {
  note?: string;
  employeeId?: string;
}

export interface UpdateStockCountItemsDto {
  items: Array<{ productBarcode: string; countedQty: number }>;
}
