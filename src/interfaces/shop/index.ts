import { Platform } from "@enums/Platform.enum";
import { PaginationDataQuery, Timestamped } from "@interfaces/common";

export interface onPostShopType {
  name: string;
  platform: Platform;
  description?: string;
}
export interface Shop extends onPostShopType, Timestamped {
  id: string;
}
export interface onGetShopsType extends PaginationDataQuery {
  platform?: Platform;
}
