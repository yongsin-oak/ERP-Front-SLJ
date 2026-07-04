import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Radio } from './index';

const PAYMENT_OPTIONS = [
  { label: 'เก็บเงินปลายทาง (COD)', value: 'cod' },
  { label: 'โอนเงินผ่านธนาคาร', value: 'transfer' },
  { label: 'บัตรเครดิต', value: 'credit' },
];

const meta = {
  title: 'Design System/Radio',
  component: Radio.Group,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { options: PAYMENT_OPTIONS, defaultValue: 'cod' },
} satisfies Meta<typeof Radio.Group>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** ใช้ children แทน options — เหมาะเมื่อ label ต้องมี markup เพิ่มเติม */
export const WithChildren: Story = {
  render: () => (
    <Radio.Group defaultValue="platform">
      <Radio value="storefront">ตัดสต็อกขายหน้าร้าน</Radio>
      <Radio value="platform">ตัดสต็อกส่งแพลตฟอร์ม</Radio>
      <Radio value="damaged">ตัดสต็อกของเสียหาย</Radio>
    </Radio.Group>
  ),
};

export const Vertical: Story = {
  args: { className: 'flex-col items-start', defaultValue: 'transfer' },
};

export const DisabledGroup: Story = {
  args: { disabled: true, defaultValue: 'cod' },
};

export const DisabledOption: Story = {
  args: {
    options: [
      { label: 'เก็บเงินปลายทาง (COD)', value: 'cod' },
      { label: 'โอนเงินผ่านธนาคาร', value: 'transfer' },
      { label: 'บัตรเครดิต (ปิดปรับปรุงชั่วคราว)', value: 'credit', disabled: true },
    ],
    defaultValue: 'transfer',
  },
};

/** ตัวอย่างจริง: เลือกขนส่งของออเดอร์ — ควบคุมค่าจากภายนอกและแสดงผลที่เลือก */
const SHIPPING_OPTIONS = [
  { label: 'Flash Express', value: 'flash' },
  { label: 'Kerry Express', value: 'kerry' },
  { label: 'ไปรษณีย์ไทย (EMS)', value: 'ems' },
  { label: 'J&T Express', value: 'jnt' },
];

const ControlledDemo = () => {
  const [carrier, setCarrier] = useState('flash');
  const selected = SHIPPING_OPTIONS.find((s) => s.value === carrier);
  return (
    <div className="flex max-w-md flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground">เลือกขนส่ง — ออเดอร์ #SLJ-2026-04512</h3>
      <Radio.Group
        options={SHIPPING_OPTIONS}
        value={carrier}
        onChange={(e) => setCarrier(e.target.value)}
        className="flex-col items-start"
      />
      <p className="text-sm text-muted-foreground">ขนส่งที่เลือก: {selected?.label ?? '—'}</p>
    </div>
  );
};

export const ControlledExample: Story = {
  render: () => <ControlledDemo />,
};
