export type Platform = 'Shopee' | 'Lazada' | 'TikTok' | 'LineOA' | 'LineMan' | 'Offline';

export const PlatformColor: Record<Platform, string> = {
  Shopee: 'orange',
  Lazada: 'blue',
  TikTok: 'purple',
  LineOA: 'green',
  LineMan: 'lime',
  Offline: 'default',
};

export const PlatformHex: Record<Platform, string> = {
  Shopee: '#ee4d2d',
  Lazada: '#0f146d',
  TikTok: '#000000',
  LineOA: '#06c755',
  LineMan: '#00b900',
  Offline: '#8c8c8c',
};

export const PLATFORM_ORDER: Platform[] = ['Shopee', 'Lazada', 'TikTok', 'LineOA', 'LineMan', 'Offline'];

export interface Shop {
  id: string;
  name: string;
  platform: Platform;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * แถวจาก `/shop/dropdown-search` — ไม่ใช่ `Shop` เต็ม
 * มี `platform` มาด้วยเพราะชื่อร้านซ้ำข้ามแพลตฟอร์มได้ (เช่น "SLJ Official" มีทั้ง Shopee และ Lazada)
 */
export interface ShopOption {
  id: string;
  name: string;
  platform: Platform;
}

export interface CreateShopDto {
  name: string;
  platform: Platform;
  description?: string;
}

export type UpdateShopDto = Partial<CreateShopDto>;
