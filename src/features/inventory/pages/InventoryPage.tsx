import { useState } from 'react';
import { Popconfirm, Input, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, InboxOutlined } from '@ant-design/icons';
import { Table, Button, Tag, PageHeader } from '@design-system';
import type { ColumnType } from '@design-system';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks';
import { ProductFormModal } from '../components/ProductFormModal';
import { StockEntryModal } from '../components/StockEntryModal';
import type { Product, CreateProductDto, UpdateProductDto } from '../types';

const { Search } = Input;

export function InventoryPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [stockEntryOpen, setStockEntryOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const params = { page, limit: pageSize, search };
  const { data, isLoading, refetch } = useProducts(params);
  const products = data?.data ?? [];
  const total = data?.total ?? 0;

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  async function handleSubmit(values: CreateProductDto | UpdateProductDto) {
    if (selected) {
      await updateProduct.mutateAsync({ id: selected.id, data: values as UpdateProductDto });
    } else {
      await createProduct.mutateAsync(values as CreateProductDto);
    }
    setModalOpen(false);
  }

  const columns: ColumnType<Product>[] = [
    {
      title: 'Barcode',
      dataIndex: 'barcode',
      width: 140,
      render: (v: string) => <code style={{ fontSize: 12 }}>{v}</code>,
    },
    {
      title: 'ชื่อสินค้า',
      dataIndex: 'name',
      render: (v: string, r: Product) => (
        <div>
          <div style={{ fontWeight: 500 }}>{v}</div>
          {r.brand && <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{r.brand}</div>}
        </div>
      ),
    },
    {
      title: 'หมวดหมู่',
      dataIndex: 'category',
      width: 120,
      render: (v: string) => v ? <Tag>{v}</Tag> : '-',
    },
    {
      title: 'ราคาทุน',
      dataIndex: 'costPrice',
      width: 110,
      align: 'right',
      render: (v: number) => `฿${v?.toLocaleString()}`,
    },
    {
      title: 'ราคาขาย',
      dataIndex: 'sellingPrice',
      width: 110,
      align: 'right',
      render: (v: number) => `฿${v?.toLocaleString()}`,
    },
    {
      title: 'คงเหลือ',
      dataIndex: 'stock',
      width: 90,
      align: 'right',
      render: (v: number) => (
        <Tag status={v === 0 ? 'error' : v <= 5 ? 'warning' : 'success'}>
          {v?.toLocaleString()}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 100,
      render: (_: unknown, r: Product) => (
        <Space>
          <Button
            variant="ghost" size="small" icon={<EditOutlined />}
            onClick={() => { setSelected(r); setModalOpen(true); }}
          />
          <Popconfirm
            title="ลบสินค้านี้?"
            onConfirm={() => deleteProduct.mutate(r.id)}
            okText="ลบ" cancelText="ยกเลิก" okButtonProps={{ danger: true }}
          >
            <Button variant="danger" size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="สินค้าคงคลัง"
        subtitle={`ทั้งหมด ${total} รายการ`}
        actions={
          <>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()}>รีเฟรช</Button>
            <Button icon={<InboxOutlined />} onClick={() => setStockEntryOpen(true)}>รับสินค้าเข้า</Button>
            <Button variant="primary" icon={<PlusOutlined />} onClick={() => { setSelected(null); setModalOpen(true); }}>
              เพิ่มสินค้า
            </Button>
          </>
        }
      />

      <div style={{ marginBottom: 16 }}>
        <Search
          prefix={<SearchOutlined />}
          placeholder="ค้นหาชื่อสินค้า, barcode..."
          allowClear
          style={{ width: 300 }}
          onSearch={(val) => { setSearch(val); setPage(1); }}
        />
      </div>

      <Table<Product>
        rowKey="id"
        columns={columns}
        dataSource={products}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
        }}
      />

      <ProductFormModal
        open={modalOpen}
        product={selected}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <StockEntryModal
        open={stockEntryOpen}
        onClose={() => setStockEntryOpen(false)}
      />
    </div>
  );
}
