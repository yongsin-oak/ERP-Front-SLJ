/**
 * @deprecated ใช้ `DROPDOWN.DEFAULT_LIMIT` จาก `@shared` แทน — ค่าเดียวกันทุก dropdown
 * ทั้งระบบ และคู่กับ `DROPDOWN.MAX_LIMIT` ที่ตรงกับเพดานฝั่ง backend
 */
export const PRODUCT_DROPDOWN_LIMIT = 20;

export interface ProductParams {
  page: number;
  limit: number;
  search?: string;
  brandId?: string;
  categoryId?: string;
  isActive?: boolean;
  lowStock?: boolean;
}

export interface ProductDropdownSearchParams {
  search?: string;
  limit?: number;
}

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductParams) => [...productKeys.lists(), params] as const,
  detail: (barcode: string) => [...productKeys.all, 'detail', barcode] as const,
  /**
   * ref projection: barcode → { barcode, name } (GET /product/:barcode/ref)
   * แยก key จาก detail เพราะคนละ shape — useUpdateProduct เขียน Product เต็มลง detail ด้วย setQueryData
   */
  ref: (barcode: string) => [...productKeys.all, 'ref', barcode] as const,
  dropdown: (params: ProductDropdownSearchParams) =>
    [...productKeys.all, 'dropdown', params] as const,
};

export const stockEntryKeys = {
  all: ['stock-entries'] as const,
  lists: () => [...stockEntryKeys.all, 'list'] as const,
  list: (params: object) => [...stockEntryKeys.lists(), params] as const,
};

export const shopPriceKeys = {
  all: ['shop-prices'] as const,
  byProduct: (barcode: string) => [...shopPriceKeys.all, barcode] as const,
};
