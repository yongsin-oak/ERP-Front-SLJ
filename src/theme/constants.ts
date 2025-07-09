// Style constants that are commonly reused across the project

export const BORDER_RADIUS = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  "2xl": "24px",
  "3xl": "32px",
  round: "50%",
  pill: "9999px",
} as const;

export const SPACING = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  "2xl": "24px",
  "3xl": "32px",
  "4xl": "40px",
  "5xl": "48px",
  "6xl": "64px",
} as const;

export const BOX_SHADOW = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  floating: "0 4px 24px 0 rgba(0, 0, 0, 0.15)",
  floatingDark: "0 4px 24px 0 rgba(0, 0, 0, 0.45)",
} as const;

export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
  floating: 1000,
} as const;

export const FONT_SIZE = {
  xs: "12px",
  sm: "14px",
  base: "16px",
  lg: "18px",
  xl: "20px",
  "2xl": "24px",
  "3xl": "30px",
  "4xl": "36px",
  "5xl": "48px",
  "6xl": "60px",
  xxs: "10px", // สำหรับ s3
} as const;

export const FONT_WEIGHT = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export const TRANSITION = {
  fast: "0.15s ease",
  base: "0.3s ease",
  slow: "0.5s ease",
  all: "all 0.3s ease",
  colors:
    "color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease",
  transform: "transform 0.3s ease",
} as const;

export const BREAKPOINTS = {
  xs: "480px",
  sm: "576px",
  md: "768px",
  lg: "992px",
  xl: "1200px",
  "2xl": "1400px",
} as const;

// Common style mixins
export const FLEX_CENTER = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const;

export const FLEX_BETWEEN = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
} as const;

export const ABSOLUTE_CENTER = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
} as const;

export const TRUNCATE_TEXT = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap" as const,
} as const;
