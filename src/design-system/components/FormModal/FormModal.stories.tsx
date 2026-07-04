import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppIcons } from '../../icons';
import { FormModal } from './index';
import { Form } from '../Form';
import { Input } from '../Input';
import { InputNumber } from '../InputNumber';
import { Select } from '../Select';
import { Button } from '../Button';

const NOOP = () => undefined;

const meta = {
  title: 'Design System/FormModal',
  component: FormModal,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  // FormModal ต้องการ FormInstance จาก Form.useForm() (hook) — ทุก story จึง render
  // ผ่าน demo component ที่สร้าง form จริงเอง; args ชุดนี้เป็น placeholder ให้ผ่าน
  // การเช็ค required-args ของ Storybook เท่านั้น ไม่ได้ถูกใช้ render จริง
  args: {
    open: false,
    title: 'ตัวอย่าง',
    onClose: NOOP,
    onFinish: NOOP,
    form: undefined,
    children: null,
  },
} satisfies Meta<typeof FormModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const FAKE_SAVE_MS = 800;
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// ── สร้างซัพพลายเออร์ใหม่ ────────────────────────────────────────────────────────

type SupplierFormValues = {
  name: string;
  phone?: string;
  province: string;
};

const PROVINCE_OPTIONS = [
  { label: 'กรุงเทพมหานคร', value: 'bangkok' },
  { label: 'สมุทรปราการ', value: 'samut-prakan' },
  { label: 'นนทบุรี', value: 'nonthaburi' },
  { label: 'ปทุมธานี', value: 'pathum-thani' },
];

const CreateSupplierDemo = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<SupplierFormValues | null>(null);
  const [form] = Form.useForm<SupplierFormValues>();

  async function handleFinish(values: SupplierFormValues) {
    setLoading(true);
    await delay(FAKE_SAVE_MS); // จำลองการเรียก API สร้างซัพพลายเออร์
    setLoading(false);
    setSaved(values);
    setOpen(false);
  }

  return (
    <div className="flex flex-col items-start gap-4">
      <Button variant="primary" icon={<AppIcons.add />} onClick={() => setOpen(true)}>
        เพิ่มซัพพลายเออร์
      </Button>
      {saved && (
        <pre className="max-w-sm overflow-x-auto rounded-md bg-muted p-3 text-xs text-foreground">
          {JSON.stringify(saved, null, 2)}
        </pre>
      )}
      <FormModal
        open={open}
        onClose={() => setOpen(false)}
        title="เพิ่มซัพพลายเออร์"
        form={form}
        onFinish={handleFinish}
        loading={loading}
        submitLabel="เพิ่มซัพพลายเออร์"
      >
        <Form form={form} className="mt-4">
          <Form.Item
            name="name"
            label="ชื่อซัพพลายเออร์"
            rules={[{ required: true, message: 'กรุณากรอกชื่อซัพพลายเออร์' }]}
          >
            <Input placeholder="เช่น โรงงานกล่องไทยแพ็ค" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="เบอร์โทร"
            rules={[{ pattern: /^0\d{8,9}$/, message: 'เบอร์โทรไม่ถูกต้อง เช่น 021234567' }]}
          >
            <Input placeholder="021234567" />
          </Form.Item>
          <Form.Item name="province" label="จังหวัด" rules={[{ required: true, message: 'กรุณาเลือกจังหวัด' }]}>
            <Select options={PROVINCE_OPTIONS} placeholder="เลือกจังหวัด" showSearch />
          </Form.Item>
        </Form>
      </FormModal>
    </div>
  );
};

export const Default: Story = {
  render: () => <CreateSupplierDemo />,
};

// ── โหมดแก้ไข: initialValues + loading ระหว่างบันทึก ─────────────────────────────

type ShopPriceValues = {
  shopee: number;
  lazada: number;
  tiktok: number;
};

const PRICE_INITIAL: Partial<ShopPriceValues> = {
  shopee: 4.5,
  lazada: 4.75,
  tiktok: 4.25,
};

const EditPricesDemo = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<ShopPriceValues | null>(null);
  const [form] = Form.useForm<ShopPriceValues>();

  async function handleFinish(values: ShopPriceValues) {
    setLoading(true);
    await delay(FAKE_SAVE_MS); // จำลองการเรียก API อัปเดตราคา
    setLoading(false);
    setSaved(values);
    setOpen(false);
  }

  return (
    <div className="flex flex-col items-start gap-4">
      <Button variant="secondary" icon={<AppIcons.edit />} onClick={() => setOpen(true)}>
        แก้ไขราคาขายรายช่องทาง
      </Button>
      {saved && (
        <pre className="max-w-sm overflow-x-auto rounded-md bg-muted p-3 text-xs text-foreground">
          {JSON.stringify(saved, null, 2)}
        </pre>
      )}
      <FormModal
        open={open}
        onClose={() => setOpen(false)}
        title="แก้ไขราคาขาย — กล่องไปรษณีย์ เบอร์ 0"
        form={form}
        onFinish={handleFinish}
        loading={loading}
        width={420}
        submitLabel="บันทึกราคา"
      >
        <Form form={form} initialValues={PRICE_INITIAL} className="mt-4">
          <Form.Item name="shopee" label="ราคา Shopee (บาท)" rules={[{ required: true, message: 'กรุณากรอกราคา' }]}>
            <InputNumber min={0} precision={2} prefix="฿" />
          </Form.Item>
          <Form.Item name="lazada" label="ราคา Lazada (บาท)" rules={[{ required: true, message: 'กรุณากรอกราคา' }]}>
            <InputNumber min={0} precision={2} prefix="฿" />
          </Form.Item>
          <Form.Item name="tiktok" label="ราคา TikTok Shop (บาท)" rules={[{ required: true, message: 'กรุณากรอกราคา' }]}>
            <InputNumber min={0} precision={2} prefix="฿" />
          </Form.Item>
        </Form>
      </FormModal>
    </div>
  );
};

export const EditWithInitialValues: Story = {
  render: () => <EditPricesDemo />,
};
