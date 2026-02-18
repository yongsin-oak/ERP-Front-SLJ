import { Platform } from "@features/shop/enums/Platform.enum";
import type { Timestamped } from "@types";

export interface ShopCreateDto {
  name: string;
  platform: Platform;
  description?: string;
}
export interface Shop extends ShopCreateDto, Timestamped {
  id: string;
}
