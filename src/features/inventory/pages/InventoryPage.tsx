import { useState } from 'react';
import { Popconfirm, Input, Space, Typography, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, InboxOutlined } from '@ant-design/icons';
import { Table, Button, Tag, PageHeader, Select } from '@design-system';
import type { ColumnType } from '@design-system';
import { useBrands } from '@features/brand';
import { useCategories } from '@features/category';
import {
  useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useBulkDeleteProduct,
} from '../hooks';
import { ProductFormModal } from '../components/ProductFormModal';
import { StockEntryModal } from '../components/StockEntryModal';
import type { Product, CreateProductDto, UpdateProductDto } from '../types';

const { Search } = Input;

export function InventoryPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [stockEntryOpen, setStockEntryOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [brandId, setBrandId] = useState<string | undefined>();
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  const params = { page, limit: pageSize, search: search || undefined, brandId, categoryId };
  const { data, isLoading, refetch } = useProducts(params);
  const products = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  const { data: brandsData } = useBrands({ page: 1, limit: 200 });
  const brands = brandsData?.data ?? [];
  const { data: categoriesData } = useCategories({ page: 1, limit: 200 });
  const categories = categoriesData?.data ?? [];

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const bulkDelete = useBulkDeleteProduct();

  async function handleSubmit(values: CreateProductDto | UpdateProductDto) {
    if (selected) {
      await updateProduct.mutateAsync({ barcode: selected.barcode, data: values as UpdateProductDto });
    } else {
      await createProduct.mutateAsync(values as CreateProductDto);
    }
    setModalOpen(false);
  }

  async function handleBulkDelete() {
    await bulkDelete.mutateAsync(selectedKeys.map(String));
    setSelectedKeys([]);
  }

  const columns: ColumnType<Product>[] = [
    {
      title: 'Barcode',
      dataIndex: 'barcode',
      width: 150,
      render: (v: string) => <code style={{ fontSize: 12 }}>{v}</code>,
    },
    {
      title: 'ชื่อสินค้า',
      dataIndex: 'name',
      render: (v: string, r: Product) => (
        <div>
          <div style={{ fontWeight: 500 }}>{v}</div>
          {r.sku && <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)' }}>{r.sku}</div>}
          {r.brand?.name && (
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{r.brand.name}</div>
          )}
        </div>
      ),
    },
    {
      title: 'หมวดหมู่',
      key: 'category',
      width: 120,
      render: (_: unknown, r: Product) => (r.category?.name ? <Tag>{r.category.name}</Tag> : '-'),
    },
    {
      title: 'ราคาทุน/แพ็ค',
      dataIndex: ['costPrice', 'pack'],
      width: 110,
      align: 'right',
      render: (v?: number) => (v != null ? `฿${v.toLocaleString()}` : '-'),
    },
    {
      title: 'ราคาขาย/แพ็ค',
      dataIndex: ['sellPrice', 'pack'],
      width: 110,
      align: 'right',
      render: (v?: number) => (v != null ? `฿${v.toLocaleString()}` : '-'),
    },
    {
      title: 'คงเหลือ',
      dataIndex: 'remaining',
      width: 90,
      align: 'right',
      render: (v: number, r: Product) => (
        <Tag status={v === 0 ? 'error' : r.minStock && v <= r.minStock ? 'warning' : 'success'}>
          {v?.toLocaleString()}
        </Tag>
      ),
    },
    {
      title: 'สถานะ',
      dataIndex: 'isActive',
      width: 90,
      render: (v: boolean) => (
        <Badge status={v ? 'success' : 'default'} text={v ? 'ใช้งาน' : 'ปิด'} />
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
            onConfirm={() => deleteProduct.mutate(r.barcode)}
            okText="ลบ" cancelText="ยกเลิก" okButtonProps={{ danger: true }}
          >
            <Button variant="danger-ghost" size="small" icon={<DeleteOutlined />} />
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

      <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Search
            prefix={<SearchOutlined />}
            placeholder="ค้นหาชื่อ, barcode..."
            allowClear
            style={{ width: 260 }}
            onSearch={(val) => { setSearch(val); setPage(1); }}
          />
          <Select
            allowClear
            placeholder="แบรนด์"
            value={brandId}
            onChange={(v) => { setBrandId(v); setPage(1); }}
            options={brands.map((b) => ({ label: b.name, value: b.id }))}
            style={{ width: 160 }}
            showSearch
            optionFilterProp="label"
          />
          <Select
            allowClear
            placeholder="หมวดหมู่"
            value={categoryId}
            onChange={(v) => { setCategoryId(v); setPage(1); }}
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
            style={{ width: 160 }}
            showSearch
            optionFilterProp="label"
          />
        </div>
        {selectedKeys.length > 0 && (
          <Space>
            <Typography.Text type="secondary">เลือก {selectedKeys.length} รายการ</Typography.Text>
            <Popconfirm
              title={`ลบ ${selectedKeys.length} รายการที่เลือก?`}
              onConfirm={handleBulkDelete}
              okText="ลบ" cancelText="ยกเลิก" okButtonProps={{ danger: true, loading: bulkDelete.isPending }}
            >
              <Button variant="danger" icon={<DeleteOutlined />} loading={bulkDelete.isPending}>
                ลบที่เลือก
              </Button>
            </Popconfirm>
            <Button onClick={() => setSelectedKeys([])}>ยกเลิก</Button>
          </Space>
        )}
      </div>

      <Table<Product>
        rowKey="barcode"
        columns={columns}
        dataSource={products}
        loading={isLoading}
        rowSelection={{
          selectedRowKeys: selectedKeys,
          onChange: setSelectedKeys,
          preserveSelectedRowKeys: true,
        }}
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
