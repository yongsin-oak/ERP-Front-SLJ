import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import dayjs from 'dayjs';
import { FilterBar } from './index';
import type { FilterItem, FilterValues } from './index';

const ITEMS: FilterItem[] = [
  {
    key: 'search',
    type: 'search',
    label: 'ค้นหา',
    placeholder: 'ชื่อสินค้า / SKU / บาร์โค้ด',
  },
  {
    key: 'channel',
    type: 'select',
    label: 'ช่องทางขาย',
    options: [
      { label: 'Shopee', value: 'shopee' },
      { label: 'Lazada', value: 'lazada' },
      { label: 'TikTok Shop', value: 'tiktok' },
      { label: 'หน้าร้าน', value: 'store' },
    ],
  },
  {
    key: 'stockStatus',
    type: 'select',
    label: 'สถานะสต็อก',
    options: [
      { label: 'พร้อมขาย', value: 'in_stock' },
      { label: 'ใกล้หมด', value: 'low' },
      { label: 'หมดสต็อก', value: 'out' },
    ],
  },
  { key: 'soldRange', type: 'daterange', label: 'ช่วงวันที่ขาย' },
];

const Demo = ({ initial = {} }: { initial?: FilterValues }) => {
  const [values, setValues] = useState<FilterValues>(initial);
  return (
    <div className="flex flex-col gap-4">
      <FilterBar items={ITEMS} values={values} onChange={setValues} />
      <pre className="m-0 overflow-auto rounded-md bg-muted p-3 text-xs text-foreground">
        {JSON.stringify(values, null, 2)}
      </pre>
    </div>
  );
};

const meta = {
  title: 'Design System/FilterBar',
  component: FilterBar,
  tags: ['autodocs'],
  args: { items: ITEMS, values: {}, onChange: () => undefined },
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** พิมพ์ค้นหา / เลือกช่องทาง / เลือกช่วงวันที่ — ปุ่ม “ล้างตัวกรอง” จะปรากฏเมื่อมีค่าใดค่าหนึ่ง */
export const Default: Story = {
  render: () => <Demo />,
};

/** มีค่าเริ่มต้นอยู่แล้ว — ปุ่ม “ล้างตัวกรอง” แสดงทันที */
export const WithInitialValues: Story = {
  render: () => (
    <Demo
      initial={{
        search: 'สบู่',
        channel: 'shopee',
        soldRange: [dayjs().subtract(6, 'day').startOf('day'), dayjs().endOf('day')],
      }}
    />
  ),
};

/** พื้นที่แคบ — รายการตัวกรองขึ้นบรรทัดใหม่อัตโนมัติ (flex-wrap) */
export const NarrowViewport: Story = {
  render: () => (
    <div className="w-90 rounded-lg border border-dashed border-border p-3">
      <Demo />
    </div>
  ),
};
