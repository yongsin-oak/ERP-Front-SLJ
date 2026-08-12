import type { Meta, StoryObj } from '@storybook/react-vite';
import { Banner } from './index';
import { Button } from '../Button';

const meta = {
  title: 'Design System/Feedback/Banner',
  component: Banner,
  tags: ['autodocs'],
  args: { type: 'info', message: 'ระบบกำลังทำงานในโหมดออฟไลน์' },
  argTypes: {
    type: { control: 'select', options: ['success', 'info', 'warning', 'error'] },
  },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {};

export const Warning: Story = {
  args: {
    type: 'warning',
    message: 'สิทธิ์การใช้งานจะหมดอายุใน 3 วัน',
    action: <Button variant="link" size="small">ต่ออายุ</Button>,
  },
};

export const Closable: Story = {
  args: {
    type: 'info',
    message: 'มีข้อมูลที่กรอกค้างอยู่',
    description: 'กดล้างเพื่อเริ่มกรอกใหม่ตั้งแต่ต้น',
    closable: true,
    action: <Button variant="link" size="small">ล้างและเริ่มใหม่</Button>,
  },
};

export const OfflineMode: Story = {
  args: { type: 'error', message: 'ขาดการเชื่อมต่อ — กำลังลองเชื่อมต่อใหม่...' },
};
