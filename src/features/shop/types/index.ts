export type Platform = 'Shopee' | 'Lazada' | 'TikTok';

export const PlatformColor: Record<Platform, string> = {
  Shopee: 'orange',
  Lazada: 'blue',
  TikTok: 'purple',
};

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
