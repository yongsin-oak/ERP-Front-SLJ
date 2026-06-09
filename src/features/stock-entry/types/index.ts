export const StockEntryTypes = {
  in:     { label: 'รับสินค้าเข้า', color: 'green' },
  return: { label: 'รับคืน',        color: 'blue' },
  adjust: { label: 'ปรับสต็อก',    color: 'orange' },
  damage: { label: 'ของเสีย',       color: 'red' },
} as const;

export type StockEntryType = keyof typeof StockEntryTypes;

export interface StockEntry {
  id: string;
  productBarcode: string;
  product?: {
    barcode: string;
    name: string;
    remaining: number;
    sellPrice?: { pack?: number; carton?: number };
  };
  type: StockEntryType;
  quantity: number;
  previousRemaining?: number;
  newRemaining?: number;
  costPricePerUnit?: number | null;
  employeeId?: string;
  employee?: { id: string; firstName: string; lastName: string; nickname: string };
  note?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateStockEntryDto {
  productBarcode: string;
  type: StockEntryType;
  quantity: number;
  costPricePerUnit?: number;
  employeeId?: string;
  note?: string;
}

export interface BulkStockEntryItem {
  productBarcode: string;
  type: StockEntryType;
  quantity: number;
  costPricePerUnit?: number;
}

export interface BulkStockEntryDto {
  employeeId?: string;
  note?: string;
  entries: BulkStockEntryItem[];
}

export interface BulkStockAdjustItem {
  productBarcode: string;
  actualQuantity: number;
}

export interface BulkStockAdjustDto {
  employeeId?: string;
  note?: string;
  adjustments: BulkStockAdjustItem[];
}

export interface BulkStockResult {
  created: { id: string; productBarcode: string; newRemaining: number }[];
  errors: unknown[];
}
