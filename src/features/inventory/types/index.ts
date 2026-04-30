export interface PriceSet {
  pack?: number;
  carton?: number;
}

export interface Dimensions {
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
}

export interface Product {
  barcode: string;
  name: string;
  brandId?: string;
  brand?: { id: string; name: string };
  categoryId?: string;
  category?: { id: string; name: string; parentId?: string };
  costPrice?: PriceSet;
  sellPrice?: PriceSet;
  remaining: number;
  minStock?: number;
  productDimensions?: Dimensions;
  cartonDimensions?: Dimensions;
  piecesPerPack?: number;
  packPerCarton?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductDto {
  barcode: string;
  name: string;
  brandId?: string;
  categoryId?: string;
  costPrice?: PriceSet;
  sellPrice?: PriceSet;
  remaining?: number;
  minStock?: number;
  productDimensions?: Dimensions;
  cartonDimensions?: Dimensions;
  piecesPerPack?: number;
  packPerCarton?: number;
}

export type UpdateProductDto = Partial<Omit<CreateProductDto, 'barcode'>>;

export type StockEntryType = 'in' | 'adjust' | 'return';

export const StockEntryTypeLabel: Record<StockEntryType, string> = {
  in: 'รับสินค้าเข้า',
  adjust: 'ปรับสต้อค',
  return: 'รับคืน',
};

export const StockEntryTypeColor: Record<StockEntryType, string> = {
  in: 'green',
  adjust: 'orange',
  return: 'blue',
};

export interface StockEntry {
  id: string;
  productBarcode: string;
  product?: { barcode: string; name: string; remaining: number };
  type: StockEntryType;
  quantity: number;
  previousRemaining?: number;
  newRemaining?: number;
  employeeId?: string;
  employee?: { id: string; firstName: string; lastName: string; nickname: string };
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateStockEntryDto {
  productBarcode: string;
  type: StockEntryType;
  quantity: number;
  employeeId?: string;
  note?: string;
}
