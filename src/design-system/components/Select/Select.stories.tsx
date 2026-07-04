import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './index';
import type { SelectOption } from './index';

const PLATFORM_OPTIONS = [
  { label: 'Shopee', value: 'shopee' },
  { label: 'Lazada', value: 'lazada' },
  { label: 'TikTok Shop', value: 'tiktok' },
  { label: 'หน้าร้าน', value: 'offline' },
];

const SUPPLIER_OPTIONS = [
  { label: 'โรงงานกล่องไทยแพ็ค', value: 'sup-01' },
  { label: 'บจก.ซองด่วนไทย', value: 'sup-02' },
  { label: 'หจก.เทปกาวรุ่งเรือง', value: 'sup-03' },
  { label: 'โรงงานบับเบิ้ลเซฟตี้แพ็ค', value: 'sup-04' },
  { label: 'บจก.สติ๊กเกอร์สยาม', value: 'sup-05' },
];

const CATEGORY_GROUPS = [
  {
    label: 'กล่องไปรษณีย์',
    options: [
      { label: 'กล่อง เบอร์ 00 (9.75×14×6 ซม.)', value: 'box-00' },
      { label: 'กล่อง เบอร์ 0 (11×17×6 ซม.)', value: 'box-0' },
      { label: 'กล่อง เบอร์ A (14×20×6 ซม.)', value: 'box-a' },
      { label: 'กล่อง เบอร์ 2B (25×35×14 ซม.)', value: 'box-2b' },
    ],
  },
  {
    label: 'ซองไปรษณีย์',
    options: [
      { label: 'ซองพลาสติก 25×35 ซม.', value: 'env-plastic' },
      { label: 'ซองกันกระแทก 18×23 ซม.', value: 'env-bubble' },
    ],
  },
  {
    label: 'อุปกรณ์แพ็ค',
    options: [
      { label: 'เทปใส 45 หลา', value: 'tape-clear', disabled: true },
      { label: 'บับเบิ้ลกันกระแทก 65×100 ม.', value: 'bubble-roll' },
    ],
  },
];

const meta = {
  title: 'Design System/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { options: PLATFORM_OPTIONS, placeholder: 'เลือกช่องทางขาย' },
  argTypes: {
    size: { control: 'select', options: ['small', 'middle', 'large'] },
    status: { control: 'select', options: ['error', 'warning'] },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDefaultValue: Story = {
  args: { defaultValue: 'shopee' },
};

export const AllowClear: Story = {
  args: { allowClear: true, defaultValue: 'lazada' },
};

export const WithSearch: Story = {
  args: { options: SUPPLIER_OPTIONS, showSearch: true, placeholder: 'ค้นหาซัพพลายเออร์…' },
};

/** showSearch แบบ object — กำหนด filterOption เอง (ตัดคำนำหน้า บจก./หจก./โรงงาน ออกก่อนค้นหา) */
export const SearchCustomFilter: Story = {
  args: {
    options: SUPPLIER_OPTIONS,
    placeholder: 'พิมพ์ชื่อซัพพลายเออร์ (ไม่ต้องพิมพ์คำนำหน้า)…',
    showSearch: {
      filterOption: (input, option) => {
        const label = typeof option?.label === 'string' ? option.label : '';
        const q = input.trim().toLowerCase();
        if (!q) return true;
        const stripped = label.replace(/^(บจก\.|หจก\.|โรงงาน)\s*/, '');
        return label.toLowerCase().includes(q) || stripped.toLowerCase().includes(q);
      },
    },
  },
};

export const GroupedOptions: Story = {
  args: { options: CATEGORY_GROUPS, showSearch: true, placeholder: 'เลือกสินค้า' },
};

export const Loading: Story = {
  args: { loading: true, placeholder: 'กำลังโหลดรายชื่อซัพพลายเออร์…' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'shopee' },
};

export const ErrorStatus: Story = {
  args: { status: 'error', placeholder: 'กรุณาเลือกคลังสินค้า' },
};

export const NotFound: Story = {
  args: {
    options: [],
    showSearch: true,
    placeholder: 'ค้นหาสินค้า…',
    notFoundContent: 'ไม่พบสินค้า — ตรวจสอบชื่อหรือ SKU อีกครั้ง',
  },
};

/** ตัวอย่างจริง: เลือกคลังสินค้าก่อน แล้วจึงเลือกโซนภายในคลังนั้น */
const WAREHOUSE_OPTIONS = [
  { label: 'คลังสำนักงานใหญ่ (บางนา)', value: 'wh-hq' },
  { label: 'คลังสาขาสมุทรปราการ', value: 'wh-sp' },
];

const ZONE_OPTIONS: Record<string, SelectOption[] | undefined> = {
  'wh-hq': [
    { label: 'โซน A — กล่องไปรษณีย์', value: 'a' },
    { label: 'โซน B — ซองไปรษณีย์', value: 'b' },
    { label: 'โซน C — อุปกรณ์แพ็ค', value: 'c' },
  ],
  'wh-sp': [{ label: 'โซนรวม (ยังไม่แบ่งหมวด)', value: 'all' }],
};

const DependentDemo = () => {
  const [warehouse, setWarehouse] = useState<string | undefined>(undefined);
  const [zone, setZone] = useState<string | undefined>(undefined);
  const zoneOptions = warehouse ? (ZONE_OPTIONS[warehouse] ?? []) : [];
  return (
    <div className="flex max-w-lg gap-3">
      <Select
        className="flex-1"
        options={WAREHOUSE_OPTIONS}
        value={warehouse}
        onChange={(v) => {
          setWarehouse(v);
          setZone(undefined);
        }}
        placeholder="เลือกคลังสินค้า"
        allowClear
      />
      <Select
        className="flex-1"
        options={zoneOptions}
        value={zone}
        onChange={setZone}
        placeholder="เลือกโซนจัดเก็บ"
        disabled={!warehouse}
        notFoundContent="คลังนี้ยังไม่มีโซนจัดเก็บ"
      />
    </div>
  );
};

export const DependentSelectsExample: Story = {
  render: () => <DependentDemo />,
};
