import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { InlineEdit } from './index';

const meta = {
  title: 'Design System/InlineEdit',
  component: InlineEdit,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { value: 'กล่องไปรษณีย์ เบอร์ 0', onSave: () => {} },
} satisfies Meta<typeof InlineEdit>;

export default meta;
type Story = StoryObj<typeof meta>;

const ControlledDemo = () => {
  const [name, setName] = useState('กล่องไปรษณีย์ เบอร์ 0 (11×17×6 ซม.)');
  return (
    <div className="flex flex-col gap-2 text-sm">
      <InlineEdit value={name} onSave={setName} />
      <span className="text-xs text-muted-foreground">
        คลิกที่ข้อความเพื่อแก้ไข · Enter = บันทึก · Esc = ยกเลิก
      </span>
    </div>
  );
};

export const Default: Story = {
  render: () => <ControlledDemo />,
};

const AsyncSaveDemo = () => {
  const [note, setNote] = useState('รอเช็คสต็อกจากซัพพลายเออร์');
  const save = async (value: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    setNote(value);
  };
  return (
    <div className="flex flex-col gap-2 text-sm">
      <InlineEdit value={note} onSave={save} />
      <span className="text-xs text-muted-foreground">
        จำลองบันทึกผ่าน API 0.8 วินาที — ระหว่างบันทึกช่องจะล็อก
      </span>
    </div>
  );
};

export const AsyncSave: Story = {
  render: () => <AsyncSaveDemo />,
};

const EmptyValueDemo = () => {
  const [phone, setPhone] = useState('');
  return (
    <div className="text-sm">
      <InlineEdit value={phone} onSave={setPhone} placeholder="เพิ่มเบอร์ติดต่อซัพพลายเออร์" />
    </div>
  );
};

export const EmptyValue: Story = {
  render: () => <EmptyValueDemo />,
};

export const Disabled: Story = {
  args: { value: 'SKU-BOX-001', disabled: true },
};

const CustomDisplayDemo = () => {
  const [price, setPrice] = useState('45.50');
  const formatBaht = (value: string) => {
    const n = Number(value);
    return Number.isNaN(n) ? value : `฿${n.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;
  };
  return (
    <div className="text-sm">
      <InlineEdit
        value={price}
        onSave={setPrice}
        renderDisplay={(v) => <span className="font-medium tabular-nums">{formatBaht(v)}</span>}
      />
    </div>
  );
};

export const CustomDisplay: Story = {
  render: () => <CustomDisplayDemo />,
};

interface StockRow {
  sku: string;
  name: string;
  location: string;
}

const StockTableDemo = () => {
  const [rows, setRows] = useState<StockRow[]>([
    { sku: 'SKU-001', name: 'กล่องไปรษณีย์ เบอร์ 0', location: 'A-01' },
    { sku: 'SKU-002', name: 'ซองกันกระแทก 9×12 นิ้ว', location: 'B-03' },
    { sku: 'SKU-003', name: 'เทปกาวใส 2 นิ้ว 100 หลา', location: 'C-07' },
  ]);
  const update = (sku: string, patch: Partial<StockRow>) =>
    setRows((prev) => prev.map((r) => (r.sku === sku ? { ...r, ...patch } : r)));
  return (
    <table className="w-full max-w-lg text-sm">
      <thead>
        <tr className="border-b border-border text-left text-xs text-muted-foreground">
          <th className="px-2 py-2 font-medium">รหัส</th>
          <th className="px-2 py-2 font-medium">ชื่อสินค้า (แก้ไขได้)</th>
          <th className="px-2 py-2 font-medium">ตำแหน่งจัดเก็บ (แก้ไขได้)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.sku} className="border-b border-divider">
            <td className="px-2 py-2 font-mono text-muted-foreground">{row.sku}</td>
            <td className="px-2 py-2">
              <InlineEdit value={row.name} onSave={(v) => update(row.sku, { name: v })} />
            </td>
            <td className="px-2 py-2">
              <InlineEdit value={row.location} onSave={(v) => update(row.sku, { location: v })} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const StockTableExample: Story = {
  render: () => <StockTableDemo />,
};
