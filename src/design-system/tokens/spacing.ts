export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const;

export const radius = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
} as const;

export const shadow = {
  // Stripe-style: border-reliant surfaces with subtle depth
  sm: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.08)',       // card, input
  md: '0 4px 12px rgba(50,50,93,0.08), 0 2px 4px rgba(0,0,0,0.06)',   // dropdown, popover
  lg: '0 8px 24px rgba(50,50,93,0.1), 0 4px 8px rgba(0,0,0,0.08)',    // modal
  xl: '0 20px 60px rgba(50,50,93,0.12), 0 8px 24px rgba(0,0,0,0.1)',  // large modal, deep panel
} as const;
