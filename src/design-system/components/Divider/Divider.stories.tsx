import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './index';

const meta = {
  title: 'Design System/Divider',
  component: Divider,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    type: { control: 'select', options: ['horizontal', 'vertical'] },
    orientation: { control: 'select', options: ['left', 'center', 'right'] },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="text-sm text-muted-foreground">
      <p>รับสต็อกเข้า: กล่องไปรษณีย์ เบอร์ 0 จำนวน 500 ชิ้น (คลังสำเพ็ง 2)</p>
      <Divider />
      <p>จ่ายสต็อกออก: ซองไปรษณีย์พลาสติก 200 ชิ้น ให้ออเดอร์ Shopee #SP-240701-0042</p>
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <div className="text-sm text-muted-foreground">
      <Divider orientation="left">ข้อมูลสินค้า</Divider>
      <p>SLJ-BOX-0001 · กล่องไปรษณีย์ เบอร์ 0 · หมวดกล่องพัสดุ</p>
      <Divider>ราคาและต้นทุน</Divider>
      <p>ราคาขาย 4.50 บาท · ต้นทุนเฉลี่ย 2.50 บาท</p>
      <Divider orientation="right">ช่องทางขาย</Divider>
      <p>หน้าร้าน · Shopee · Lazada</p>
    </div>
  ),
};

export const Dashed: Story = {
  render: () => (
    <div className="text-sm text-muted-foreground">
      <p>ยอดขายวันนี้ (หน้าร้าน): 12,450 บาท</p>
      <Divider dashed />
      <p>ยอดขายวันนี้ (Shopee): 38,920 บาท</p>
      <Divider dashed>รวมทุกช่องทาง</Divider>
      <p className="font-medium text-foreground">51,370 บาท</p>
    </div>
  ),
};

export const VerticalInline: Story = {
  render: () => (
    <div className="text-sm">
      <span className="text-primary">ดูรายละเอียด</span>
      <Divider type="vertical" />
      <span className="text-primary">แก้ไข</span>
      <Divider type="vertical" />
      <span className="text-destructive">ลบ</span>
    </div>
  ),
};

export const Plain: Story = {
  render: () => (
    <div className="text-sm text-muted-foreground">
      <p>ออเดอร์ที่แพ็กแล้ววันนี้ 86 รายการ</p>
      <Divider plain>อัปเดตล่าสุด 14:30 น.</Divider>
      <p>ออเดอร์ที่รอแพ็ก 42 รายการ</p>
    </div>
  ),
};
