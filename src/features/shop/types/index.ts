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

export interface CreateShopDto {
  name: string;
  platform: Platform;
  description?: string;
}

export type UpdateShopDto = Partial<CreateShopDto>;
