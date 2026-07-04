import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppIcons } from '../../icons';
import { Form } from './index';
import { Input } from '../Input';
import { InputNumber } from '../InputNumber';
import { Select } from '../Select';
import { Checkbox } from '../Checkbox';
import { Button } from '../Button';

const CATEGORY_OPTIONS = [
  { label: 'กล่องไปรษณีย์', value: 'box' },
  { label: 'ซองไปรษณีย์', value: 'envelope' },
  { label: 'อุปกรณ์แพ็ค', value: 'packing' },
];

const meta = {
  title: 'Design System/Form',
  component: Form,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Basic: validateFields + แสดงค่าที่กรอก ─────────────────────────────────────

type ProductFormValues = {
  name: string;
  price: number;
  category: string;
};

const BasicDemo = () => {
  const [form] = Form.useForm<ProductFormValues>();
  const [submitted, setSubmitted] = useState<ProductFormValues | null>(null);

  async function handleSave() {
    try {
      const values = await form.validateFields();
      setSubmitted(values);
    } catch {
      setSubmitted(null); // validation ไม่ผ่าน — error แสดงใต้ field แล้ว
    }
  }

  return (
    <div className="max-w-sm">
      <Form form={form}>
        <Form.Item name="name" label="ชื่อสินค้า" rules={[{ required: true, message: 'กรุณากรอกชื่อสินค้า' }]}>
          <Input placeholder="เช่น กล่องไปรษณีย์ เบอร์ 0" />
        </Form.Item>
        <Form.Item
          name="price"
          label="ราคาขาย (บาท)"
          rules={[
            { required: true, message: 'กรุณากรอกราคาขาย' },
            { type: 'number', min: 0.25, message: 'ราคาต้องไม่น้อยกว่า 0.25 บาท' },
          ]}
        >
          <InputNumber min={0} precision={2} prefix="฿" placeholder="0.00" />
        </Form.Item>
        <Form.Item name="category" label="หมวดหมู่" rules={[{ required: true, message: 'กรุณาเลือกหมวดหมู่' }]}>
          <Select options={CATEGORY_OPTIONS} placeholder="เลือกหมวดหมู่" />
        </Form.Item>
        <div className="flex gap-2">
          <Button variant="primary" onClick={handleSave}>
            บันทึกสินค้า
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              form.resetFields();
              setSubmitted(null);
            }}
          >
            ล้างฟอร์ม
          </Button>
        </div>
      </Form>
      {submitted && (
        <pre className="mt-4 overflow-x-auto rounded-md bg-muted p-3 text-xs text-foreground">
          {JSON.stringify(submitted, null, 2)}
        </pre>
      )}
    </div>
  );
};

export const Basic: Story = {
  render: () => <BasicDemo />,
};

// ── Horizontal layout + onFinish (htmlType="submit") ───────────────────────────

type EmployeeFormValues = {
  fullName: string;
  department: string;
};

const DEPARTMENT_OPTIONS = [
  { label: 'คลังสินค้า', value: 'warehouse' },
  { label: 'แพ็คสินค้า', value: 'packing' },
  { label: 'บัญชี', value: 'accounting' },
];

const HorizontalDemo = () => {
  const [form] = Form.useForm<EmployeeFormValues>();
  const [submitted, setSubmitted] = useState<EmployeeFormValues | null>(null);
  return (
    <div className="max-w-md">
      <Form form={form} layout="horizontal" onFinish={setSubmitted}>
        <Form.Item name="fullName" label="ชื่อพนักงาน" rules={[{ required: true, message: 'กรุณากรอกชื่อพนักงาน' }]}>
          <Input placeholder="สมชาย ใจดี" />
        </Form.Item>
        <Form.Item name="department" label="แผนก" rules={[{ required: true, message: 'กรุณาเลือกแผนก' }]}>
          <Select options={DEPARTMENT_OPTIONS} placeholder="เลือกแผนก" />
        </Form.Item>
        <div className="pl-35">
          <Button variant="primary" htmlType="submit">
            เพิ่มพนักงาน
          </Button>
        </div>
      </Form>
      {submitted && (
        <pre className="mt-4 overflow-x-auto rounded-md bg-muted p-3 text-xs text-foreground">
          {JSON.stringify(submitted, null, 2)}
        </pre>
      )}
    </div>
  );
};

export const HorizontalLayout: Story = {
  render: () => <HorizontalDemo />,
};

// ── Inline layout: แถบกรองข้อมูล ────────────────────────────────────────────────

type FilterValues = {
  keyword?: string;
  platform?: string;
};

const PLATFORM_OPTIONS = [
  { label: 'Shopee', value: 'shopee' },
  { label: 'Lazada', value: 'lazada' },
  { label: 'TikTok Shop', value: 'tiktok' },
];

