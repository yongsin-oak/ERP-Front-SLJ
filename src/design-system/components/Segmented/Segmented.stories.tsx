import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppIcons } from '../../icons';
import { Segmented } from './index';

const meta = {
  title: 'Design System/Segmented',
  component: Segmented,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { options: ['ทั้งหมด', 'Shopee', 'Lazada', 'TikTok'] },
  argTypes: {
    size: { control: 'select', options: ['small', 'middle', 'large'] },
  },
} satisfies Meta<typeof Segmented>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDefaultValue: Story = {
  args: { defaultValue: 'Shopee' },
};

export const ObjectOptions: Story = {
  args: {
    options: [
      { label: 'รอแพ็ค', value: 'pending' },
      { label: 'แพ็คแล้ว', value: 'packed' },
      { label: 'ส่งแล้ว', value: 'shipped' },
      { label: 'ยกเลิก', value: 'cancelled', disabled: true },
    ],
    defaultValue: 'pending',
  },
};

export const WithIcons: Story = {
  args: {
    options: [
      {
        label: (
          <span className="inline-flex items-center gap-1.5">
            <AppIcons.list /> รายการ
          </span>
        ),
        value: 'list',
      },
      {
        label: (
          <span className="inline-flex items-center gap-1.5">
            <AppIcons.grid /> ตาราง
          </span>
        ),
        value: 'grid',
      },
    ],
    defaultValue: 'list',
  },
};

export const Block: Story = {
  args: { block: true, defaultValue: 'ทั้งหมด' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'ทั้งหมด' },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <Segmented size="small" options={['วันนี้', '7 วัน', '30 วัน']} />
      <Segmented size="middle" options={['วันนี้', '7 วัน', '30 วัน']} />
      <Segmented size="large" options={['วันนี้', '7 วัน', '30 วัน']} />
    </div>
  ),
};

/** ตัวอย่างจริง: กรองออเดอร์ตามสถานะการแพ็ค — เนื้อหาด้านล่างเปลี่ยนตามแท็บที่เลือก */
const STATUS_OPTIONS = [
  { label: 'รอแพ็ค', value: 'pending' },
  { label: 'ส่งแล้ว', value: 'shipped' },
  { label: 'ตีกลับ', value: 'returned' },
];

const ORDER_COUNT: Record<string, number | undefined> = {
  pending: 128,
  shipped: 542,
  returned: 7,
};

const OrderFilterDemo = () => {
  const [status, setStatus] = useState('pending');
  const label = STATUS_OPTIONS.find((s) => s.value === status)?.label ?? '';
  return (
    <div className="flex max-w-md flex-col gap-3">
      <Segmented options={STATUS_OPTIONS} value={status} onChange={setStatus} block />
      <p className="text-sm text-muted-foreground">
        ออเดอร์สถานะ “{label}” ทั้งหมด{' '}
        <span className="font-semibold text-foreground">{ORDER_COUNT[status] ?? 0}</span> รายการ
      </p>
    </div>
  );
};

export const OrderStatusFilterExample: Story = {
  render: () => <OrderFilterDemo />,
};
