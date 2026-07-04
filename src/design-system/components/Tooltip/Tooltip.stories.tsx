import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppIcons } from '../../icons';
import { Button } from '../Button';
import { Tooltip, type TooltipPlacement } from './index';

const meta = {
  title: 'Design System/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    title: 'ดูรายละเอียดสินค้า',
    children: <Button variant="secondary">ชี้เมาส์ที่ปุ่มนี้</Button>,
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const PLACEMENTS: TooltipPlacement[] = [
  'topLeft',
  'top',
  'topRight',
  'left',
  'right',
  'bottomLeft',
  'bottom',
  'bottomRight',
];

export const Placements: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-3 p-16">
      {PLACEMENTS.map((p, i) => (
        <div key={p} className={i === 3 ? 'col-start-1' : i === 4 ? 'col-start-3' : undefined}>
          <Tooltip title={`สต็อกคงเหลือ 1,250 ชิ้น (${p})`} placement={p}>
            <Button size="small" block>
              {p}
            </Button>
          </Tooltip>
        </div>
      ))}
    </div>
  ),
};

export const OnIconButton: Story = {
  render: () => (
    <div className="flex items-center gap-1">
      <Tooltip title="ดูรายละเอียดออเดอร์">
        <Button variant="ghost" icon={<AppIcons.view />} aria-label="ดูรายละเอียดออเดอร์" />
      </Tooltip>
      <Tooltip title="แก้ไขสินค้า">
        <Button variant="ghost" icon={<AppIcons.edit />} aria-label="แก้ไขสินค้า" />
      </Tooltip>
      <Tooltip title="ลบสินค้าออกจากคลัง">
        <Button variant="ghost" icon={<AppIcons.delete />} aria-label="ลบสินค้าออกจากคลัง" />
      </Tooltip>
    </div>
  ),
};

export const LongText: Story = {
  render: () => (
    <Tooltip
      title="สินค้านี้ผูกกับออเดอร์ Shopee และ Lazada ที่ยังไม่ปิดรายการอยู่ 12 ออเดอร์ หากปรับสต็อกตอนนี้ ระบบจะซิงก์จำนวนคงเหลือใหม่ไปทุกช่องทางขายภายใน 5 นาที"
      placement="bottom"
    >
      <Button variant="secondary" icon={<AppIcons.alert />}>
        ทำไมปรับสต็อกไม่ได้?
      </Button>
    </Tooltip>
  ),
};
