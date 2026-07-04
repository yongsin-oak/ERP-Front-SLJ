import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { SearchableSelect } from './index';

interface FakeOption {
  value: string;
  label: string;
}

const PRODUCTS: FakeOption[] = [
  { value: 'SKU-001', label: 'กล่องไปรษณีย์ เบอร์ 0 (11×17×6 ซม.)' },
  { value: 'SKU-002', label: 'กล่องไปรษณีย์ เบอร์ A (14×20×6 ซม.)' },
  { value: 'SKU-003', label: 'กล่องไปรษณีย์ เบอร์ 2B (17×25×9 ซม.)' },
  { value: 'SKU-004', label: 'ซองกันกระแทก 9×12 นิ้ว' },
  { value: 'SKU-005', label: 'เทปกาวใส 2 นิ้ว 100 หลา' },
  { value: 'SKU-006', label: 'ถุงไปรษณีย์พลาสติก 28×42 ซม.' },
  { value: 'SKU-007', label: 'ฟิล์มยืดพันพาเลท 15 ไมครอน' },
];

const FAKE_API_DELAY_MS = 400;

const searchProducts = async (query: string): Promise<FakeOption[]> => {
  await new Promise((resolve) => setTimeout(resolve, FAKE_API_DELAY_MS));
  const q = query.trim().toLowerCase();
  return PRODUCTS.filter((p) => p.label.toLowerCase().includes(q));
};

const meta = {
  title: 'Design System/SearchableSelect',
  component: SearchableSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Select แบบค้นหาจากเซิร์ฟเวอร์ — debounce 300ms แล้วเรียก onSearch (ในตัวอย่างนี้จำลอง API หน่วง 400ms กับรายการสินค้าคงที่)',
      },
    },
  },
  args: { onSearch: searchProducts },
} satisfies Meta<typeof SearchableSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: 'พิมพ์ชื่อสินค้า เช่น กล่อง…' },
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: 'พิมพ์เพื่อค้นหา…' },
};

const ControlledDemo = () => {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="flex max-w-80 flex-col gap-2">
      <SearchableSelect
        value={selected}
        onChange={setSelected}
        onSearch={searchProducts}
        placeholder="พิมพ์ชื่อสินค้าเพื่อค้นหา…"
      />
      <span className="text-sm text-muted-foreground">
        {selected ? `รหัสสินค้าที่เลือก: ${selected}` : 'ยังไม่เลือกสินค้า'}
      </span>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledDemo />,
};

const PreselectedDemo = () => {
  const [selected, setSelected] = useState<string | null>('SKU-001');
  return (
    <div className="flex max-w-80 flex-col gap-2">
      <SearchableSelect
        value={selected}
        onChange={setSelected}
        onSearch={searchProducts}
        initialLabel="กล่องไปรษณีย์ เบอร์ 0 (11×17×6 ซม.)"
      />
      <span className="text-sm text-muted-foreground">
        ค่าเริ่มต้นถูกเลือกไว้ก่อนโหลดตัวเลือก — แสดงชื่อผ่าน initialLabel
      </span>
    </div>
  );
};

export const PreselectedWithInitialLabel: Story = {
  render: () => <PreselectedDemo />,
};

const SUPPLIERS: FakeOption[] = [
  { value: 'SUP-01', label: 'บริษัท ไทยบรรจุภัณฑ์ จำกัด' },
  { value: 'SUP-02', label: 'หจก. กล่องทองการพิมพ์' },
  { value: 'SUP-03', label: 'บริษัท แพ็คดี ซัพพลาย จำกัด' },
  { value: 'SUP-04', label: 'ร้านวัสดุแพ็คของ สำเพ็ง' },
];

const searchSuppliers = async (query: string): Promise<FakeOption[]> => {
  await new Promise((resolve) => setTimeout(resolve, FAKE_API_DELAY_MS));
  const q = query.trim().toLowerCase();
  return SUPPLIERS.filter((s) => s.label.toLowerCase().includes(q));
};

const SupplierDemo = () => {
  const [supplier, setSupplier] = useState<string | null>(null);
  const selected = SUPPLIERS.find((s) => s.value === supplier);
  return (
    <div className="max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-1 text-base font-semibold text-foreground">สร้างใบสั่งซื้อ</h3>
      <p className="mb-5 text-[13px] text-muted-foreground">
        ค้นหาซัพพลายเออร์เพื่อออกใบสั่งซื้อกล่องไปรษณีย์ล็อตใหม่
      </p>
      <div className="flex flex-col gap-1">
        <span className="text-[13px] font-medium text-foreground">ซัพพลายเออร์</span>
        <SearchableSelect
          value={supplier}
          onChange={setSupplier}
          onSearch={searchSuppliers}
          placeholder="พิมพ์ชื่อบริษัท เช่น แพ็ค…"
        />
      </div>
      <div className="mt-4 border-t border-divider pt-3 text-sm">
        {selected ? (
          <div className="flex justify-between">
            <span className="text-muted-foreground">ผู้ขายที่เลือก</span>
            <span className="font-medium">{selected.label}</span>
          </div>
        ) : (
          <span className="text-foreground-subtle">ยังไม่เลือกซัพพลายเออร์</span>
        )}
      </div>
    </div>
  );
};

export const SupplierSearchExample: Story = {
  render: () => <SupplierDemo />,
};
