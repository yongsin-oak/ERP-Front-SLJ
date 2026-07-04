import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ActionCell } from './index';
import { Table } from '../Table';
import type { ColumnType } from '../Table';
import { CodeCell, MoneyCell } from '../TableCell';

// ── Shared mock data ──────────────────────────────────────────────────────────

interface Product {
  id: number;
  sku: string;
  name: string;
  price: number;
}

const PRODUCTS: Product[] = [
  { id: 1, sku: 'BOX-001', name: 'กล่องไปรษณีย์ เบอร์ 0 (แพ็ก 20 ใบ)', price: 45 },
  { id: 2, sku: 'BOX-002', name: 'กล่องไปรษณีย์ เบอร์ A (แพ็ก 20 ใบ)', price: 62 },
  { id: 3, sku: 'ENV-0912', name: 'ซองกันกระแทก 9x12 นิ้ว', price: 3.25 },
  { id: 4, sku: 'TAPE-45', name: 'เทปกาว OPP 45 หลา', price: 28 },
];

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Design System/ActionCell',
  component: ActionCell,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ActionCell>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    onEdit: () => console.log('edit'),
    onDelete: () => console.log('delete'),
  },
};

export const EditOnly: Story = {
  args: { onEdit: () => console.log('edit') },
};

export const DeleteOnly: Story = {
  args: {
    onDelete: () => console.log('delete'),
    deleteTitle: 'ลบสินค้านี้?',
    deleteDescription: 'สินค้าจะถูกลบออกจากคลังอย่างถาวร',
  },
};

export const Deleting: Story = {
  parameters: { docs: { description: { story: 'isDeleting=true — ปุ่มลบขึ้นสถานะ loading ระหว่าง mutation ทำงาน' } } },
  args: {
    onEdit: () => console.log('edit'),
    onDelete: () => console.log('delete'),
    isDeleting: true,
  },
};

const TableDemo = () => {
  const [rows, setRows] = useState<Product[]>(PRODUCTS);
  const [message, setMessage] = useState('ยังไม่มีการดำเนินการ');

  const columns: ColumnType<Product>[] = [
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
      title: 'จัดการ',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_: unknown, record) => (
        <ActionCell
          onEdit={() => setMessage(`แก้ไข: ${record.name}`)}
          onDelete={() => {
            setRows((prev) => prev.filter((r) => r.id !== record.id));
            setMessage(`ลบ "${record.name}" แล้ว`);
          }}
          deleteTitle={`ลบ "${record.name}"?`}
          deleteDescription="ไม่สามารถยกเลิกการดำเนินการนี้ได้"
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm text-muted-foreground">{message}</div>
      <Table<Product> columns={columns} dataSource={rows} rowKey="id" pagination={false} />
    </div>
  );
};

export const InTable: Story = {
  parameters: {
    docs: { description: { story: 'ใช้งานจริงในคอลัมน์ "จัดการ" ของตารางสินค้า — กดดินสอเพื่อแก้ไข กดถังขยะเพื่อยืนยันการลบ' } },
  },
  render: () => <TableDemo />,
};
