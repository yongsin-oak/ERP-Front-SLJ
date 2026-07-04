import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text, Title, PageTitle, TEXT_SIZE, type TextSize } from './index';

const meta = {
  title: 'Design System/Typography',
  component: Text,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { children: 'กล่องไปรษณีย์ เบอร์ 0' },
  argTypes: {
    size: { control: 'select', options: Object.keys(TEXT_SIZE) },
    type: { control: 'select', options: ['secondary', 'success', 'warning', 'danger'] },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const SIZES: TextSize[] = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl'];

export const TextSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {SIZES.map((s) => (
        <Text key={s} size={s}>
          {s} ({TEXT_SIZE[s]}px) — ยอดขายรวมวันนี้ 51,370 บาท
        </Text>
      ))}
    </div>
  ),
};

export const TextTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Text>ค่าเริ่มต้น — กล่องไปรษณีย์ เบอร์ 0</Text>
      <Text type="secondary">secondary — อัปเดตสต็อกล่าสุด 14:30 น.</Text>
      <Text type="success">success — มีสต็อก (1,250 ชิ้น)</Text>
      <Text type="warning">warning — สต็อกใกล้หมด (เหลือ 45 ชิ้น)</Text>
      <Text type="danger">danger — สินค้าหมดสต็อก</Text>
    </div>
  ),
};

export const Strong: Story = {
  render: () => (
    <Text>
      ออเดอร์ Shopee #SP-240701-0042 มียอดรวม <Text strong>1,240.50 บาท</Text> (3 รายการ)
    </Text>
  ),
};

export const Code: Story = {
  render: () => (
    <Text>
      รหัสสินค้า <Text code>SLJ-BOX-0001</Text> ผูกกับบาร์โค้ด <Text code>8850123456789</Text>
    </Text>
  ),
};

export const Ellipsis: Story = {
  render: () => (
    <div className="w-48 rounded-md border border-border p-2">
      <Text ellipsis>
        ซองไปรษณีย์พลาสติกกันน้ำ สีขาวขุ่น ขนาด 28×42 ซม. แพ็ก 100 ใบ สำหรับส่ง Shopee/Lazada
      </Text>
      <Text size="xs" type="secondary">
        กว้าง 12rem — ชี้เมาส์ที่ข้อความเพื่อดูชื่อเต็ม (title)
      </Text>
    </div>
  ),
};

export const Copyable: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Text copyable>SLJ-BOX-0001</Text>
      <Text copyable type="secondary">
        TH1234567890 (เลขพัสดุ Lazada)
      </Text>
    </div>
  ),
};

export const TitleLevels: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Title level={1}>ระดับ 1 — ภาพรวมคลังสินค้า</Title>
      <Title level={2}>ระดับ 2 — สต็อกคงเหลือรายคลัง</Title>
      <Title level={3}>ระดับ 3 — คลังสำเพ็ง 2</Title>
      <Title level={4}>ระดับ 4 — หมวดกล่องพัสดุ</Title>
      <Title level={5}>ระดับ 5 — กล่องไปรษณีย์ เบอร์ 0</Title>
    </div>
  ),
};

export const PageTitleExample: Story = {
  render: () => (
    <div className="flex flex-col gap-1">
      <PageTitle>รายการออเดอร์ Shopee</PageTitle>
      <Text size="sm" type="secondary">
        PageTitle ใช้เป็นหัวข้อหลักของทุกหน้า (เทียบเท่า Title level 4)
      </Text>
    </div>
  ),
};
