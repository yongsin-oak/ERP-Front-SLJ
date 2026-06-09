/**
 * Centralised icon registry for SLJ ERP.
 *
 * RULE: New components must import domain icons from `AppIcons` here.
 *       Existing code using `@ant-design/icons` directly is fine to keep as-is
 *       until naturally migrated.
 *
 * Decision:
 *  • Ant Design icons   → generic UI chrome (edit, delete, search, close…)
 *  • Tabler icons       → domain concepts where Antd falls short
 *
 * Usage:
 *   import { AppIcons } from '@design-system';
 *   <AppIcons.product size={16} />
 *   <AppIcons.baht size={16} />
 */

import {
  // Pages / navigation
  IconGauge,
  IconClipboardList,
  IconPackage,
  IconPackageImport,
  IconPackageExport,
  IconBuildingWarehouse,
  IconBuildingStore,
  IconUsers,
  IconLayoutDashboard,
  IconShieldCheck,
  IconChartBar,

  // Business entities
  IconPackages,
  IconTag,
  IconCategory,
  IconReceipt,
  IconCurrencyBaht,
  IconTruckDelivery,

  // People / identity
  IconUserCircle,
  IconUserShield,
  IconBriefcase,

  // Actions
  IconTableImport,
  IconTableExport,
  IconBarcode,
  IconClipboardCheck,

  // Security
  IconLockPassword,
  IconKey,
} from '@tabler/icons-react';

export const AppIcons = {
  // ── Pages / navigation ───────────────────────────────
  /** Dashboard — KPIs & metric gauges */
  dashboard:    IconGauge,
  /** Order list / history */
  orders:       IconClipboardList,
  /** Product inventory */
  inventory:    IconPackage,
  /** Receive stock into warehouse */
  stockReceive: IconPackageImport,
  /** Issue / ship stock out */
  stockOut:     IconPackageExport,
  /** Physical warehouse / storage location */
  warehouse:    IconBuildingWarehouse,
  /** Supplier / vendor */
  supplier:     IconBuildingStore,
  /** Employee roster */
  employees:    IconUsers,
  /** POS terminal / workstation (sidebar nav) */
  terminal:     IconLayoutDashboard,
  /** Roles & permissions */
  roles:        IconShieldCheck,

  // ── Business entities ─────────────────────────────────
  /** Single product (barcode context) */
  product:      IconPackage,
  /** Multiple products / batch */
  products:     IconPackages,
  /** Brand / label */
  brand:        IconTag,
  /** Product category */
  category:     IconCategory,
  /** Receipt / tax invoice */
  invoice:      IconReceipt,
  /** Thai Baht — price cells, money amounts */
  baht:         IconCurrencyBaht,
  /** Delivery / inbound shipment */
  delivery:     IconTruckDelivery,

  // ── People / identity ─────────────────────────────────
  /** Current user avatar */
  userAvatar:   IconUserCircle,
  /** User with role — role assignment UI */
  userRole:     IconUserShield,
  /** Employee department */
  department:   IconBriefcase,

  // ── Actions ───────────────────────────────────────────
  /** Import rows from Excel / CSV */
  importFile:   IconTableImport,
  /** Export rows to Excel / CSV */
  exportFile:   IconTableExport,
  /** Barcode — scan input, product code display */
  barcode:      IconBarcode,
  /** Stock count / physical audit — clipboard with checkmark */
  stockCount:   IconClipboardCheck,

  // ── Reports / analytics ───────────────────────────────
  /** Reports & analytics page */
  report:       IconChartBar,

  // ── Security ──────────────────────────────────────────
  /** Numeric PIN entry (terminal / employee login) */
  pin:          IconLockPassword,
  /** API key / access token */
  apiKey:       IconKey,
} as const;

export type AppIconKey = keyof typeof AppIcons;
