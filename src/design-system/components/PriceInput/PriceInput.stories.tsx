import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { PriceInput } from './index';

const meta = {
  title: 'Design System/PriceInput',
  component: PriceInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['small', 'middle', 'large'] },
  },
} satisfies Meta<typeof PriceInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: '0.00' },
};

export const WithValue: Story = {
  args: { value: 1290.5 },
};

export const CustomCurrency: Story = {
  args: { value: 35, currency: '$' },
};

export const Disabled: Story = {
  args: { value: 450, disabled: true },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex max-w-60 flex-col gap-2">
      <PriceInput size="small" placeholder="small" />
      <PriceInput size="middle" placeholder="middle" />
      <PriceInput size="large" placeholder="large" />
    </div>
  ),
};

const ControlledDemo = () => {
  const [price, setPrice] = useState<number | null>(6.5);
  return (
    <div className="flex max-w-60 flex-col gap-2">
      <PriceInput value={price} onChange={setPrice} placeholder="0.00" />
      <span className="text-sm text-muted-foreground">
        {price != null
          ? `ราคาขาย ${price.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท/ชิ้น`
          : 'ยังไม่กำหนดราคา'}
      </span>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledDemo />,
};

const ProfitDemo = () => {
  const [cost, setCost] = useState<number | null>(4.25);
  const [sell, setSell] = useState<number | null>(6.5);
  const margin = cost != null && sell != null ? sell - cost : null;
  return (
    <div className="max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-1 text-base font-semibold text-foreground">ตั้งราคาสินค้า</h3>
      <p className="mb-5 text-[13px] text-muted-foreground">กล่องไปรษณีย์ เบอร์ 0 (11×17×6 ซม.)</p>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-foreground">ราคาทุนจากซัพพลายเออร์</span>
          <PriceInput value={cost} onChange={setCost} placeholder="0.00" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-foreground">ราคาขายหน้าร้าน</span>
          <PriceInput value={sell} onChange={setSell} placeholder="0.00" />
        </div>
        <div className="flex items-center justify-between border-t border-divider pt-3 text-sm">
          <span className="text-muted-foreground">กำไรต่อชิ้น</span>
          <span
            className={
              margin != null && margin < 0
                ? 'font-semibold text-error-text'
                : 'font-semibold text-success-text'
            }
          >
            {margin != null
              ? `${margin.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท`
              : '—'}
          </span>
        </div>
      </div>
    </div>
  );
};

export const ProductPricingExample: Story = {
  render: () => <ProfitDemo />,
};
