import type { ThemeConfig } from 'antd/es/config-provider/context';
import { colors, shadow } from '@design-system/tokens';

export const componentTokens: ThemeConfig['components'] = {
  Button: {
    colorPrimary: colors.brand.primary,
    colorPrimaryHover: colors.brand.hover,
    colorPrimaryActive: colors.brand.active,
    primaryShadow: 'none',
    defaultShadow: 'none',
    dangerShadow: 'none',
    borderRadius: 6,
    fontWeight: 500,
    paddingInline: 16,
  },

  Input: {
    colorBgContainer: colors.bg.base,
    colorText: colors.text.primary,
    colorTextPlaceholder: colors.text.tertiary,
    colorBorder: colors.border.default,
    activeShadow: `0 0 0 3px ${colors.brand.primary}22`,
    errorActiveShadow: `0 0 0 3px ${colors.semantic.error}22`,
    warningActiveShadow: `0 0 0 3px ${colors.semantic.warning}22`,
  },

  InputNumber: {
    colorBgContainer: colors.bg.base,
    colorText: colors.text.primary,
    colorBorder: colors.border.default,
    activeShadow: `0 0 0 3px ${colors.brand.primary}22`,
  },

  Select: {
    colorBgContainer: colors.bg.base,
    colorBorder: colors.border.default,
    optionSelectedBg: colors.brand.light,
    optionActiveBg: colors.bg.hover,
    selectorBg: colors.bg.base,
  },

  DatePicker: {
    colorBgContainer: colors.bg.base,
    colorBorder: colors.border.default,
    activeShadow: `0 0 0 3px ${colors.brand.primary}22`,
    cellActiveWithRangeBg: colors.brand.light,
    cellHoverWithRangeBg: `${colors.brand.primary}12`,
  },

  Table: {
    headerBg: colors.bg.layout,
    headerColor: colors.text.secondary,
    headerSortActiveBg: '#eef2f7',
    headerSortHoverBg: '#eef2f7',
    headerSplitColor: colors.border.default,
    borderColor: colors.border.default,
    rowHoverBg: '#f9fafb',
    bodySortBg: colors.bg.surface,
    cellPaddingBlock: 10,
    cellPaddingInline: 12,
  },

  Card: {
    colorBgContainer: colors.bg.base,
    colorBorderSecondary: colors.border.default,
    boxShadow: shadow.sm,
    borderRadius: 8,
    paddingLG: 20,
  },

  Modal: {
    contentBg: colors.bg.base,
    headerBg: colors.bg.base,
    titleFontSize: 16,
    borderRadiusLG: 8,
  },

  Drawer: {
    colorBgContainer: colors.bg.base,
    colorBgElevated: colors.bg.base,
    borderRadiusLG: 0,
  },

  Layout: {
    headerBg: colors.bg.base,
    siderBg: colors.bg.base,
    triggerBg: colors.bg.layout,
    headerColor: colors.text.primary,
  },

  Menu: {
    itemBg: colors.bg.base,
    itemColor: colors.text.secondary,
    itemHoverBg: colors.bg.hover,
    itemHoverColor: colors.text.primary,
    itemActiveBg: colors.brand.light,
    itemSelectedBg: colors.brand.light,
    itemSelectedColor: colors.brand.primary,
    subMenuItemBg: colors.bg.base,
    popupBg: colors.bg.base,
  },

  Form: {
    labelFontSize: 13,
    labelColor: colors.text.secondary,
    itemMarginBottom: 16,
    labelHeight: 28,
  },

  Tabs: {
    itemColor: colors.text.secondary,
    itemHoverColor: colors.text.primary,
    itemSelectedColor: colors.brand.primary,
    inkBarColor: colors.brand.primary,
    colorBorderSecondary: colors.border.default,
    cardBg: colors.bg.layout,
  },

  Pagination: {
    colorPrimary: colors.brand.primary,
    colorPrimaryHover: colors.brand.hover,
    itemActiveBg: colors.brand.primary,
  },

  Checkbox: {
    colorPrimary: colors.brand.primary,
    colorPrimaryHover: colors.brand.hover,
    colorBorder: colors.border.strong,
  },

  Radio: {
    colorPrimary: colors.brand.primary,
    colorPrimaryHover: colors.brand.hover,
    colorBorder: colors.border.strong,
    buttonCheckedBg: colors.brand.light,
    buttonSolidCheckedBg: colors.brand.primary,
    buttonSolidCheckedHoverBg: colors.brand.hover,
  },

  Switch: {
    colorPrimary: colors.brand.primary,
    colorPrimaryHover: colors.brand.hover,
  },

  Breadcrumb: {
    itemColor: colors.text.tertiary,
    lastItemColor: colors.text.primary,
    separatorColor: colors.text.tertiary,
  },

  Tag: {
    borderRadius: 4,
    defaultBg: colors.neutral[100],
    defaultColor: colors.text.secondary,
  },

  Tooltip: {
    colorText: colors.text.inverse,
    borderRadius: 6,
    fontSize: 13,
  },

  Popconfirm: {
    colorWarning: colors.semantic.warning,
  },

  Divider: {
    colorSplit: colors.border.default,
  },

  Alert: {
    borderRadiusLG: 6,
  },

  Notification: {
    borderRadiusLG: 8,
  },

  Spin: {
    colorPrimary: colors.brand.primary,
  },

  Progress: {
    defaultColor: colors.brand.primary,
  },

  Upload: {
    colorPrimary: colors.brand.primary,
    colorBorder: colors.border.default,
    colorFillAlter: colors.bg.layout,
  },

  Skeleton: {
    gradientFromColor: colors.bg.skeleton,
    gradientToColor: colors.neutral[200],
  },

  Tree: {
    colorPrimary: colors.brand.primary,
    nodeHoverBg: colors.bg.hover,
    nodeSelectedBg: colors.brand.light,
    colorBgContainer: colors.bg.base,
  },
};
