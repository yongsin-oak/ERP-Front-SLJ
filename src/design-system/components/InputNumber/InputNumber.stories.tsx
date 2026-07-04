import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppIcons } from '../../icons';
import { InputNumber } from './index';

const meta = {
  title: 'Design System/InputNumber',
  component: InputNumber,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { placeholder: 'จำนวน' },
  argTypes: {
    size: { control: 'select', options: ['small', 'middle', 'large'] },
  },
} satisfies Meta<typeof InputNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

const QuantityDemo = () => {
  const [value, setValue] = useState<number | null>(50);
  return (
    <div className="w-56">
      <InputNumber value={value} onChange={setValue} min={0} suffix="ชิ้น" placeholder="จำนวนรับเข้า" />
    </div>
  );
};

export const Default: Story = {
  render: () => <QuantityDemo />,
};

/** จำกัดช่วงค่า — สั่งซื้อกล่องขั้นต่ำ 100 สูงสุด 10,000 ชิ้น (ค่าถูก clamp ตอนพิมพ์) */
const MinMaxDemo = () => {
  const [value, setValue] = useState<number | null>(100);
  return (
    <div className="flex w-56 flex-col gap-1.5">
      <InputNumber value={value} onChange={setValue} min={100} max={10000} suffix="ชิ้น" />
      <p className="text-xs text-muted-foreground">สั่งขั้นต่ำ 100 ชิ้น · สูงสุด 10,000 ชิ้นต่อออเดอร์</p>
    </div>
  );
};

export const MinMax: Story = {
  render: () => <MinMaxDemo />,
};

/** ทศนิยม 2 ตำแหน่ง — ราคาขายต่อชิ้น */
const PriceDemo = () => {
  const [value, setValue] = useState<number | null>(4.5);
  return (
    <div className="w-56">
      <InputNumber value={value} onChange={setValue} min={0} precision={2} prefix="฿" placeholder="0.00" />
    </div>
  );
};

export const PricePrecision: Story = {
  render: () => <PriceDemo />,
};

/** formatter/parser — แสดงตัวคั่นหลักพันตอนไม่ได้โฟกัส */
const formatThousands = (v: number | undefined) => (v == null ? '' : v.toLocaleString('en-US'));
const parseThousands = (v: string | undefined) => (v ?? '').replace(/,/g, '');

const ThousandsDemo = () => {
  const [value, setValue] = useState<number | null>(12500);
  return (
    <div className="w-56">
      <InputNumber
        value={value}
        onChange={setValue}
        min={0}
        formatter={formatThousands}
        parser={parseThousands}
        suffix="ชิ้น"
        placeholder="ยอดสต็อกยกมา"
      />
    </div>
  );
};

export const ThousandSeparator: Story = {
  render: () => <ThousandsDemo />,
};

const AddonDemo = () => {
  const [value, setValue] = useState<number | null>(1250);
  return (
    <div className="w-72">
      <InputNumber value={value} onChange={setValue} min={0} precision={2} addonBefore="ราคาทุน" addonAfter="บาท" />
    </div>
  );
};

export const WithAddons: Story = {
  render: () => <AddonDemo />,
};

export const WithIconPrefix: Story = {
  render: () => (
    <div className="w-56">
      <InputNumber value={99} precision={2} prefix={<AppIcons.baht />} placeholder="0.00" />
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, value: 250, suffix: 'ชิ้น' },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex w-56 flex-col gap-3">
      <InputNumber size="small" value={10} suffix="ชิ้น" />
      <InputNumber size="middle" value={100} suffix="ชิ้น" />
      <InputNumber size="large" value={1000} suffix="ชิ้น" />
    </div>
  ),
};

/** ตัวอย่างจริง: รับสต็อกสินค้า — จำนวน × ราคาต่อชิ้น คำนวณยอดรวมทันที */
const ReceiveStockDemo = () => {
  const [qty, setQty] = useState<number | null>(500);
  const [price, setPrice] = useState<number | null>(4.5);
  const total = (qty ?? 0) * (price ?? 0);
  return (
    <div className="flex max-w-md flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="text-base font-semibold text-foreground">รับสต็อก — กล่องไปรษณีย์ เบอร์ 0 (11×17×6 ซม.)</h3>
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium text-foreground">
          จำนวน
          <InputNumber value={qty} onChange={setQty} min={0} suffix="ชิ้น" />
        </label>
        <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium text-foreground">
          ราคาต่อชิ้น
          <InputNumber value={price} onChange={setPrice} min={0} precision={2} prefix="฿" />
        </label>
      </div>
      <p className="text-sm text-muted-foreground">
        ยอดรวม{' '}
        <span className="font-semibold text-foreground">
          ฿{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      </p>
    </div>
  );
};

export const ReceiveStockExample: Story = {
  render: () => <ReceiveStockDemo />,
};
