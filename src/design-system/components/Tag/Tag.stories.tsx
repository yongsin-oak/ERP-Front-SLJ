import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag, StatusTag } from './index';

const meta = {
  title: 'Design System/Tag',
  component: Tag,
  tags: ['autodocs'],
  args: { children: 'ป้ายกำกับ' },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Blue: Story = { args: { color: 'blue', children: 'Shopee' } };
export const CustomHex: Story = { args: { color: '#e0282e', children: 'Brand' } };

export const PresetColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {['red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple', 'magenta', 'default'].map((c) => (
        <Tag key={c} color={c}>{c}</Tag>
      ))}
    </div>
  ),
};

export const StatusTags: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusTag status="success">สำเร็จ</StatusTag>
      <StatusTag status="warning">รอดำเนินการ</StatusTag>
      <StatusTag status="error">ยกเลิก</StatusTag>
      <StatusTag status="info">ข้อมูล</StatusTag>
      <StatusTag status="default">ปกติ</StatusTag>
    </div>
  ),
};
