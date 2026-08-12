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
  title: 'Design System/Actions/ActionCell',
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
  parameters: { docs: { description: { story: 'isDeleting=true — ปุ่ม kebab ขึ้นสถานะ loading ระหว่าง mutation ทำงาน' } } },
  args: {
    onEdit: () => console.log('edit'),
    onDelete: () => console.log('delete'),
    isDeleting: true,
  },
};

export const WithExtraActions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'ส่ง `actions` เพิ่มได้ — จะเรียงก่อน "แก้ไข" ส่วนตัวที่ `danger: true` ถูกดันไปท้ายพร้อมเส้นคั่นให้อัตโนมัติ ไม่ว่าจะส่งมาลำดับไหน',
      },
    },
  },
  args: {
    actions: [
      { key: 'view', label: 'ดูรายละเอียด', onSelect: () => console.log('view') },
      { key: 'duplicate', label: 'ทำสำเนา', onSelect: () => console.log('duplicate') },
      {
        key: 'archive',
        label: 'เก็บเข้าคลัง',
        danger: true,
        onSelect: () => console.log('archive'),
        confirm: { title: 'เก็บสินค้านี้เข้าคลัง?', description: 'สินค้าจะไม่แสดงในรายการขาย' },
      },
    ],
    onEdit: () => console.log('edit'),
    onDelete: () => console.log('delete'),
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
      title: '',
      key: 'actions',
      width: 56,
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
      <div className="text-sm text-foreground-lighter">{message}</div>
      <Table<Product> columns={columns} dataSource={rows} rowKey="id" pagination={false} />
    </div>
  );
};

export const InTable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'ใช้งานจริงในคอลัมน์ "จัดการ" ของตารางสินค้า — กดปุ่มสามจุดเพื่อเปิดเมนู "ลบ" อยู่ท้ายสุดเป็นสีแดงและต้องยืนยันในโมดัลก่อน',
      },
    },
  },
  render: () => <TableDemo />,
};
