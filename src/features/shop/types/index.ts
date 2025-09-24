import { Platform } from "@enums/Platform.enum";
import { Timestamped } from "@interfaces/common";

export interface ShopCreateDto {
  name: string;
  platform: Platform;
  description?: string;
}
export interface Shop extends ShopCreateDto, Timestamped {
  id: string;
}
