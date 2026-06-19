import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconPlus } from '@tabler/icons-react';
import { Button } from './index';

const meta = {
  title: 'Design System/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'ปุ่ม' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'danger', 'danger-ghost', 'ghost', 'link'] },
    size: { control: 'select', options: ['small', 'middle', 'large'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Danger: Story = { args: { variant: 'danger', children: 'ลบ' } };
export const DangerGhost: Story = { args: { variant: 'danger-ghost', children: 'ลบ' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Link: Story = { args: { variant: 'link' } };

export const WithIcon: Story = { args: { variant: 'primary', icon: <IconPlus />, children: 'เพิ่มสินค้า' } };
export const Loading: Story = { args: { variant: 'primary', loading: true } };
export const IconOnly: Story = { args: { variant: 'ghost', icon: <IconPlus />, 'aria-label': 'add' } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="danger-ghost">Danger ghost</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button variant="primary" size="small">Small</Button>
      <Button variant="primary" size="middle">Middle</Button>
      <Button variant="primary" size="large">Large</Button>
    </div>
  ),
};
