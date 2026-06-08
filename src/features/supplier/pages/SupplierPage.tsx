import { useState } from 'react';
import { Popconfirm, Space, Input, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Table, Button, PageHeader } from '@design-system';
import type { ColumnType } from '@design-system';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '../react-query';
import { SupplierFormModal } from '../components/SupplierFormModal';
import type { Supplier, CreateSupplierDto } from '../types';

const { Search } = Input;

export function SupplierPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const params = { page, limit: pageSize, search: search || undefined };
  const { data, isLoading, refetch, isFetching } = useSuppliers(params);
  const suppliers = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();

  async function handleSubmit(values: CreateSupplierDto) {
    if (selected) {
      await updateSupplier.mutateAsync({ id: selected.id, data: values });
    } else {
      await createSupplier.mutateAsync(values);
    }
    setModalOpen(false);
  }

  const columns: ColumnType<Supplier>[] = [
    {
      title: 'ชื่อบริษัท / ซัพพลายเออร์',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'ผู้ติดต่อ',
      dataIndex: 'contactName',
      width: 150,
      render: (v?: string | null) => v || '-',
    },
    {
      title: 'เบอร์โทร',
      dataIndex: 'phone',
      width: 130,
      render: (v?: string | null) => v || '-',
    },
    {
      title: 'อีเมล',
      dataIndex: 'email',
      width: 200,
      render: (v?: string | null) => v || '-',
    },
    {
      title: 'เลขผู้เสียภาษี',
      dataIndex: 'taxId',
      width: 150,
      render: (v?: string | null) => v ? <code style={{ fontSize: 12 }}>{v}</code> : '-',
    },
    {
      title: 'สถานะ',
      dataIndex: 'isActive',
      width: 100,
      render: (v: boolean) => (
        <Badge status={v ? 'success' : 'default'} text={v ? 'ใช้งาน' : 'ปิด'} />
      ),
    },
    {
      title: 'อัปเดตล่าสุด',
      dataIndex: 'updatedAt',
      width: 150,
      sorter: (a, b) => (a.updatedAt ?? '').localeCompare(b.updatedAt ?? ''),
      render: (v?: string) => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '-',
    },
    {
      title: '',
      key: 'action',
      width: 90,
      fixed: 'right',
      render: (_: unknown, r: Supplier) => (
        <Space>
          <Button
            variant="ghost"
            size="small"
            icon={<EditOutlined />}
            onClick={() => { setSelected(r); setModalOpen(true); }}
          />
          <Popconfirm
            title={`ลบ "${r.name}"?`}
            onConfirm={() => deleteSupplier.mutate(r.id)}
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
        title="ซัพพลายเออร์"
        subtitle={`ทั้งหมด ${total} ราย`}
        actions={
          <>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>
              รีเฟรช
            </Button>
            <Button
              variant="primary"
              icon={<PlusOutlined />}
              onClick={() => { setSelected(null); setModalOpen(true); }}
            >
              เพิ่มซัพพลายเออร์
            </Button>
          </>
        }
      />

      <div style={{ marginBottom: 16 }}>
        <Search
          prefix={<SearchOutlined />}
          placeholder="ค้นหาชื่อ..."
          allowClear
          style={{ width: 280 }}
          onSearch={(val) => { setSearch(val); setPage(1); }}
        />
      </div>

      <Table<Supplier>
        rowKey="id"
        columns={columns}
        dataSource={suppliers}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
        }}
        scroll={{ x: 900 }}
      />

      <SupplierFormModal
        open={modalOpen}
        supplier={selected}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={createSupplier.isPending || updateSupplier.isPending}
      />
    </div>
  );
}
