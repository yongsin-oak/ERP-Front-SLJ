import { useState } from 'react';
import { useSearchState, showError, notify } from '@shared';
import { Flex, Input, Space, Badge, Tabs, Tooltip } from 'antd';
import {
  Table, Button, Tag, PageHeader, Select, BulkSelectionBar,
  colors, AppIcons, DeleteConfirmButton, CodeCell,
} from '@design-system';
import type { ColumnType } from '@design-system';
import { downloadFile } from '@shared';
import { useBrands } from '@features/brand';
import { useCategories } from '@features/category';
import {
  useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useBulkDeleteProduct,
  inventoryExportService,
} from '../react-query';
import { ProductFormModal } from '../components/ProductFormModal';
import { ProductImportModal } from '../components/ProductImportModal';
import { StockEntryModal } from '../components/StockEntryModal';
import { ShopPriceModal } from '../components/ShopPriceModal';
import { StockHistoryTab } from '../components/StockHistoryTab';
import type { Product, CreateProductDto, UpdateProductDto } from '../types';

const { Search } = Input;

type ActiveTab = 'products' | 'history';

export function InventoryPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('products');

  // Product tab state
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [stockEntryOpen, setStockEntryOpen] = useState(false);
  const [stockEntryBarcode, setStockEntryBarcode] = useState<string | undefined>();
  const [selected, setSelected] = useState<Product | null>(null);
  const [tableState, setTableState] = useSearchState('inventory-list', {
    search: '', brandId: '', categoryId: '', isActive: '', lowStock: false, page: 1, pageSize: 20,
  });
  const { search, brandId, categoryId, isActive, lowStock, page, pageSize } = tableState;
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [exporting, setExporting] = useState(false);
  const [shopPriceBarcode, setShopPriceBarcode] = useState<string | null>(null);
  const [deletingBarcode, setDeletingBarcode] = useState<string | null>(null);

  const params = {
    page, limit: pageSize,
    search: search || undefined,
    brandId: brandId || undefined,
    categoryId: categoryId || undefined,
    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    lowStock: lowStock || undefined,
  };
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

  async function handleExport() {
    setExporting(true);
    const key = notify.loading('กำลังส่งออก Excel สินค้า...');
    try {
      const res = await inventoryExportService.exportProducts({
        search: search || undefined,
        brandId: brandId || undefined,
        categoryId: categoryId || undefined,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        lowStock: lowStock || undefined,
      });
      downloadFile(res.data as unknown as Blob, 'สินค้า.xlsx');
      notify.resolve(key, 'success', 'ส่งออก Excel สินค้า สำเร็จ');
    } catch (err) {
      notify.dismiss(key);
      showError(err, 'ส่งออก Excel สินค้า');
    } finally {
      setExporting(false);
    }
  }

  function openStockEntry(barcode?: string) {
    setStockEntryBarcode(barcode);
    setStockEntryOpen(true);
  }

  const columns: ColumnType<Product>[] = [
    {
      title: 'Barcode',
      dataIndex: 'barcode',
      width: 150,
      render: (v: string) => <CodeCell>{v}</CodeCell>,
    },
    {
      title: 'ชื่อสินค้า',
      dataIndex: 'name',
      render: (v: string, r: Product) => (
        <div>
          <div style={{ fontWeight: 500 }}>{v}</div>
          {r.sku && <div style={{ fontSize: 11, color: colors.text.tertiary }}>{r.sku}</div>}
          {r.brand?.name && (
            <div style={{ fontSize: 12, color: colors.text.tertiary }}>{r.brand.name}</div>
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
      title: 'ราคาขาย/แพ็ค',
      key: 'sellPrice',
      width: 130,
      align: 'right',
      render: (_: unknown, r: Product) => {
        const pack = r.sellPrice?.pack;
        const carton = r.sellPrice?.carton;
        const noPrice = !pack && !carton;
        return (
          <Space size={4}>
            {noPrice && (
              <Tooltip title="ยังไม่ตั้งราคาขาย">
                <AppIcons.warningFilled style={{ color: colors.semantic.warning, fontSize: 13 }} />
              </Tooltip>
            )}
            <span>{pack != null ? `฿${pack.toLocaleString()}` : '-'}</span>
          </Space>
        );
      },
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
      width: 160,
      render: (_: unknown, r: Product) => (
        <Space>
          <Tooltip title="รับสินค้าเข้า">
            <Button
              variant="ghost" size="small" icon={<AppIcons.inbox />}
              onClick={() => openStockEntry(r.barcode)}
            />
          </Tooltip>
          <Tooltip title="ราคาร้านค้าเฉพาะ">
            <Button
              variant="ghost" size="small" icon={<AppIcons.money />}
              onClick={() => setShopPriceBarcode(r.barcode)}
            />
          </Tooltip>
          <Button
            variant="ghost" size="small" icon={<AppIcons.edit />}
            onClick={() => { setSelected(r); setModalOpen(true); }}
          />
          <DeleteConfirmButton
            onConfirm={async () => {
              setDeletingBarcode(r.barcode);
              try {
                await deleteProduct.mutateAsync(r.barcode);
              } finally {
                setDeletingBarcode(null);
              }
            }}
            loading={deletingBarcode === r.barcode}
            title="ลบสินค้านี้?"
          />
        </Space>
      ),
    },
  ];

  const productTabContent = (
    <div>
      <Flex gap={8} wrap style={{ marginBottom: 12 }}>
        <Search
          prefix={<AppIcons.search />}
          placeholder="ค้นหาชื่อ, barcode..."
          allowClear
          style={{ width: 260 }}
          onSearch={(val) => setTableState({ ...tableState, search: val, page: 1 })}
        />
        <Select
          allowClear
          placeholder="แบรนด์"
          value={brandId || undefined}
          onChange={(v) => setTableState({ ...tableState, brandId: v ?? '', page: 1 })}
          options={brands.map((b) => ({ label: b.name, value: b.id }))}
          style={{ width: 160 }}
          showSearch={{ optionFilterProp: 'label' }}
        />
        <Select
          allowClear
          placeholder="หมวดหมู่"
          value={categoryId || undefined}
          onChange={(v) => setTableState({ ...tableState, categoryId: v ?? '', page: 1 })}
          options={categories.map((c) => ({ label: c.name, value: c.id }))}
          style={{ width: 160 }}
          showSearch={{ optionFilterProp: 'label' }}
        />
        <Select
          allowClear
          placeholder="สถานะ"
          value={isActive || undefined}
          onChange={(v: string | undefined) => setTableState({ ...tableState, isActive: v ?? '', page: 1 })}
          options={[
            { label: 'ใช้งาน', value: 'true' },
            { label: 'ปิด', value: 'false' },
          ]}
          style={{ width: 120 }}
        />
        <Button
          variant={lowStock ? 'primary' : 'ghost'}
          onClick={() => setTableState({ ...tableState, lowStock: !lowStock, page: 1 })}
        >
          สต็อกต่ำ
        </Button>
      </Flex>

      {selectedKeys.length > 0 && (
        <BulkSelectionBar
          count={selectedKeys.length}
          isDeleting={bulkDelete.isPending}
          onDelete={handleBulkDelete}
          onClear={() => setSelectedKeys([])}
        />
      )}

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
          onChange: (p, ps) => setTableState({ ...tableState, page: p, pageSize: ps }),
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );

  return (
    <div>
      <PageHeader
        title="สินค้าคงคลัง"
        subtitle={activeTab === 'products' ? `ทั้งหมด ${total} รายการ` : 'ประวัติการเคลื่อนไหวสต็อก'}
        actions={
          activeTab === 'products' ? (
            <>
              <Button icon={<AppIcons.refresh />} onClick={() => refetch()}>รีเฟรช</Button>
              <Button icon={<AppIcons.exportFile size={16} />} onClick={handleExport} loading={exporting}>Export Excel</Button>
              <Button icon={<AppIcons.importFile size={16} />} onClick={() => setImportOpen(true)}>นำเข้า Excel</Button>
              <Button icon={<AppIcons.inbox />} onClick={() => openStockEntry()}>รับสินค้าเข้า</Button>
              <Button variant="primary" icon={<AppIcons.add />} onClick={() => { setSelected(null); setModalOpen(true); }}>
                เพิ่มสินค้า
              </Button>
            </>
          ) : undefined
        }
      />

      <Tabs
        activeKey={activeTab}
        onChange={(k) => setActiveTab(k as ActiveTab)}
        style={{ marginTop: 4 }}
        items={[
          { key: 'products', label: 'สินค้า', children: productTabContent },
          { key: 'history', label: 'ประวัติการเคลื่อนไหว', children: <StockHistoryTab active={activeTab === 'history'} /> },
        ]}
      />

      <ProductFormModal
        open={modalOpen}
        product={selected}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={createProduct.isPending || updateProduct.isPending}
      />

      <StockEntryModal
        open={stockEntryOpen}
        onClose={() => { setStockEntryOpen(false); setStockEntryBarcode(undefined); }}
        initialBarcode={stockEntryBarcode}
      />

      <ProductImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />

      {shopPriceBarcode && (
        <ShopPriceModal
          open={!!shopPriceBarcode}
          barcode={shopPriceBarcode}
          productName={products.find((p) => p.barcode === shopPriceBarcode)?.name ?? shopPriceBarcode}
          onClose={() => setShopPriceBarcode(null)}
        />
      )}
    </div>
  );
}
