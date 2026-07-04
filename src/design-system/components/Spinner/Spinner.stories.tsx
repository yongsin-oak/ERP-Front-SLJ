import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './index';

const meta = {
  title: 'Design System/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['small', 'default', 'large'] },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      <div className="text-center">
        <Spinner size="small" className="p-4" />
        <p className="text-xs text-muted-foreground">small</p>
      </div>
      <div className="text-center">
        <Spinner size="default" className="p-4" />
        <p className="text-xs text-muted-foreground">default</p>
      </div>
      <div className="text-center">
        <Spinner size="large" className="p-4" />
        <p className="text-xs text-muted-foreground">large</p>
      </div>
    </div>
  ),
};

export const WithTip: Story = {
  args: { tip: 'กำลังโหลดรายการสินค้า…' },
};

export const FullAreaOverlay: Story = {
  render: () => (
    <div className="relative h-64 w-full max-w-md overflow-hidden rounded-lg border border-border bg-card">
      <div className="p-4 text-sm">
        <p className="mb-2 font-semibold">สต็อกคงเหลือ — คลังสำเพ็ง 2</p>
        <ul className="flex flex-col gap-1 text-muted-foreground">
          <li>กล่องไปรษณีย์ เบอร์ 0 — 1,250 ชิ้น</li>
          <li>ซองไปรษณีย์พลาสติก 28×42 ซม. — 8,400 ชิ้น</li>
          <li>เทปกาวใส 2 นิ้ว 100 หลา — 320 ม้วน</li>
          <li>กล่องไปรษณีย์ เบอร์ 2B — 940 ใบ</li>
        </ul>
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/70">
        <Spinner size="large" tip="กำลังซิงก์ออเดอร์จาก Shopee…" className="p-0" />
      </div>
    </div>
  ),
};
