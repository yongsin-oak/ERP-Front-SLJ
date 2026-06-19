import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button';
import { Card } from './index';

const meta = {
  title: 'Design System/Card',
  component: Card,
  tags: ['autodocs'],
  args: { children: 'เนื้อหาภายในการ์ด' },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { style: { width: 320 } } };

export const WithTitle: Story = {
  args: { title: 'ข้อมูลสินค้า', style: { width: 320 } },
};

export const WithExtra: Story = {
  args: {
    title: 'รายการล่าสุด',
    extra: <Button variant="link" size="small">ดูทั้งหมด</Button>,
    style: { width: 360 },
  },
};

export const Small: Story = {
  args: { size: 'small', title: 'สรุป', style: { width: 280 } },
};
