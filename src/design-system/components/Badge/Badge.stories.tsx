import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './index';

const meta = {
  title: 'Design System/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { status: 'success', text: 'ใช้งาน' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {};
export const Inactive: Story = { args: { status: 'default', text: 'ปิดใช้งาน' } };

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Badge status="success" text="สำเร็จ" />
      <Badge status="processing" text="กำลังดำเนินการ" />
      <Badge status="warning" text="เตือน" />
      <Badge status="error" text="ผิดพลาด" />
      <Badge status="default" text="ปิดใช้งาน" />
    </div>
  ),
};
