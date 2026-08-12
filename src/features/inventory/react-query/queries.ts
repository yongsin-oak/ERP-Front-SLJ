import { useQuery, useInfiniteQuery, queryOptions } from '@tanstack/react-query';
import { STALE_TIME, DROPDOWN } from '@shared';
import { inventoryService, stockEntryService, shopPriceService } from './services';
import { productKeys, stockEntryKeys, shopPriceKeys } from './queryKeys';
import type { ProductParams, ProductDropdownSearchParams } from './queryKeys';
import type { StockEntryParams } from './services';

export function useProducts(params: ProductParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => inventoryService.getAll(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

/**
 * ref projection ของสินค้า: barcode → { barcode, name } (GET /product/:barcode/ref)
 * ใช้แบบ imperative: `queryClient.fetchQuery(productRefQuery(barcode))` ตอนสแกน
 *
 * ใช้ key `ref` แยกจาก `detail` เพราะคนละ shape — useUpdateProduct เขียน Product เต็ม
 * ลง `detail` ด้วย setQueryData ถ้าใช้ key ร่วมกันจะได้ข้อมูลผิดรูป
 */
export function productRefQuery(barcode: string) {
  return queryOptions({
    queryKey: productKeys.ref(barcode),
    queryFn: () => inventoryService.getByBarcodeRef(barcode).then((r) => r.data.data),
    staleTime: STALE_TIME.SHORT,
    // ผู้เรียกแสดงข้อความเจาะจงเอง ("ไม่พบสินค้า barcode: X") — กัน toast ซ้ำจาก global handler
    meta: { skipGlobalError: true },
  });
}

/** สินค้าเต็มรูปจาก barcode — ใช้เมื่อต้องการ brand/category/ราคา/สต็อก */
export function useProductByBarcode(barcode: string | null) {
  return useQuery({
    queryKey: productKeys.detail(barcode ?? ''),
    queryFn: () => inventoryService.getByBarcode(barcode!).then((r) => r.data.data),
    enabled: !!barcode,
    staleTime: STALE_TIME.SHORT,
  });
}

export function useShopPrices(barcode: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: shopPriceKeys.byProduct(barcode),
    queryFn: () => shopPriceService.getAll(barcode).then((r) => r.data.data ?? []),
    enabled: options?.enabled !== false && !!barcode,
    staleTime: STALE_TIME.SHORT,
  });
}

export function useStockEntries(params: StockEntryParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: stockEntryKeys.list(params),
    queryFn: () => stockEntryService.getAll(params).then((r) => r.data),
    enabled: options?.enabled !== false,
    placeholderData: (prev) => prev,
    staleTime: STALE_TIME.SHORT,
  });
}

/**
 * ตัวเลือกสินค้าสำหรับ `ProductDropdownSelect` — ยิง `/product/dropdown-search` (cursor)
 * ไม่ใช่เส้นตาราง `/product` · `pageParam` คือ `nextCursor` ทึบๆ, `undefined` = หน้าแรก
 *
 * ผลเรียงตามชื่อ ไม่ใช่ตามความเข้ากันของคำค้น — cursor ต่อจากคีย์ `(name, barcode)` ได้
 * อย่างเดียว การยิงบาร์โค้ดตรงๆ ใช้ `ScanInput` → `productRefQuery` ซึ่งไม่ผ่านเส้นนี้
 */
export function useProductDropdown(params: ProductDropdownSearchParams = {}) {
  const limit = params.limit ?? DROPDOWN.DEFAULT_LIMIT;
  return useInfiniteQuery({
    queryKey: productKeys.dropdown({ search: params.search, limit }),
    queryFn: ({ pageParam }) =>
      inventoryService
        .dropdownSearch({ search: params.search, cursor: pageParam, limit })
        .then((r) => r.data),
    // null = หมดลิสต์ → ต้องคืน undefined ให้ react-query ปิด hasNextPage
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: STALE_TIME.SHORT,
  });
}
