import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { QuantityStepper } from './index';

const meta = {
  title: 'Design System/Inputs/QuantityStepper',
  component: QuantityStepper,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['middle', 'large'] },
  },
} satisfies Meta<typeof QuantityStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: 1 },
};

/** ปุ่ม 44px — ใช้บนจอ Operator/Warehouse ตาม UX bar */
export const Large: Story = {
  args: { value: 3, size: 'large', label: 'จำนวนแพ็ค' },
};

/** ปุ่ม − ถูก disable เมื่อถึง min แล้ว */
export const AtMin: Story = {
  args: { value: 0 },
};

/** ปุ่ม + ถูก disable เมื่อถึง max แล้ว */
export const AtMax: Story = {
  args: { value: 10, max: 10 },
};

export const StepBy5: Story = {
  args: { value: 10, step: 5 },
};

export const Disabled: Story = {
  args: { value: 5, disabled: true },
};

const ControlledDemo = () => {
  const [pack, setPack] = useState(2);
  const [carton, setCarton] = useState(0);
  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center gap-3">
        <span className="w-20 text-sm">แพ็ค</span>
        <QuantityStepper size="large" label="จำนวนแพ็ค" value={pack} onChange={setPack} />
      </label>
      <label className="flex items-center gap-3">
        <span className="w-20 text-sm">ลัง</span>
        <QuantityStepper size="large" label="จำนวนลัง" value={carton} onChange={setCarton} />
      </label>
      <div className="text-sm text-muted-foreground">
        รวม {pack + carton} หน่วย
      </div>
    </div>
  );
};

/** เหมือนที่ใช้จริงในตารางหน้าบันทึกออเดอร์ */
export const OrderRow: StoryObj = {
  render: () => <ControlledDemo />,
};
