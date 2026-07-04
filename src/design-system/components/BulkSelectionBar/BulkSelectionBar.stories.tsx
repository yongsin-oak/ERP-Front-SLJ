import { useState } from 'react';
import type { Key } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BulkSelectionBar } from './index';
import { Table } from '../Table';
import type { ColumnType } from '../Table';
import { CodeCell, QuantityCell } from '../TableCell';

// ── Shared mock data ──────────────────────────────────────────────────────────

interface Product {
  id: number;
  sku: string;
  name: string;
  stock: number;
}

const BOX_SIZES = ['00', '0', 'A', 'AA', 'B', 'C', 'D', '2A'];

const PRODUCTS: Product[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  sku: `BOX-${String(i + 1).padStart(3, '0')}`,
  name: `กล่องไปรษณีย์ เบอร์ ${BOX_SIZES[i % BOX_SIZES.length]} (แพ็ก 20 ใบ)`,
  stock: (i * 41) % 200,
}));

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Design System/BulkSelectionBar',
  component: BulkSelectionBar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    count: 3,
    onDelete: () => console.log('bulk delete'),
    onClear: () => console.log('clear selection'),
  },
} satisfies Meta<typeof BulkSelectionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

export const Default: Story = {};

export const CustomLabel: Story = {
  args: {
    count: 12,
    itemLabel: 'สินค้า',
    deleteTitle: 'ลบสินค้า 12 รายการออกจากคลัง?',
  },
};

export const Deleting: Story = {
  parameters: { docs: { description: { story: 'isDeleting=true — ปุ่มลบขึ้น loading และปุ่มยกเลิกถูก disable' } } },
  args: { count: 5, isDeleting: true },
};

const FAKE_DELETE_DELAY_MS = 800;

const WithTableDemo = () => {
  const [rows, setRows] = useState<Product[]>(PRODUCTS);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns: ColumnType<Product>[] = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 120, render: (_: unknown, r) => <CodeCell>{r.sku}</CodeCell> },
    { title: 'ชื่อสินค้า', dataIndex: 'name', key: 'name' },
    {
      title: 'สต็อก',
      dataIndex: 'stock',
      key: 'stock',
      align: 'right',
      width: 120,
      render: (_: unknown, r) => <QuantityCell value={r.stock} unit="ชิ้น" />,
    },
  ];

  function handleBulkDelete() {
    setIsDeleting(true);
    setTimeout(() => {
      const selected = new Set(selectedRowKeys.map(String));
      setRows((prev) => prev.filter((r) => !selected.has(String(r.id))));
      setSelectedRowKeys([]);
      setIsDeleting(false);
    }, FAKE_DELETE_DELAY_MS);
  }

  return (
    <div>
      {selectedRowKeys.length > 0 && (
        <BulkSelectionBar
          count={selectedRowKeys.length}
          itemLabel="สินค้า"
          isDeleting={isDeleting}
          onDelete={handleBulkDelete}
          onClear={() => setSelectedRowKeys([])}
        />
      )}
      <Table<Product>
        columns={columns}
        dataSource={rows}
        rowKey="id"
        pagination={false}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
      />
    </div>
  );
};

export const WithTable: Story = {
  parameters: {
    docs: {
      description: {
        story: 'ติ๊กเลือกสินค้าในตารางแล้วแถบจะปรากฏ — กด "ลบที่เลือก" เพื่อยืนยัน (จำลองการลบ 800ms) หรือ "ยกเลิก" เพื่อล้างการเลือก',
      },
    },
  },
  render: () => <WithTableDemo />,
};
