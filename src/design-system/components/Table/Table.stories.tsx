import { useState } from 'react';
import type { Key } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table } from './index';
import type { ColumnType } from './index';
import { Tag } from '../Tag';
import { CodeCell, DateCell, MoneyCell, QuantityCell } from '../TableCell';

// ── Shared mock data ──────────────────────────────────────────────────────────

interface Product {
  id: number;
  sku: string;
  name: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
}

const BOX_SIZES = ['00', '0', '0+4', 'A', 'AA', 'B', 'C', 'D', '2A'];
const PRICE_STEP = 12.5;
const BASE_PRICE = 45;

function makeProducts(count: number): Product[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    sku: `BOX-${String(i + 1).padStart(3, '0')}`,
    name: `กล่องไปรษณีย์ เบอร์ ${BOX_SIZES[i % BOX_SIZES.length]} (แพ็ก 20 ใบ)`,
    price: BASE_PRICE + (i % BOX_SIZES.length) * PRICE_STEP,
    stock: (i * 37) % 250,
    status: i % 5 === 4 ? 'inactive' : 'active',
  }));
}

const PRODUCTS_8 = makeProducts(8);
const PRODUCTS_24 = makeProducts(24);
const PRODUCTS_45 = makeProducts(45);
const PRODUCTS_1000 = makeProducts(1000);

const productColumns: ColumnType<Product>[] = [
  {
    title: 'SKU',
    dataIndex: 'sku',
    key: 'sku',
    width: 120,
    render: (_: unknown, r) => <CodeCell>{r.sku}</CodeCell>,
  },
  { title: 'ชื่อสินค้า', dataIndex: 'name', key: 'name' },
  {
    title: 'ราคา',
    dataIndex: 'price',
    key: 'price',
    align: 'right',
    width: 120,
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
    title: 'สถานะ',
    dataIndex: 'status',
    key: 'status',
    width: 110,
    render: (_: unknown, r) => (
      <Tag status={r.status === 'active' ? 'success' : 'default'}>
        {r.status === 'active' ? 'ขายอยู่' : 'ปิดใช้งาน'}
      </Tag>
    ),
  },
];

// ── Meta ──────────────────────────────────────────────────────────────────────
// Table เป็น generic component — ใช้ Meta<typeof Table> ตรง ๆ (satisfies ชนกับ generics)

const meta: Meta<typeof Table> = {
  title: 'Design System/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

export const Basic: Story = {
  render: () => (
    <Table<Product> columns={productColumns} dataSource={PRODUCTS_8} rowKey="id" pagination={false} />
  ),
};

const sortableColumns: ColumnType<Product>[] = productColumns.map((col): ColumnType<Product> => {
  if (col.key === 'name') return { ...col, sorter: (a, b) => a.name.localeCompare(b.name, 'th') };
  if (col.key === 'price') return { ...col, sorter: (a, b) => a.price - b.price };
  if (col.key === 'stock') return { ...col, sorter: (a, b) => a.stock - b.stock, defaultSortOrder: 'descend' };
  return col;
});

export const Sorting: Story = {
  parameters: {
    docs: { description: { story: 'คลิกหัวคอลัมน์ ชื่อสินค้า / ราคา / สต็อก เพื่อสลับ ascend → descend → ยกเลิก (สต็อกเริ่มต้น descend)' } },
  },
  render: () => (
    <Table<Product> columns={sortableColumns} dataSource={PRODUCTS_24} rowKey="id" pagination={false} />
  ),
};

const PAGE_SIZE = 10;

const PaginationDemo = () => {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  return (
    <Table<Product>
      columns={productColumns}
      dataSource={PRODUCTS_45}
      rowKey="id"
      pagination={{
        current,
        pageSize,
        showSizeChanger: true,
        showTotal: (total, [start, end]) => `แสดง ${start}-${end} จากสินค้า ${total} รายการ`,
        onChange: (page, ps) => {
          setCurrent(ps === pageSize ? page : 1);
          setPageSize(ps);
        },
      }}
    />
  );
};

export const Pagination: Story = {
  parameters: { docs: { description: { story: 'แบ่งหน้าฝั่ง client — สินค้า 45 รายการ หน้า 10 รายการ พร้อมตัวเลือกขนาดหน้า' } } },
  render: () => <PaginationDemo />,
};

const ROW_SELECTION_PAGE_SIZE = 8;

const RowSelectionDemo = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<Product[]>([]);
  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm text-muted-foreground">
        เลือกแล้ว {selectedRowKeys.length} รายการ
        {selectedRows.length > 0 && ` — ${selectedRows.map((r) => r.sku).join(', ')}`}
      </div>
      <Table<Product>
        columns={productColumns}
        dataSource={PRODUCTS_24}
        rowKey="id"
        rowSelection={{
          selectedRowKeys,
          preserveSelectedRowKeys: true,
          onChange: (keys, rows) => {
            setSelectedRowKeys(keys);
            setSelectedRows(rows);
          },
        }}
        pagination={{ defaultPageSize: ROW_SELECTION_PAGE_SIZE }}
      />
    </div>
  );
};

