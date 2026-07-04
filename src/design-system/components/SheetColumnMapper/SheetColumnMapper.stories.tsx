import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SheetColumnMapper } from './index';
import type { ColumnMapping, DbFieldDef } from './index';
import type { SheetData } from '../DropZoneSheet';

// ── Shared mock data ──────────────────────────────────────────────────────────

const DB_FIELDS: DbFieldDef[] = [
  { key: 'sku', label: 'SKU', required: true },
  { key: 'name', label: 'ชื่อสินค้า', required: true, type: 'text' },
  { key: 'price', label: 'ราคา', type: 'number' },
  { key: 'stock', label: 'สต็อก', type: 'number' },
  { key: 'note', label: 'หมายเหตุ' },
];

const SHEET_DATA: SheetData = {
  fileName: 'products-import.xlsx',
  headers: ['sku', 'ชื่อสินค้า', 'ราคา', 'จำนวนคงเหลือ', 'หมายเหตุ'],
  rows: [
    { sku: 'BOX-001', ชื่อสินค้า: 'กล่องไปรษณีย์ เบอร์ 0', ราคา: 45, จำนวนคงเหลือ: 250, หมายเหตุ: 'ขายดี' },
    { sku: 'BOX-002', ชื่อสินค้า: 'กล่องไปรษณีย์ เบอร์ A', ราคา: 62, จำนวนคงเหลือ: 120, หมายเหตุ: null },
    { sku: 'ENV-0912', ชื่อสินค้า: 'ซองกันกระแทก 9x12 นิ้ว', ราคา: 3.25, จำนวนคงเหลือ: 800, หมายเหตุ: 'ล็อตใหม่' },
  ],
  totalRows: 3,
};

const UNMATCHED_SHEET: SheetData = {
  fileName: 'shopee-orders.csv',
  headers: ['รหัส', 'ชื่อ', 'ราคา'],
  rows: [
    { รหัส: 'BOX-001', ชื่อ: 'กล่องไปรษณีย์ เบอร์ 0', ราคา: 45 },
    { รหัส: 'TAPE-45', ชื่อ: 'เทปกาว OPP 45 หลา', ราคา: 28 },
  ],
  totalRows: 2,
};

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Design System/SheetColumnMapper',
  component: SheetColumnMapper,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    sheetData: SHEET_DATA,
    dbFields: DB_FIELDS,
    onChange: (mappings) => console.log('mappings', mappings),
  },
} satisfies Meta<typeof SheetColumnMapper>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'จับคู่อัตโนมัติจากชื่อคอลัมน์ — "sku", "ชื่อสินค้า", "ราคา", "หมายเหตุ" ถูก match ให้เอง ส่วน "จำนวนคงเหลือ" ต้องเลือกเอง (onChange log ลง console)',
      },
    },
  },
};

export const MissingRequired: Story = {
  parameters: {
    docs: {
      description: {
        story: 'หัวคอลัมน์ในไฟล์ไม่ตรงกับ field ที่ระบบต้องการ — footer แจ้งเตือน field required ที่ยังไม่ถูกจับคู่',
      },
    },
  },
  args: { sheetData: UNMATCHED_SHEET },
};

const LiveResultDemo = () => {
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  return (
    <div className="flex flex-col gap-3">
      <SheetColumnMapper sheetData={SHEET_DATA} dbFields={DB_FIELDS} onChange={setMappings} />
      <pre className="rounded-md border border-border bg-muted p-3 text-xs text-foreground">
        {JSON.stringify(mappings, null, 2)}
      </pre>
    </div>
  );
};

export const LiveResult: Story = {
  parameters: {
    docs: { description: { story: 'ผลลัพธ์ ColumnMapping[] จาก onChange แสดงสด ๆ ด้านล่าง — ลองเปลี่ยน DB Field ดู' } },
  },
  render: () => <LiveResultDemo />,
};
