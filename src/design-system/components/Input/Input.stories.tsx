import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppIcons } from '../../icons';
import { Input, InputPassword, InputSearch, TextArea } from './index';

const meta = {
  title: 'Design System/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { placeholder: 'เช่น กล่องไปรษณีย์ เบอร์ 0' },
  argTypes: {
    size: { control: 'select', options: ['small', 'middle', 'large'] },
    status: { control: 'select', options: ['error', 'warning'] },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPrefix: Story = {
  args: { prefix: <AppIcons.search />, placeholder: 'ค้นหาสินค้า ชื่อ หรือ SKU…' },
};

export const WithSuffix: Story = {
  args: { suffix: <AppIcons.barcode />, placeholder: 'สแกนบาร์โค้ดสินค้า' },
};

export const WithAddons: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-3">
      <Input addonBefore="SKU-" placeholder="00123" />
      <Input addonAfter="@slj.co.th" placeholder="somchai" />
    </div>
  ),
};

const AllowClearDemo = () => {
  const [value, setValue] = useState('กล่องไปรษณีย์ เบอร์ 0');
  return (
    <div className="max-w-sm">
      <Input
        allowClear
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="พิมพ์ชื่อสินค้า…"
      />
    </div>
  );
};

export const AllowClear: Story = {
  render: () => <AllowClearDemo />,
};

export const Password: Story = {
  render: () => (
    <div className="max-w-sm">
      <InputPassword placeholder="รหัสผ่านพนักงาน" prefix={<AppIcons.lock />} />
    </div>
  ),
};

export const Search: Story = {
  render: () => (
    <div className="max-w-sm">
      <InputSearch prefix={<AppIcons.search />} placeholder="ค้นหาออเดอร์ Shopee / Lazada / TikTok…" allowClear />
    </div>
  ),
};

export const Multiline: Story = {
  render: () => (
    <div className="max-w-sm">
      <TextArea rows={4} placeholder="หมายเหตุการจัดส่ง เช่น ฝากไว้ที่ป้อมยาม…" />
    </div>
  ),
};

export const ErrorStatus: Story = {
  args: { status: 'error', defaultValue: 'SKU-00123', placeholder: 'รหัสสินค้า' },
};

export const WarningStatus: Story = {
  args: { status: 'warning', defaultValue: '08123456', placeholder: 'เบอร์โทรซัพพลายเออร์' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'PROD-00123 (แก้ไขไม่ได้)' },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-3">
      <Input size="small" placeholder="small — ค้นหาในตาราง" />
      <Input size="middle" placeholder="middle — ฟอร์มทั่วไป" />
      <Input size="large" placeholder="large — หน้าจอสแกนสินค้า" />
    </div>
  ),
};

/** ตัวอย่างจริง: สแกน SKU เข้ารายการรับสต็อก — กด Enter เพื่อเพิ่มรายการ */
const ScanReceiveDemo = () => {
  const [value, setValue] = useState('');
  const [items, setItems] = useState<string[]>(['SLJ-BOX-00', 'SLJ-BOX-0']);
  return (
    <div className="flex max-w-sm flex-col gap-3">
      <Input
        prefix={<AppIcons.barcode />}
        allowClear
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onPressEnter={() => {
          const sku = value.trim();
          if (!sku) return;
          setItems((prev) => [...prev, sku]);
          setValue('');
        }}
        placeholder="สแกนหรือพิมพ์ SKU แล้วกด Enter"
      />
      <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
        {items.map((sku, i) => (
          <li key={`${sku}-${i}`} className="flex items-center gap-2">
            <AppIcons.check className="text-success" /> {sku}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const ScanReceiveExample: Story = {
  render: () => <ScanReceiveDemo />,
};
