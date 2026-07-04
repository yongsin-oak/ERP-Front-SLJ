import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { QuantityInput } from './index';

const meta = {
  title: 'Design System/QuantityInput',
  component: QuantityInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['small', 'middle', 'large'] },
  },
} satisfies Meta<typeof QuantityInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: '0' },
};

export const WithValue: Story = {
  args: { value: 500, unit: 'กล่อง' },
};

export const CustomUnits: Story = {
  args: { value: 12, unit: 'ม้วน', units: ['ม้วน', 'แพ็ค', 'ลัง'] },
};

export const WithMax: Story = {
  args: { max: 999, placeholder: 'ไม่เกิน 999' },
};

export const Disabled: Story = {
  args: { value: 50, disabled: true },
};

const ControlledDemo = () => {
  const [qty, setQty] = useState<number | null>(120);
  const [unit, setUnit] = useState('ชิ้น');
  return (
    <div className="flex max-w-72 flex-col gap-2">
      <QuantityInput value={qty} onChange={setQty} unit={unit} onUnitChange={setUnit} />
      <span className="text-sm text-muted-foreground">
        {qty != null ? `จำนวนรับเข้า ${qty.toLocaleString('th-TH')} ${unit}` : 'ยังไม่ระบุจำนวน'}
      </span>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledDemo />,
};

const StockReceiveDemo = () => {
  const [qty, setQty] = useState<number | null>(200);
  const [unit, setUnit] = useState('แพ็ค');
  const piecesPerPack = 50;
  const totalPieces = unit === 'แพ็ค' && qty != null ? qty * piecesPerPack : null;
  return (
    <div className="max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-1 text-base font-semibold text-foreground">รับสินค้าเข้าสต็อก</h3>
      <p className="mb-5 text-[13px] text-muted-foreground">
        ซองกันกระแทก 9×12 นิ้ว — ใบสั่งซื้อ PO-2026-0148
      </p>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-foreground">จำนวนที่รับเข้า</span>
          <QuantityInput value={qty} onChange={setQty} unit={unit} onUnitChange={setUnit} />
        </div>
        <div className="flex items-center justify-between border-t border-divider pt-3 text-sm">
          <span className="text-muted-foreground">รวมทั้งหมด</span>
          <span className="font-semibold tabular-nums">
            {totalPieces != null
              ? `${totalPieces.toLocaleString('th-TH')} ชิ้น (${piecesPerPack} ชิ้น/แพ็ค)`
              : qty != null
                ? `${qty.toLocaleString('th-TH')} ${unit}`
                : '—'}
          </span>
        </div>
      </div>
    </div>
  );
};

export const StockReceiveExample: Story = {
  render: () => <StockReceiveDemo />,
};
