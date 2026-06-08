export const colors = {
  // ── Brand ────────────────────────────────────────────────────────────────
  brand: {
    primary: '#e0282e',
    hover: '#c1252a',
    active: '#a71f23',
    light: '#fff1f0',
    border: '#ffa39e',
  },

  // ── Neutral scale ─────────────────────────────────────────────────────────
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#f0f0f0',
    300: '#d9d9d9',
    400: '#bfbfbf',
    500: '#8c8c8c',
    600: '#595959',
    700: '#434343',
    800: '#262626',
    900: '#141414',
  },

  // ── Semantic — 4-tier per state: bg · border · icon/accent · text ─────────
  // bg        → tag fill, highlighted row, alert background
  // border    → outlined tag, form field validation ring
  // (key)     → icon, badge dot, filled button
  // text      → readable colored text on white — darker variants (WCAG AA)
  semantic: {
    successBg: '#f6ffed',
    successBorder: '#b7eb8f',
    success: '#52c41a',
    successText: '#389e0d',

    warningBg: '#fffbe6',
    warningBorder: '#ffe58f',
    warning: '#faad14',
    warningText: '#d48806',

    errorBg: '#fff2f0',
    errorBorder: '#ffccc7',
    error: '#ff4d4f',
    errorText: '#cf1322',

    infoBg: '#e6f4ff',
    infoBorder: '#91caff',
    info: '#1677ff',
    infoText: '#0958d9',
  },

  // ── Status palette — for order/workflow/stock status tags ─────────────────
  // Usage: const s = colors.status[orderStatus]; → s.color, s.bg, s.border
  status: {
    pending: {
      color: '#8c8c8c',
      bg: '#fafafa',
      border: '#d9d9d9',
    },
    processing: {
      color: '#1677ff',
      bg: '#e6f4ff',
      border: '#91caff',
    },
    completed: {
      color: '#52c41a',
      bg: '#f6ffed',
      border: '#b7eb8f',
    },
    cancelled: {
      color: '#ff4d4f',
      bg: '#fff2f0',
      border: '#ffccc7',
    },
    onHold: {
      color: '#faad14',
      bg: '#fffbe6',
      border: '#ffe58f',
    },
  },

  // ── Text hierarchy ────────────────────────────────────────────────────────
  text: {
    primary: 'rgba(0,0,0,0.88)',
    secondary: 'rgba(0,0,0,0.65)',
    tertiary: 'rgba(0,0,0,0.45)',
    disabled: 'rgba(0,0,0,0.25)',
    inverse: '#ffffff',
    link: '#1677ff',
    linkHover: '#4096ff',
  },

  // ── Borders ───────────────────────────────────────────────────────────────
  border: {
    default: '#e3e8ee',    // cool-gray — Stripe-style clean divider
    strong: '#c1c9d2',     // visible border, hover states
    subtle: '#f0f2f5',     // section separator, minimal divider
    focus: '#e0282e',      // brand focus ring
  },

  // ── Backgrounds ───────────────────────────────────────────────────────────
  bg: {
    base: '#ffffff',       // card, modal, popover
    layout: '#f6f9fc',     // page background — Stripe cool-slate tint
    surface: '#f8fafc',    // raised surface, nested card
    hover: 'rgba(0,0,0,0.04)',
    active: 'rgba(0,0,0,0.08)',
    selected: '#fff1f0',   // selected table row, active nav item
    disabled: 'rgba(0,0,0,0.04)',
    mask: 'rgba(0,0,0,0.45)', // modal/drawer overlay
    skeleton: '#eef2f7',   // skeleton loading placeholder
  },
} as const;
