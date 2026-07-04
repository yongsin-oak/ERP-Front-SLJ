import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CodeCell, DateCell, MoneyCell, QuantityCell } from './index';
import { Table } from '../Table';
import type { ColumnType } from '../Table';

// ── Shared mock data ──────────────────────────────────────────────────────────

interface StockRow {
  id: number;
  sku: string;
  name: string;
  price: number | null;
  stock: number | null;
  updatedAt: string | null;
}

const ROWS: StockRow[] = [
  { id: 1, sku: 'BOX-001', name: 'กล่องไปรษณีย์ เบอร์ 0', price: 45.5, stock: 250, updatedAt: '2026-06-28T14:30:00' },
  { id: 2, sku: 'BOX-00A', name: 'กล่องไปรษณีย์ เบอร์ A', price: 62, stock: 8, updatedAt: '2026-07-01T09:15:00' },
  { id: 3, sku: 'ENV-0912', name: 'ซองกันกระแทก 9x12 นิ้ว', price: 3.25, stock: 2, updatedAt: 'ไม่ใช่วันที่' },
  { id: 4, sku: 'TAPE-45', name: 'เทปกาว OPP 45 หลา', price: null, stock: 0, updatedAt: null },
  { id: 5, sku: 'BUB-065', name: 'บับเบิ้ลกันกระแทก หน้ากว้าง 65 ซม.', price: 320, stock: null, updatedAt: '2026-05-15T18:45:00' },
];

const columns: ColumnType<StockRow>[] = [
  { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 120, render: (_: unknown, r) => <CodeCell>{r.sku}</CodeCell> },
  { title: 'ชื่อสินค้า', dataIndex: 'name', key: 'name' },
  {
    title: 'ราคา',
    dataIndex: 'price',
    key: 'price',
    align: 'right',
    width: 110,
    render: (_: unknown, r) => <MoneyCell value={r.price} />,
  },
  {
    title: 'สต็อก',
    dataIndex: 'stock',
    key: 'stock',
    align: 'right',
    width: 120,
    render: (_: unknown, r) => <QuantityCell value={r.stock} unit="ชิ้น" />,
  },
  {
    title: 'อัพเดทล่าสุด',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    width: 160,
    render: (_: unknown, r) => <DateCell value={r.updatedAt} />,
  },
];

const ExampleRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex items-center justify-between gap-6 border-b border-divider py-1.5 text-sm last:border-b-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-foreground">{children}</span>
  </div>
);

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Design System/TableCell',
  component: DateCell,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DateCell>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

export const InTable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'formatter ทั้ง 4 ตัวในตารางเดียว — แถว 3 วันที่ไม่ถูกต้อง → "—", แถว 4 ราคา null → "—", แถว 5 สต็อก null → "—", สต็อก 8 = สีเตือน / 2 และ 0 = สีวิกฤต',
      },
    },
  },
  render: () => <Table<StockRow> columns={columns} dataSource={ROWS} rowKey="id" pagination={false} />,
};

export const DateCellExamples: Story = {
  render: () => (
    <div className="max-w-md">
      <ExampleRow label="ค่าปกติ (default DD/MM/YYYY HH:mm)">
        <DateCell value="2026-06-28T14:30:00" />
      </ExampleRow>
      <ExampleRow label='format="DD MMM YYYY"'>
        <DateCell value="2026-06-28T14:30:00" format="DD MMM YYYY" />
      </ExampleRow>
      <ExampleRow label="null → —">
        <DateCell value={null} />
      </ExampleRow>
      <ExampleRow label='วันที่ไม่ถูกต้อง ("ไม่ใช่วันที่") → —'>
        <DateCell value="ไม่ใช่วันที่" />
      </ExampleRow>
    </div>
  ),
};

export const MoneyCellExamples: Story = {
  render: () => (
    <div className="max-w-md">
      <ExampleRow label="ค่าปกติ (2 ทศนิยม)">
        <MoneyCell value={1234.5} />
      </ExampleRow>
      <ExampleRow label="decimals={0}">
        <MoneyCell value={98765} decimals={0} />
      </ExampleRow>
      <ExampleRow label='prefix="USD "'>
        <MoneyCell value={29.99} prefix="USD " />
      </ExampleRow>
      <ExampleRow label="null → —">
        <MoneyCell value={null} />
      </ExampleRow>
    </div>
  ),
};

export const CodeCellExamples: Story = {
  render: () => (
    <div className="max-w-md">
      <ExampleRow label="SKU สินค้า">
        <CodeCell>BOX-001</CodeCell>
      </ExampleRow>
      <ExampleRow label="เลขออเดอร์ Shopee">
        <CodeCell>2506SHPX7K9M</CodeCell>
      </ExampleRow>
      <ExampleRow label="เลขพัสดุ">
        <CodeCell>TH01234567890A</CodeCell>
      </ExampleRow>
    </div>
  ),
};

export const QuantityCellThresholds: Story = {
  parameters: {
    docs: {
      description: {
        story: 'ค่าเริ่มต้น criticalThreshold=3 (สีวิกฤต), lowThreshold=10 (สีเตือน) — เกินกว่านั้นเป็นสีปกติ',
      },
    },
  },
  render: () => (
    <div className="max-w-md">
      <ExampleRow label="0 ชิ้น (≤ 3 → วิกฤต)">
        <QuantityCell value={0} unit="ชิ้น" />
      </ExampleRow>
      <ExampleRow label="3 ชิ้น (≤ 3 → วิกฤต)">
        <QuantityCell value={3} unit="ชิ้น" />
      </ExampleRow>
      <ExampleRow label="8 ชิ้น (≤ 10 → เตือน)">
        <QuantityCell value={8} unit="ชิ้น" />
      </ExampleRow>
      <ExampleRow label="45 ชิ้น (ปกติ)">
        <QuantityCell value={45} unit="ชิ้น" />
      </ExampleRow>
      <ExampleRow label="1,250 ชิ้น (ปกติ, มี comma)">
        <QuantityCell value={1250} unit="ชิ้น" />
      </ExampleRow>
      <ExampleRow label="null → —">
        <QuantityCell value={null} />
      </ExampleRow>
      <ExampleRow label="30 ม้วน (custom low=50, critical=20 → เตือน)">
        <QuantityCell value={30} unit="ม้วน" lowThreshold={50} criticalThreshold={20} />
      </ExampleRow>
    </div>
  ),
};
