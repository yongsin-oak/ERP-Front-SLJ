import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { STALE_TIME, DROPDOWN } from '@shared';
import { shopService } from './services';
import { shopKeys } from './queryKeys';
import type { ShopListParams } from './queryKeys';

/** All shops as flat array — for dropdowns/selects. Cached 10min. */
/**
 * ดึงร้านค้าทั้งชุด — **ใช้เฉพาะที่ต้องรู้ทั้งเซ็ตจริงๆ เท่านั้น** ปัจจุบันมี 2 ที่:
 *   • `OrderEntryPage` จัดกลุ่มร้านตาม platform ในตัวเลือกเดียว (infinite scroll จัดกลุ่มไม่ได้)
 *   • `ShopPriceModal` ต้องรู้ว่าร้านไหนถูกตั้งราคาไปแล้วเพื่อตัดออกจากรายการ
 *
 * ห้ามเอาไปทำ dropdown ธรรมดา — ใช้ `ShopSearchSelect` (infinite + ค้นหาฝั่ง server) แทน
 * จำนวนร้านถูกจำกัดด้วยตัวธุรกิจ (หลักสิบ) จึงยอมรับ limit นี้ได้ ถ้าวันหนึ่งเกิน 100
 * ต้องเปลี่ยนสองที่ข้างบนให้ไม่พึ่งเซ็ตเต็มก่อน
 */
export function useShops() {
  return useQuery({
    queryKey: shopKeys.all_flat(),
    queryFn: () => shopService.getAll({ page: 1, limit: 100 }).then((r) => r.data.data),
    staleTime: STALE_TIME.MASTER,
  });
}

/**
 * ตัวเลือกร้านค้าสำหรับ `ShopSearchSelect` — ยิง `/shop/dropdown-search` (cursor)
 * ไม่ใช่เส้นตาราง `/shop` · `pageParam` คือ `nextCursor` ทึบๆ, `undefined` = หน้าแรก
 */
export function useShopDropdown(search?: string, options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    // dropdown ห้ามยิงตอน mount — ดูเหตุผลใน useBrandDropdown
    enabled: options?.enabled ?? true,
    queryKey: shopKeys.dropdown(search),
    queryFn: ({ pageParam }) =>
      shopService
        .dropdownSearch({ cursor: pageParam, limit: DROPDOWN.DEFAULT_LIMIT, search })
        .then((r) => r.data),
    // null = หมดลิสต์ → ต้องคืน undefined ให้ react-query ปิด hasNextPage
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: STALE_TIME.SHORT,
  });
}

/** Paginated shop list — for the management table. */
export function useShopList(params: ShopListParams) {
  return useQuery({
    queryKey: shopKeys.list(params),
    queryFn: () => shopService.getAll(params).then((r) => r.data),
    staleTime: STALE_TIME.MASTER,
    placeholderData: (prev) => prev,
  });
}
