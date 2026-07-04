import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button';
import { AppIcons } from '../../icons';
import { PageHeader } from './index';

const meta = {
  title: 'Design System/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  args: { title: 'สินค้า' },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TitleOnly: Story = {
  args: { title: 'แดชบอร์ดภาพรวม' },
};

export const WithSubtitle: Story = {
  args: {
    title: 'สต็อกสินค้า',
    subtitle: 'อัปเดตล่าสุด 5 นาทีที่แล้ว · 1,248 รายการ',
  },
};

export const WithActions: Story = {
  args: {
    title: 'สินค้า',
    subtitle: 'จัดการสินค้าและราคาขายทุกช่องทาง (Shopee / Lazada / หน้าร้าน)',
    actions: (
      <>
        <Button variant="secondary" icon={<AppIcons.exportFile />}>ส่งออก Excel</Button>
        <Button variant="primary" icon={<AppIcons.add />}>เพิ่มสินค้า</Button>
      </>
    ),
  },
};

export const LongTitleNarrow: Story = {
  args: {
    title: 'รายงานสรุปยอดขายและกำไรแยกตามช่องทาง Shopee Lazada TikTok และหน้าร้าน ประจำเดือนกรกฎาคม',
    subtitle: 'ข้อมูลระหว่างวันที่ 1 – 31 ก.ค.',
    actions: (
      <>
        <Button variant="secondary" icon={<AppIcons.exportFile />}>ส่งออก</Button>
        <Button variant="primary" icon={<AppIcons.refresh />}>รีเฟรช</Button>
      </>
    ),
  },
  render: args => (
    <div className="w-90 rounded-lg border border-dashed border-border p-4">
      <PageHeader {...args} />
    </div>
  ),
};
