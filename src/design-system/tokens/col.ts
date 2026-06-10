import type { ColProps } from 'antd';

export const COL_PROPS = {
  filterItem: { xs: 24, sm: 12, lg: 8 } satisfies ColProps,
  statsCard:  { xs: 24, sm: 12, lg: 6 } satisfies ColProps,
  formField:  { xs: 24, md: 8 } satisfies ColProps,
  infoField:  { xs: 24, sm: 8 } satisfies ColProps,
  chartMain:  { xs: 24, lg: 16 } satisfies ColProps,
  chartSide:  { xs: 24, lg: 8 } satisfies ColProps,
} as const;
