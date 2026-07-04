/**
 * Centralised icon registry for SLJ ERP — **Tabler icons only**.
 *
 * RULE: Always use icons via `AppIcons`, keyed by **purpose** (what it means /
 *       where it's used) — never import `@tabler/icons-react` (or `@ant-design/icons`)
 *       directly in a component, and never key by visual shape.
 *
 * Usage:
 *   import { AppIcons } from '@design-system';
 *   <AppIcons.add />            // inherits font-size (1em) like the old antd icons
 *   <AppIcons.delete size={16} />
 *   <AppIcons.loading spin />
 */

import {
  type Icon as TablerIcon,
  type IconProps,
  // pages / nav / entities
  IconGauge, IconClipboardList, IconPackage, IconPackageImport, IconPackageExport,
  IconBuildingWarehouse, IconBuildingStore, IconUsers, IconLayoutDashboard,
  IconShieldCheck, IconChartBar, IconPackages, IconTag, IconCategory, IconReceipt,
  IconCurrencyBaht, IconTruckDelivery, IconUserCircle, IconUserShield, IconBriefcase,
  IconTableImport, IconTableExport, IconBarcode, IconClipboardCheck, IconLockPassword,
  IconKey,
  // actions / chrome
  IconPlus, IconMinus, IconSearch, IconPencil, IconTrash, IconX, IconCheck, IconMail,
  IconCircleCheck, IconRefresh, IconFilter, IconDeviceFloppy, IconCopy, IconEye,
  IconDownload, IconClearAll, IconLoader2, IconSettings, IconList, IconAdjustments,
  // layout / nav chrome
  IconMenu2, IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand, IconLayoutGrid,
  IconDeviceDesktop, IconChevronDown,
  // arrows / trend
  IconArrowUp, IconArrowDown, IconArrowLeft, IconArrowRight, IconTrendingUp, IconTrendingDown,
  // status / alert
  IconAlertTriangle, IconAlertTriangleFilled, IconAlertCircle,
  // security / identity / domain
  IconLock, IconLogout, IconUser, IconShoppingCart, IconTags, IconBox, IconDatabase,
  IconCurrencyDollar, IconFileSpreadsheet, IconFlame, IconHistory, IconInbox, IconBug,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

type AppIconProps = Omit<IconProps, 'ref'> & { spin?: boolean };

/** Wrap a Tabler icon: default size 1em (inherit font-size, antd-compatible) + `spin`. */
function make(Icon: TablerIcon) {
  return function AppIcon({ spin, className, size = '1em', ...props }: AppIconProps) {
    return <Icon size={size} className={cn(spin && 'animate-spin', className)} {...props} />;
  };
}

export const AppIcons = {
  // ── Pages / navigation ───────────────────────────────
  dashboard:    make(IconGauge),
  orders:       make(IconClipboardList),
  inventory:    make(IconPackage),
  stockReceive: make(IconPackageImport),
  stockOut:     make(IconPackageExport),
  warehouse:    make(IconBuildingWarehouse),
  supplier:     make(IconBuildingStore),
  employees:    make(IconUsers),
  terminal:     make(IconLayoutDashboard),
  roles:        make(IconShieldCheck),

  // ── Business entities ─────────────────────────────────
  product:      make(IconPackage),
  products:     make(IconPackages),
  brand:        make(IconTag),
  tags:         make(IconTags),
  category:     make(IconCategory),
  grid:         make(IconLayoutGrid),
  invoice:      make(IconReceipt),
  baht:         make(IconCurrencyBaht),
  money:        make(IconCurrencyDollar),
  delivery:     make(IconTruckDelivery),
  shop:         make(IconBuildingStore),
  cart:         make(IconShoppingCart),
  container:    make(IconBox),
  database:     make(IconDatabase),
  desktop:      make(IconDeviceDesktop),
  damage:       make(IconFlame),

  // ── People / identity ─────────────────────────────────
  user:         make(IconUser),
  userAvatar:   make(IconUserCircle),
  userRole:     make(IconUserShield),
  department:   make(IconBriefcase),
  email:        make(IconMail),

  // ── Actions / chrome ──────────────────────────────────
  add:          make(IconPlus),
  minus:        make(IconMinus),
  edit:         make(IconPencil),
  delete:       make(IconTrash),
  close:        make(IconX),
  check:        make(IconCheck),
  success:      make(IconCircleCheck),
  search:       make(IconSearch),
  filter:       make(IconFilter),
  refresh:      make(IconRefresh),
  save:         make(IconDeviceFloppy),
  copy:         make(IconCopy),
  view:         make(IconEye),
  download:     make(IconDownload),
  clear:        make(IconClearAll),
  loading:      make(IconLoader2),
  settings:     make(IconSettings),
  list:         make(IconList),
  adjust:       make(IconAdjustments),
  importFile:   make(IconTableImport),
  exportFile:   make(IconTableExport),
  excel:        make(IconFileSpreadsheet),
  barcode:      make(IconBarcode),
  stockCount:   make(IconClipboardCheck),
  history:      make(IconHistory),
  inbox:        make(IconInbox),
  debug:        make(IconBug),

  // ── Navigation chrome ─────────────────────────────────
  menu:            make(IconMenu2),
  collapseSidebar: make(IconLayoutSidebarLeftCollapse),
  expandSidebar:   make(IconLayoutSidebarLeftExpand),
  chevronDown:     make(IconChevronDown),

  // ── Arrows / trend ────────────────────────────────────
  arrowUp:      make(IconArrowUp),
  arrowDown:    make(IconArrowDown),
  arrowLeft:    make(IconArrowLeft),
  arrowRight:   make(IconArrowRight),
  trendUp:      make(IconTrendingUp),
  trendDown:    make(IconTrendingDown),

  // ── Status / alert ────────────────────────────────────
  warning:       make(IconAlertTriangle),
  warningFilled: make(IconAlertTriangleFilled),
  alert:         make(IconAlertCircle),

  // ── Reports / analytics ───────────────────────────────
  report:       make(IconChartBar),

  // ── Security ──────────────────────────────────────────
  lock:         make(IconLock),
  logout:       make(IconLogout),
  pin:          make(IconLockPassword),
  apiKey:       make(IconKey),
  key:          make(IconKey),
} as const;

export type AppIconKey = keyof typeof AppIcons;