const InlineFilterDemo = () => {
  const [form] = Form.useForm<FilterValues>();
  const [result, setResult] = useState('');
  return (
    <div className="flex flex-col gap-3">
      <Form
        form={form}
        layout="inline"
        onFinish={(v) => {
          const platform = PLATFORM_OPTIONS.find((p) => p.value === v.platform)?.label ?? 'ทุกช่องทาง';
          setResult(`ค้นหา "${v.keyword ?? ''}" ใน ${platform}`);
        }}
      >
        <Form.Item name="keyword" label="คำค้นหา">
          <Input placeholder="ชื่อสินค้า หรือ SKU" className="w-56" />
        </Form.Item>
        <Form.Item name="platform" label="ช่องทางขาย">
          <Select options={PLATFORM_OPTIONS} placeholder="ทุกช่องทาง" allowClear className="w-44" />
        </Form.Item>
        <div className="self-end">
          <Button variant="primary" htmlType="submit" icon={<AppIcons.search />}>
            ค้นหา
          </Button>
        </div>
      </Form>
      {result && <p className="text-sm text-muted-foreground">{result}</p>}
    </div>
  );
};

export const InlineFilter: Story = {
  render: () => <InlineFilterDemo />,
};

// ── Validation rules: email / pattern / len ─────────────────────────────────────

type AccountFormValues = {
  email: string;
  phone?: string;
  pin: string;
};

const RulesDemo = () => {
  const [form] = Form.useForm<AccountFormValues>();
  const [valid, setValid] = useState<boolean | null>(null);
  return (
    <div className="max-w-sm">
      <Form form={form}>
        <Form.Item
          name="email"
          label="อีเมลพนักงาน"
          rules={[
            { required: true, message: 'กรุณากรอกอีเมล' },
            { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' },
          ]}
        >
          <Input placeholder="somchai@slj.co.th" />
        </Form.Item>
        <Form.Item
          name="phone"
          label="เบอร์โทร"
          rules={[{ pattern: /^0\d{8,9}$/, message: 'เบอร์โทรไม่ถูกต้อง เช่น 0812345678' }]}
        >
          <Input placeholder="0812345678" />
        </Form.Item>
        <Form.Item
          name="pin"
          label="รหัส PIN"
          rules={[
            { required: true, message: 'กรุณากรอกรหัส PIN' },
            { len: 6, message: 'PIN ต้องมี 6 หลัก' },
          ]}
          extra="ใช้สำหรับเข้าหน้าจอ Terminal แพ็คสินค้า"
        >
          <Input type="password" placeholder="••••••" maxLength={6} />
        </Form.Item>
        <div>
          <Button
            variant="primary"
            onClick={async () => {
              try {
                await form.validateFields();
                setValid(true);
              } catch {
                setValid(false);
              }
            }}
          >
            ตรวจสอบข้อมูล
          </Button>
        </div>
      </Form>
      {valid === true && <p className="mt-3 text-sm text-success-text">ข้อมูลถูกต้อง พร้อมสร้างบัญชีพนักงาน</p>}
      {valid === false && <p className="mt-3 text-sm text-error-text">กรุณาแก้ไขข้อมูลตาม error ใต้แต่ละช่อง</p>}
    </div>
  );
};

export const ValidationRules: Story = {
  render: () => <RulesDemo />,
};

// ── initialValues (โหมดแก้ไข) + valuePropName="checked" ─────────────────────────

type EditProductValues = {
  name: string;
  price: number;
  category: string;
  isActive: boolean;
};

const EDIT_INITIAL: Partial<EditProductValues> = {
  name: 'กล่องไปรษณีย์ เบอร์ 2B (25×35×14 ซม.)',
  price: 6.5,
  category: 'box',
  isActive: true,
};

const InitialValuesDemo = () => {
  const [form] = Form.useForm<EditProductValues>();
  const [submitted, setSubmitted] = useState<EditProductValues | null>(null);
  return (
    <div className="max-w-sm">
      <Form form={form} initialValues={EDIT_INITIAL} onFinish={setSubmitted}>
        <Form.Item name="name" label="ชื่อสินค้า" rules={[{ required: true, message: 'กรุณากรอกชื่อสินค้า' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="price" label="ราคาขาย (บาท)" rules={[{ required: true, message: 'กรุณากรอกราคาขาย' }]}>
          <InputNumber min={0} precision={2} prefix="฿" />
        </Form.Item>
        <Form.Item name="category" label="หมวดหมู่" rules={[{ required: true, message: 'กรุณาเลือกหมวดหมู่' }]}>
          <Select options={CATEGORY_OPTIONS} />
        </Form.Item>
        <Form.Item name="isActive" valuePropName="checked">
          <Checkbox>เปิดขายบนทุกช่องทาง</Checkbox>
        </Form.Item>
        <div className="flex gap-2">
          <Button variant="primary" htmlType="submit" icon={<AppIcons.save />}>
            บันทึก
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              form.resetFields();
              setSubmitted(null);
            }}
          >
            รีเซ็ตเป็นค่าเดิม
          </Button>
        </div>
      </Form>
      {submitted && (
        <pre className="mt-4 overflow-x-auto rounded-md bg-muted p-3 text-xs text-foreground">
          {JSON.stringify(submitted, null, 2)}
        </pre>
      )}
    </div>
  );
};

export const InitialValuesEdit: Story = {
  render: () => <InitialValuesDemo />,
};
