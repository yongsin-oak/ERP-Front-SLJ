import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ScanInput } from './index';
import { AppIcons } from '../../icons';

const meta = {
  title: 'Design System/ScanInput',
  component: ScanInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'ช่องรับค่าจากเครื่องสแกนบาร์โค้ด / QR — เครื่องสแกนจะพิมพ์รหัสเร็ว ๆ แล้วส่ง Enter ปิดท้าย ' +
          'คอมโพเนนต์จะล้างค่าและโฟกัสกลับให้อัตโนมัติหลังสแกนแต่ละครั้ง จึงยิงบาร์โค้ดต่อเนื่องได้โดยไม่ต้องคลิก',
      },
    },
  },
  args: { onScan: () => {} },
} satisfies Meta<typeof ScanInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'สแกนบาร์โค้ดสินค้า',
    hint: 'ยิงบาร์โค้ดหรือพิมพ์รหัสแล้วกด Enter',
  },
};

export const Loading: Story = {
  args: { label: 'สแกนบาร์โค้ดสินค้า', loading: true },
};

export const Disabled: Story = {
  args: { label: 'สแกนบาร์โค้ดสินค้า', disabled: true, hint: 'ปิดรับสแกนชั่วคราว' },
};

const ScanToListDemo = () => {
  const [codes, setCodes] = useState<string[]>([]);
  return (
    <div className="flex max-w-80 flex-col gap-3">
      <ScanInput
        label="สแกนสินค้าออกจากคลัง"
        hint="พิมพ์รหัส เช่น SKU-001 แล้วกด Enter เพื่อจำลองการสแกน"
        onScan={(code) => setCodes((prev) => [code, ...prev])}
      />
      <div className="rounded-md border border-border p-3 text-sm">
        <div className="mb-1.5 text-xs text-muted-foreground">
          สแกนแล้ว {codes.length} รายการ
        </div>
        {codes.length === 0 ? (
          <div className="text-foreground-subtle">ยังไม่มีรายการ</div>
        ) : (
          <ul className="flex flex-col gap-1">
            {codes.map((code, i) => (
              <li key={`${code}-${i}`} className="flex items-center gap-1.5 font-mono">
                <AppIcons.success className="size-4 shrink-0 text-success-text" />
                {code}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export const ScanToList: Story = {
  render: () => <ScanToListDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'สแกนต่อเนื่อง: หลัง Enter แต่ละครั้ง ช่องจะล้างค่าและโฟกัสกลับอัตโนมัติ (พฤติกรรม auto-refocus ในตัวคอมโพเนนต์) ' +
          'รหัสที่สแกนจะถูกเพิ่มเข้าไปในรายการด้านล่างทันที',
      },
    },
  },
};

const AsyncScanDemo = () => {
  const [loading, setLoading] = useState(false);
  const [lastCode, setLastCode] = useState<string | null>(null);
  const handleScan = async (code: string) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLastCode(code);
    setLoading(false);
  };
  return (
    <div className="flex max-w-80 flex-col gap-3">
      <ScanInput
        label="สแกนเช็คสต็อก (จำลองเรียก API 0.8 วินาที)"
        hint="ระหว่างตรวจสอบ ช่องจะล็อก และโฟกัสกลับเองเมื่อเสร็จ"
        loading={loading}
        onScan={handleScan}
      />
      <span className="text-sm text-muted-foreground">
        {loading
          ? 'กำลังตรวจสอบสต็อก…'
          : lastCode
            ? `ตรวจสอบล่าสุด: ${lastCode} — คงเหลือ 1,250 ชิ้น`
            : 'ยังไม่มีการสแกน'}
      </span>
    </div>
  );
};

export const AsyncScanExample: Story = {
  render: () => <AsyncScanDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'เมื่อ onScan เป็น async คอมโพเนนต์จะโฟกัสกลับหลังจบงานเสมอ (แม้ onScan โยน error) ' +
          'และเมื่อพ้นสถานะ loading/disabled จะได้โฟกัสคืนอัตโนมัติเพื่อรองรับการยิงบาร์โค้ดต่อเนื่อง',
      },
    },
  },
};
