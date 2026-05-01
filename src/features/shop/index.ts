export { ShopPage } from './pages/ShopPage';
export {
  useShops, useShopList, useCreateShop, useUpdateShop, useDeleteShop, useBulkDeleteShop,
} from './hooks';
export { shopService } from './services';
export type { Shop, Platform, CreateShopDto, UpdateShopDto } from './types';
export { PlatformColor, PlatformHex, PLATFORM_ORDER } from './types';
export { PlatformBadge } from './components/PlatformBadge';
