import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Table, Button, PageHeader, BulkSelectionBar, ActionCell, SummaryCard , AppIcons, Inline } from '@design-system';
import type { ColumnType } from '@design-system';
import { BrandFormModal } from '../components/BrandFormModal';
import {
  useBrands, useCreateBrand, useUpdateBrand, useDeleteBrand, useBulkDeleteBrand,
} from '../react-query';
import type { Brand, CreateBrandDto } from '../types';

export function BrandPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Brand | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  const { data, isLoading, refetch, isFetching } = useBrands({ page: 1, limit: 200 });
  const brands = useMemo(() => data?.data ?? [], [data]);
  const total = data?.pagination?.total ?? brands.length;

  const withDescCount = useMemo(() => brands.filter((b) => !!b.description).length, [brands]);
  const withoutDescCount = useMemo(() => brands.filter((b) => !b.description).length, [brands]);

  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const deleteBrand = useDeleteBrand();
  const bulkDelete = useBulkDeleteBrand();

  async function handleSubmit(values: CreateBrandDto) {
    if (selected) {
      await updateBrand.mutateAsync({ id: selected.id, data: values });
    } else {
      await createBrand.mutateAsync(values);
    }
    setModalOpen(false);
  }

  async function handleBulkDelete() {
    await bulkDelete.mutateAsync(selectedKeys.map(String));
    setSelectedKeys([]);
  }

  const columns: ColumnType<Brand>[] = [
    {
      title: 'รหัส',
      dataIndex: 'id',
      width: 160,
      sorter: (a, b) => a.id.localeCompare(b.id),
      searchable: true,
      render: (v: string) => <code style={{ fontSize: 12 }}>{v}</code>,
    },
    {
      title: 'ชื่อแบรนด์',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      searchable: true,
      defaultSortOrder: 'ascend',
    },
    {
      title: 'รายละเอียด',
      dataIndex: 'description',
      ellipsis: true,
      searchable: true,
      render: (v?: string) => v || '-',
    },
    {
      title: 'อัปเดตล่าสุด',
      dataIndex: 'updatedAt',
      width: 160,
      sorter: (a, b) => (a.updatedAt ?? '').localeCompare(b.updatedAt ?? ''),
      render: (v?: string) => (v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '-'),
    },
    {
      title: '',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_: unknown, r: Brand) => (
        <ActionCell
          onEdit={() => { setSelected(r); setModalOpen(true); }}
          onDelete={() => deleteBrand.mutate(r.id)}
          isDeleting={deleteBrand.isPending}
          deleteTitle="ลบแบรนด์นี้?"
          deleteDescription="สินค้าที่ผูกอยู่กับแบรนด์นี้จะไม่มีแบรนด์"
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="จัดการแบรนด์"
        subtitle={`ทั้งหมด ${total} แบรนด์`}
        actions={
          <>
            <Button icon={<AppIcons.refresh />} onClick={() => refetch()} loading={isFetching}>รีเฟรช</Button>
            <Button variant="primary" icon={<AppIcons.add />} onClick={() => { setSelected(null); setModalOpen(true); }}>
              เพิ่มแบรนด์
            </Button>
          </>
        }
      />

      <Inline gap={3} wrap style={{ marginBottom: 16 }}>
        <SummaryCard title="แบรนด์ทั้งหมด" value={total} suffix="แบรนด์" color="var(--color-primary)" style={{ flex: 1, minWidth: 140 }} />
        <SummaryCard title="มีรายละเอียด (หน้านี้)" value={withDescCount} suffix="แบรนด์" color="var(--color-success)" style={{ flex: 1, minWidth: 140 }} />
        <SummaryCard title="ไม่มีรายละเอียด (หน้านี้)" value={withoutDescCount} suffix="แบรนด์" color="var(--color-muted-foreground)" style={{ flex: 1, minWidth: 140 }} />
      </Inline>

      {selectedKeys.length > 0 && (
        <BulkSelectionBar
          count={selectedKeys.length}
          isDeleting={bulkDelete.isPending}
          onDelete={handleBulkDelete}
          onClear={() => setSelectedKeys([])}
        />
      )}

      <Table<Brand>
        rowKey="id"
        columns={columns}
        dataSource={brands}
        loading={isLoading}
        rowSelection={{
          selectedRowKeys: selectedKeys,
          onChange: setSelectedKeys,
          preserveSelectedRowKeys: true,
        }}
        scroll={{ x: 'max-content' }}
      />

      <BrandFormModal
        open={modalOpen}
        brand={selected}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={createBrand.isPending || updateBrand.isPending}
      />
    </div>
  );
}
