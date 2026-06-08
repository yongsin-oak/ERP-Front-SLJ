export { ShopPage } from './pages/ShopPage';
export {
  useShops, useShopList, useCreateShop, useUpdateShop, useDeleteShop, useBulkDeleteShop,
} from './react-query';
export { shopService } from './react-query';
export type { Shop, Platform, CreateShopDto, UpdateShopDto } from './types';
export { PlatformColor, PlatformHex, PLATFORM_ORDER } from './types';
export { PlatformBadge } from './components';
