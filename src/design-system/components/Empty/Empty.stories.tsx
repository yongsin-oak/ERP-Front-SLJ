import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppIcons } from '../../icons';
import { Button } from '../Button';
import { Empty } from './index';

const meta = {
  title: 'Design System/Empty',
  component: Empty,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomDescription: Story = {
  args: {
    description: 'ไม่พบสินค้าที่ตรงกับ “กล่องไปรษณี เบอ 0” — ลองตรวจคำสะกดหรือล้างตัวกรอง',
  },
};

export const WithAction: Story = {
  render: () => (
    <Empty description="ยังไม่มีสินค้าในคลังสำเพ็ง 2 — เริ่มต้นด้วยการเพิ่มสินค้าแรกของคุณ">
      <Button variant="primary" icon={<AppIcons.add />}>
        เพิ่มสินค้า
      </Button>
    </Empty>
  ),
};

export const CustomImage: Story = {
  render: () => (
    <Empty
      image={<AppIcons.search size={48} stroke={1.25} />}
      description="ไม่พบออเดอร์ Shopee ในช่วงวันที่เลือก"
    >
      <Button variant="ghost" icon={<AppIcons.clear />}>
        ล้างตัวกรอง
      </Button>
    </Empty>
  ),
};
