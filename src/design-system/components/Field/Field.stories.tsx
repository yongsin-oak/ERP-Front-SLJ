import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconSearch, IconMail } from '@tabler/icons-react';
import { TextField, TextareaField } from './index';

const meta = {
  title: 'Design System/TextField',
  component: TextField,
  tags: ['autodocs'],
  args: { label: 'ชื่อสินค้า', placeholder: 'เช่น กล่องไปรษณีย์ เบอร์ 0' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHint: Story = {
  args: { hint: 'ชื่อที่ลูกค้าจะเห็นบนแพลตฟอร์ม' },
};

export const Required: Story = {
  args: { required: true, hint: 'จำเป็นต้องกรอก' },
};

export const WithError: Story = {
  args: { required: true, error: 'กรุณากรอกชื่อสินค้า', defaultValue: '' },
};

export const WithPrefix: Story = {
  args: { label: 'ราคาขาย', prefix: '฿', placeholder: '0.00', type: 'number' },
};

export const WithSuffixIcon: Story = {
  args: { label: 'ค้นหา', suffix: <IconSearch />, placeholder: 'พิมพ์เพื่อค้นหา…' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'แก้ไขไม่ได้' },
};

export const Textarea: Story = {
  render: () => (
    <TextareaField
      label="หมายเหตุ"
      hint="รายละเอียดเพิ่มเติม (ไม่บังคับ)"
      placeholder="พิมพ์หมายเหตุ…"
      rows={4}
    />
  ),
};

export const FormExample: Story = {
  render: () => (
    <div className="max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-1 text-base font-semibold text-foreground">เพิ่มผู้ใช้ใหม่</h3>
      <p className="mb-5 text-[13px] text-muted-foreground">กรอกข้อมูลให้ครบเพื่อสร้างบัญชี</p>
      <div className="flex flex-col gap-4">
        <TextField label="ชื่อ-นามสกุล" required placeholder="สมชาย ใจดี" />
        <TextField label="อีเมล" required prefix={<IconMail />} placeholder="you@slj.co.th" type="email" />
        <TextField label="ตำแหน่ง" hint="เช่น Operator, Warehouse" placeholder="ระบุตำแหน่ง" />
        <TextareaField label="หมายเหตุ" placeholder="ไม่บังคับ" rows={3} />
      </div>
    </div>
  ),
};
