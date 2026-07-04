import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { Grid } from '../Grid';
import { AppIcons } from '../../icons';
import { StatsCard } from './index';

const Narrow: Decorator = Story => (
  <div className="max-w-xs">
    <Story />
  </div>
);

const meta = {
  title: 'Design System/StatsCard',
  component: StatsCard,
  tags: ['autodocs'],
  args: { label: 'ยอดขายวันนี้', value: '48,250' },
} satisfies Meta<typeof StatsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [Narrow],
};

export const DeltaUp: Story = {
  decorators: [Narrow],
  args: { delta: 12.4, deltaLabel: 'เทียบกับเมื่อวาน' },
};

export const DeltaDown: Story = {
  decorators: [Narrow],
  args: {
    label: 'ออเดอร์ Lazada',
    value: 32,
    delta: -8.6,
    deltaLabel: 'เทียบกับสัปดาห์ก่อน',
  },
};

export const DeltaZero: Story = {
  decorators: [Narrow],
  args: { label: 'ออเดอร์หน้าร้าน', value: 45, delta: 0, deltaLabel: 'เท่ากับเมื่อวาน' },
};

export const WithPrefixSuffix: Story = {
  decorators: [Narrow],
  args: { prefix: '฿', suffix: 'บาท' },
};

export const WithIcon: Story = {
  decorators: [Narrow],
  args: { label: 'ออเดอร์ Shopee', value: 89, icon: <AppIcons.cart /> },
};

export const Loading: Story = {
  decorators: [Narrow],
  args: { loading: true },
};

export const NoValue: Story = {
  decorators: [Narrow],
  args: { label: 'ยอดขายเดือนนี้', value: null },
};

export const Clickable: Story = {
  decorators: [Narrow],
  args: {
    label: 'สินค้าใกล้หมด',
    value: 12,
    suffix: 'รายการ',
    icon: <AppIcons.warning />,
    onClick: () => undefined,
  },
};

export const DashboardRow: Story = {
  render: () => (
    <Grid cols={4} gap={4}>
      <StatsCard
        label="ยอดขายวันนี้"
        value="48,250"
        prefix="฿"
        delta={12.4}
        deltaLabel="เทียบกับเมื่อวาน"
        icon={<AppIcons.baht />}
      />
      <StatsCard
        label="ออเดอร์วันนี้"
        value={156}
        suffix="ออเดอร์"
        delta={5.2}
        deltaLabel="เทียบกับเมื่อวาน"
        icon={<AppIcons.orders />}
      />
      <StatsCard
        label="ออเดอร์ Shopee"
        value={89}
        delta={-2.1}
        deltaLabel="เทียบกับเมื่อวาน"
        icon={<AppIcons.cart />}
      />
      <StatsCard
        label="สินค้าใกล้หมด"
        value={12}
        suffix="รายการ"
        icon={<AppIcons.warning />}
      />
    </Grid>
  ),
};
