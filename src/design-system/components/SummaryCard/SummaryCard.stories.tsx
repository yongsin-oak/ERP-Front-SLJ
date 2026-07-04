import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Grid } from '../Grid';
import { AppIcons } from '../../icons';
import { SummaryCard } from './index';

const formatNumber = (value: number | string): ReactNode =>
  typeof value === 'number' ? value.toLocaleString('th-TH') : value;

const meta = {
  title: 'Design System/SummaryCard',
  component: SummaryCard,
  tags: ['autodocs'],
  args: { title: 'ยอดขายรวม', value: 48250, style: { width: 260 } },
} satisfies Meta<typeof SummaryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSuffix: Story = {
  args: { title: 'จำนวนออเดอร์วันนี้', value: 156, suffix: 'ออเดอร์' },
};

export const WithPrefix: Story = {
  args: {
    title: 'ยอดขายวันนี้',
    value: '48,250',
    prefix: <AppIcons.baht className="text-muted-foreground" />,
  },
};

export const WithFormatter: Story = {
  args: {
    title: 'ยอดขายรวมเดือนนี้',
    value: 1284500,
    prefix: '฿',
    formatter: formatNumber,
  },
};

export const WithColor: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <SummaryCard
        title="กำไรวันนี้"
        value={12480}
        prefix="฿"
        color="var(--color-success-text)"
        formatter={formatNumber}
        style={{ width: 240 }}
      />
      <SummaryCard
        title="สินค้าใกล้หมด"
        value={12}
        suffix="รายการ"
        color="var(--color-error-text)"
        style={{ width: 240 }}
      />
    </div>
  ),
};

export const SummaryRow: Story = {
  render: () => (
    <Grid cols={4} gap={3}>
      <SummaryCard
        title="ยอดขายรวมเดือนนี้"
        value={1284500}
        prefix="฿"
        formatter={formatNumber}
      />
      <SummaryCard title="ออเดอร์ Shopee" value={892} suffix="ออเดอร์" />
      <SummaryCard title="ออเดอร์ Lazada" value={567} suffix="ออเดอร์" />
      <SummaryCard
        title="สินค้าคงเหลือรวม"
        value={15230}
        suffix="ชิ้น"
        formatter={formatNumber}
      />
    </Grid>
  ),
};