export const RowSelection: Story = {
  parameters: {
    docs: { description: { story: 'preserveSelectedRowKeys — เลือกข้ามหน้าแล้วรายการที่เลือกยังครบทุกหน้า' } },
  },
  render: () => <RowSelectionDemo />,
};

const searchableColumns: ColumnType<Product>[] = productColumns.map((col): ColumnType<Product> => {
  if (col.key === 'sku' || col.key === 'name') return { ...col, searchable: true };
  return col;
});

export const SearchableColumn: Story = {
  parameters: {
    docs: { description: { story: 'คลิกไอคอนแว่นขยายที่หัวคอลัมน์ SKU / ชื่อสินค้า เพื่อกรองข้อมูลในตาราง' } },
  },
  render: () => (
    <Table<Product> columns={searchableColumns} dataSource={PRODUCTS_45} rowKey="id" pagination={false} />
  ),
};

const VIRTUAL_SCROLL_Y = 400;

export const Virtual: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Virtual scrolling — สินค้า 1,000 รายการ แต่ DOM render เฉพาะแถวที่มองเห็น (virtual + scroll.y + pagination=false)',
      },
    },
  },
  render: () => (
    <Table<Product>
      columns={productColumns}
      dataSource={PRODUCTS_1000}
      rowKey="id"
      virtual
      scroll={{ y: VIRTUAL_SCROLL_Y }}
      pagination={false}
    />
  ),
};

interface ProductNode {
  id: number;
  sku: string;
  name: string;
  stock: number;
  children?: ProductNode[];
}

const TREE_DATA: ProductNode[] = [
  {
    id: 1,
    sku: 'CAT-BOX',
    name: 'กล่องไปรษณีย์',
    stock: 480,
    children: [
      { id: 11, sku: 'BOX-00', name: 'กล่องไปรษณีย์ เบอร์ 00', stock: 120 },
      { id: 12, sku: 'BOX-0', name: 'กล่องไปรษณีย์ เบอร์ 0', stock: 200 },
      {
        id: 13,
        sku: 'BOX-A',
        name: 'กล่องไปรษณีย์ เบอร์ A',
        stock: 160,
        children: [
          { id: 131, sku: 'BOX-A-20', name: 'แพ็ก 20 ใบ', stock: 100 },
          { id: 132, sku: 'BOX-A-100', name: 'แพ็ก 100 ใบ', stock: 60 },
        ],
      },
    ],
  },
  {
    id: 2,
    sku: 'CAT-ENV',
    name: 'ซองกันกระแทก',
    stock: 350,
    children: [
      { id: 21, sku: 'ENV-0912', name: 'ซองกันกระแทก 9x12 นิ้ว', stock: 210 },
      { id: 22, sku: 'ENV-1114', name: 'ซองกันกระแทก 11x14 นิ้ว', stock: 140 },
    ],
  },
  { id: 3, sku: 'CAT-TAPE', name: 'เทปกาว OPP', stock: 90 },
];

const treeColumns: ColumnType<ProductNode>[] = [
  { title: 'หมวดหมู่ / สินค้า', dataIndex: 'name', key: 'name' },
  {
    title: 'SKU',
    dataIndex: 'sku',
    key: 'sku',
    width: 140,
    render: (_: unknown, r) => <CodeCell>{r.sku}</CodeCell>,
  },
  {
    title: 'สต็อก',
    dataIndex: 'stock',
    key: 'stock',
    align: 'right',
    width: 120,
    render: (_: unknown, r) => <QuantityCell value={r.stock} unit="ชิ้น" />,
  },
];

export const Expandable: Story = {
  parameters: { docs: { description: { story: 'Tree data — แถวที่มี children กดลูกศรเพื่อขยาย/ย่อ (เปิดแถวแรกไว้เป็นค่าเริ่มต้น)' } } },
  render: () => (
    <Table<ProductNode>
      columns={treeColumns}
      dataSource={TREE_DATA}
      rowKey="id"
      expandable={{ defaultExpandedRowKeys: [1] }}
      pagination={false}
    />
  ),
};

