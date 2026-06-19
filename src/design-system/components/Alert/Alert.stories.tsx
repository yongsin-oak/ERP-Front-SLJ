import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from './index';

const meta = {
  title: 'Design System/Alert',
  component: Alert,
  tags: ['autodocs'],
  args: { type: 'info', message: 'ข้อความแจ้งเตือน', showIcon: true },
  argTypes: {
    type: { control: 'select', options: ['success', 'info', 'warning', 'error'] },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {};
export const Success: Story = { args: { type: 'success', message: 'สินค้าทุกรายการมีเพียงพอ' } };
export const Warning: Story = { args: { type: 'warning', message: 'สต็อกใกล้หมด' } };
export const ErrorAlert: Story = { args: { type: 'error', message: 'ไม่พบรายการนับสต็อกนี้' } };

export const WithDescription: Story = {
  args: {
    type: 'warning',
    message: 'การปรับสต็อกเป็นการตั้งค่าจำนวนจริง',
    description: 'ระบบจะคำนวณส่วนต่างจากจำนวนคงเหลือปัจจุบันให้อัตโนมัติ',
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Alert type="success" message="สำเร็จ" showIcon />
      <Alert type="info" message="ข้อมูล" showIcon />
      <Alert type="warning" message="คำเตือน" showIcon />
      <Alert type="error" message="ผิดพลาด" showIcon />
    </div>
  ),
};
