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
  sku?: string | null;
  brandId?: string;
  brand?: { id: string; name: string };
  categoryId?: string;
  category?: { id: string; name: string; parentId?: string };
  costPrice?: PriceSet;
  sellPrice?: PriceSet;
  remaining: number;
  minStock?: number;
  maxStock?: number | null;
  isActive: boolean;
  imageUrl?: string | null;
  productDimensions?: Dimensions;
  cartonDimensions?: Dimensions;
  piecesPerPack?: number;
  packPerCarton?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** Lite shape returned by GET /product/dropdown-search */
export interface ProductDropdown {
  barcode: string;
  name: string;
  remaining: number;
  sellPrice?: PriceSet;
  costPrice?: PriceSet;
}

export interface CreateProductDto {
  barcode: string;
  name: string;
  sku?: string;
  brandId?: string;
  categoryId?: string;
  /** ชื่อแบรนด์ (import) — backend จะ find-or-create ให้ */
  brandName?: string;
  /** ชื่อหมวดหมู่ (import) — backend จะ find-or-create ให้ */
  categoryName?: string;
  costPrice?: PriceSet;
  sellPrice?: PriceSet;
  remaining?: number;
  minStock?: number;
  maxStock?: number;
  isActive?: boolean;
  imageUrl?: string;
  productDimensions?: Dimensions;
  cartonDimensions?: Dimensions;
  piecesPerPack?: number;
  packPerCarton?: number;
}

export type UpdateProductDto = Partial<Omit<CreateProductDto, 'barcode'>>;

export interface ShopPrice {
  id: string;
  productBarcode: string;
  shopId: string;
  sellPrice: PriceSet;
  costPrice?: PriceSet | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateShopPriceDto {
  shopId: string;
  sellPrice: PriceSet;
  costPrice?: PriceSet;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
}

export type UpdateShopPriceDto = Partial<Omit<CreateShopPriceDto, 'shopId'>>;

export const StockEntryTypes = {
  in:     { label: 'รับสินค้าเข้า', color: 'green' },
  adjust: { label: 'ปรับสต็อก',    color: 'orange' },
  return: { label: 'รับคืน',        color: 'blue' },
} as const;

export type StockEntryType = keyof typeof StockEntryTypes;

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