export const Loading: Story = {
  render: () => (
    <Table<Product> columns={productColumns} dataSource={PRODUCTS_8} rowKey="id" loading pagination={false} />
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-2 text-sm font-medium text-foreground">ค่าเริ่มต้น</div>
        <Table<Product> columns={productColumns} dataSource={[]} rowKey="id" pagination={false} />
      </div>
      <div>
        <div className="mb-2 text-sm font-medium text-foreground">กำหนดข้อความเอง (locale.emptyText)</div>
        <Table<Product>
          columns={productColumns}
          dataSource={[]}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: 'ยังไม่มีสินค้าในคลัง — กด "เพิ่มสินค้า" เพื่อเริ่มต้น' }}
        />
      </div>
    </div>
  ),
};

export const Summary: Story = {
  parameters: { docs: { description: { story: 'Table.Summary.Row / Table.Summary.Cell — แถวรวมมูลค่าสต็อกท้ายตาราง' } } },
  render: () => (
    <Table<Product>
      columns={productColumns}
      dataSource={PRODUCTS_8}
      rowKey="id"
      pagination={false}
      summary={(rows) => {
        const totalStock = rows.reduce((sum, r) => sum + r.stock, 0);
        const totalValue = rows.reduce((sum, r) => sum + r.price * r.stock, 0);
        return (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={2}>
              รวมทั้งหมด
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2} align="right">
              <MoneyCell value={totalValue} />
            </Table.Summary.Cell>
            <Table.Summary.Cell index={3} align="right">
              {totalStock.toLocaleString()} ชิ้น
            </Table.Summary.Cell>
            <Table.Summary.Cell index={4} />
          </Table.Summary.Row>
        );
      }}
    />
  ),
};

interface ProductWide extends Product {
  category: string;
  supplier: string;
  cost: number;
  updatedAt: string;
}

const CATEGORIES = ['กล่องไปรษณีย์', 'ซองกันกระแทก', 'เทปกาว'];
const SUPPLIERS = ['โรงงานกระดาษไทย จำกัด', 'บจก. แพ็คกิ้งซัพพลาย', 'หจก. ภัณฑ์บรรจุรุ่งเรือง'];
const COST_RATIO = 0.6;

const PRODUCTS_WIDE: ProductWide[] = makeProducts(8).map((p, i) => ({
  ...p,
  category: CATEGORIES[i % CATEGORIES.length],
  supplier: SUPPLIERS[i % SUPPLIERS.length],
  cost: p.price * COST_RATIO,
  updatedAt: `2026-06-${String((i % 28) + 1).padStart(2, '0')}T14:30:00`,
}));

const wideColumns: ColumnType<ProductWide>[] = [
  {
    title: 'SKU',
    dataIndex: 'sku',
    key: 'sku',
    width: 120,
    fixed: 'left',
    render: (_: unknown, r) => <CodeCell>{r.sku}</CodeCell>,
  },
  { title: 'ชื่อสินค้า', dataIndex: 'name', key: 'name', width: 260 },
  { title: 'หมวดหมู่', dataIndex: 'category', key: 'category', width: 150 },
  { title: 'ซัพพลายเออร์', dataIndex: 'supplier', key: 'supplier', width: 220 },
  {
    title: 'ต้นทุน',
    dataIndex: 'cost',
    key: 'cost',
    align: 'right',
    width: 120,
    render: (_: unknown, r) => <MoneyCell value={r.cost} />,
  },
  {
    title: 'ราคาขาย',
    dataIndex: 'price',
    key: 'price',
    align: 'right',
    width: 120,
    render: (_: unknown, r) => <MoneyCell value={r.price} />,
  },
  {
    title: 'สต็อก',
    dataIndex: 'stock',
    key: 'stock',
    align: 'right',
    width: 110,
    render: (_: unknown, r) => <QuantityCell value={r.stock} unit="ชิ้น" />,
  },
  {
    title: 'อัพเดทล่าสุด',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    width: 160,
    render: (_: unknown, r) => <DateCell value={r.updatedAt} />,
  },
  {
    title: 'สถานะ',
    dataIndex: 'status',
    key: 'status',
    width: 110,
    fixed: 'right',
    render: (_: unknown, r) => (
      <Tag status={r.status === 'active' ? 'success' : 'default'}>
        {r.status === 'active' ? 'ขายอยู่' : 'ปิดใช้งาน'}
      </Tag>
    ),
  },
];

const FIXED_SCROLL_X = 1400;

export const FixedColumns: Story = {
  parameters: {
    docs: { description: { story: 'SKU ตรึงซ้าย สถานะตรึงขวา — เลื่อนแนวนอนเพื่อดูคอลัมน์ตรงกลาง (scroll.x)' } },
  },
  render: () => (
    <Table<ProductWide>
      columns={wideColumns}
      dataSource={PRODUCTS_WIDE}
      rowKey="id"
      scroll={{ x: FIXED_SCROLL_X }}
      pagination={false}
    />
  ),
};
