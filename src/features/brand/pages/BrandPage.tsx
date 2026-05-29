import { useMemo, useState } from 'react';
import { Flex, Popconfirm, Space, Typography } from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Table, Button, PageHeader } from '@design-system';
import type { ColumnType } from '@design-system';
import { BrandFormModal } from '../components/BrandFormModal';
import {
  useBrands, useCreateBrand, useUpdateBrand, useDeleteBrand, useBulkDeleteBrand,
} from '../hooks';
import type { Brand, CreateBrandDto } from '../types';

export function BrandPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Brand | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  const { data, isLoading, refetch, isFetching } = useBrands({ page: 1, limit: 200 });
  const brands = useMemo(() => data?.data ?? [], [data]);
  const total = data?.pagination?.total ?? brands.length;

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
        <Space>
          <Button
            variant="ghost" size="small" icon={<EditOutlined />}
            onClick={() => { setSelected(r); setModalOpen(true); }}
          />
          <Popconfirm
            title="ลบแบรนด์นี้?"
            description="สินค้าที่ผูกอยู่กับแบรนด์นี้จะไม่มีแบรนด์"
            onConfirm={() => deleteBrand.mutate(r.id)}
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
        title="จัดการแบรนด์"
        subtitle={`ทั้งหมด ${total} แบรนด์`}
        actions={
          <>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>รีเฟรช</Button>
            <Button variant="primary" icon={<PlusOutlined />} onClick={() => { setSelected(null); setModalOpen(true); }}>
              เพิ่มแบรนด์
            </Button>
          </>
        }
      />

      {selectedKeys.length > 0 && (
        <BulkBar
          count={selectedKeys.length}
          loading={bulkDelete.isPending}
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
      />

      <BrandFormModal
        open={modalOpen}
        brand={selected}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function BulkBar({
  count, loading, onDelete, onClear,
}: { count: number; loading: boolean; onDelete: () => void; onClear: () => void }) {
  return (
    <Flex
      align="center"
      justify="space-between"
      style={{ marginBottom: 12, padding: '8px 12px', background: '#fafafa', borderRadius: 6 }}
    >
      <Typography.Text type="secondary">เลือก {count} รายการ</Typography.Text>
      <Space>
        <Popconfirm
          title={`ลบ ${count} รายการที่เลือก?`}
          onConfirm={onDelete}
          okText="ลบ" cancelText="ยกเลิก" okButtonProps={{ danger: true, loading }}
        >
          <Button variant="danger" icon={<DeleteOutlined />} loading={loading}>ลบที่เลือก</Button>
        </Popconfirm>
        <Button onClick={onClear}>ยกเลิก</Button>
      </Space>
    </Flex>
  );
}
