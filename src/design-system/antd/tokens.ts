import type { ThemeConfig } from 'antd/es/config-provider/context';
import { colors, shadow } from '@design-system/tokens';

const FONT_FAMILY =
  "'Bai Jamjuree', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export const globalTokens: ThemeConfig['token'] = {
  colorPrimary: colors.brand.primary,
  colorInfo: colors.semantic.info,
  colorSuccess: colors.semantic.success,
  colorWarning: colors.semantic.warning,
  colorError: colors.semantic.error,
  colorLink: colors.brand.primary,
  colorLinkHover: colors.brand.hover,

  fontFamily: FONT_FAMILY,
  colorTextBase: colors.text.primary,
  fontSize: 14,
  fontWeightStrong: 600,

  colorBgBase: colors.bg.base,
  colorBgLayout: colors.bg.layout,
  colorBgContainer: colors.bg.base,
  colorBgElevated: colors.bg.base,

  colorBorder: colors.border.default,
  colorBorderSecondary: colors.border.subtle,

  borderRadius: 6,
  borderRadiusLG: 8,
  borderRadiusSM: 4,

  controlHeight: 36,

  motionDurationFast: '0.1s',
  motionDurationMid: '0.15s',
  motionDurationSlow: '0.2s',

  boxShadow: shadow.sm,
  boxShadowSecondary: shadow.md,
  boxShadowTertiary: shadow.sm,
};
