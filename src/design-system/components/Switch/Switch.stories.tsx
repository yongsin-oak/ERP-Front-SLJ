import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Switch } from './index';

const meta = {
  title: 'Design System/Switch',
  component: Switch,
  tags: ['autodocs'],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { checked: true, disabled: true } };
export const Small: Story = { args: { size: 'small', defaultChecked: true } };

export const WithLabels: Story = {
  render: () => {
    const [on, setOn] = useState(true);
    return <Switch checked={on} onChange={setOn} checkedChildren="ใช้งาน" unCheckedChildren="ปิดใช้งาน" />;
  },
};

export const Controlled: Story = {
  render: () => {
    const [on, setOn] = useState(false);
    return (
      <div className="flex items-center gap-3">
        <Switch checked={on} onChange={setOn} />
        <span className="text-sm">{on ? 'เปิด' : 'ปิด'}</span>
      </div>
    );
  },
};
