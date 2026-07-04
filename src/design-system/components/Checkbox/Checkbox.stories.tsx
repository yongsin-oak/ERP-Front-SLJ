import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './index';

const PLATFORM_OPTIONS = [
  { label: 'Shopee', value: 'shopee' },
  { label: 'Lazada', value: 'lazada' },
  { label: 'TikTok Shop', value: 'tiktok' },
];

const meta = {
  title: 'Design System/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { children: 'พร้อมขาย' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DefaultChecked: Story = {
  args: { defaultChecked: true, children: 'เปิดขายบน Shopee' },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'ซิงก์สต็อกอัตโนมัติ (เร็ว ๆ นี้)' },
};

export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true, children: 'บังคับตามนโยบายบริษัท' },
};

const ControlledDemo = () => {
  const [checked, setChecked] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)}>
        ยืนยันการตรวจนับสต็อกรอบนี้แล้ว
      </Checkbox>
      <p className="text-sm text-muted-foreground">สถานะ: {checked ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน'}</p>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledDemo />,
};

export const Group: Story = {
  render: () => <Checkbox.Group options={PLATFORM_OPTIONS} defaultValue={['shopee']} />,
};

export const GroupDisabledOption: Story = {
  render: () => (
    <Checkbox.Group
      options={[
        { label: 'Shopee', value: 'shopee' },
        { label: 'Lazada', value: 'lazada' },
        { label: 'TikTok Shop (ยังไม่เชื่อมต่อ)', value: 'tiktok', disabled: true },
      ]}
      defaultValue={['shopee', 'lazada']}
    />
  ),
};

/** ตัวอย่างจริง: เลือกช่องทางขายทั้งหมด — checkbox แม่แสดงสถานะ indeterminate เมื่อเลือกบางส่วน */
const SelectAllDemo = () => {
  const [selected, setSelected] = useState<string[]>(['shopee']);
  const allChecked = selected.length === PLATFORM_OPTIONS.length;
  const partiallyChecked = selected.length > 0 && !allChecked;
  return (
    <div className="flex max-w-sm flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground">เปิดขายสินค้านี้บนช่องทาง</h3>
      <Checkbox
        checked={allChecked}
        indeterminate={partiallyChecked}
        onChange={(e) => setSelected(e.target.checked ? PLATFORM_OPTIONS.map((p) => p.value) : [])}
      >
        ทุกช่องทาง
      </Checkbox>
      <Checkbox.Group options={PLATFORM_OPTIONS} value={selected} onChange={setSelected} className="pl-6" />
      <p className="text-xs text-muted-foreground">เลือกแล้ว {selected.length} จาก {PLATFORM_OPTIONS.length} ช่องทาง</p>
    </div>
  );
};

export const SelectAllExample: Story = {
  render: () => <SelectAllDemo />,
};
