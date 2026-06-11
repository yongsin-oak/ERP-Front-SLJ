import { useMemo, useState } from 'react';
import { Input, Badge, Flex } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Table, Button, PageHeader, AppIcons, ActionCell, SummaryCard, DateCell, CodeCell, colors } from '@design-system';
import type { ColumnType } from '@design-system';
import { downloadFile } from '@shared';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier, supplierService } from '../react-query';
import { SupplierFormModal } from '../components/SupplierFormModal';
import type { Supplier, CreateSupplierDto } from '../types';

const { Search } = Input;

export function SupplierPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [exporting, setExporting] = useState(false);

  const params = { page, limit: pageSize, search: search || undefined };
  const { data, isLoading, refetch, isFetching } = useSuppliers(params);
  const suppliers = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();

  const activeCount = useMemo(() => suppliers.filter((s) => s.isActive).length, [suppliers]);
  const inactiveCount = useMemo(() => suppliers.filter((s) => !s.isActive).length, [suppliers]);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await supplierService.exportXlsx(search || undefined);
      downloadFile(res.data as unknown as Blob, 'ซัพพลายเออร์.xlsx');
    } finally {
      setExporting(false);
    }
  }

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
      render: (v?: string | null) => v ? <CodeCell>{v}</CodeCell> : '-',
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
      render: (v?: string) => <DateCell value={v} />,
    },
    {
      title: '',
      key: 'action',
      width: 90,
      fixed: 'right',
      render: (_: unknown, r: Supplier) => (
        <ActionCell
          onEdit={() => { setSelected(r); setModalOpen(true); }}
          onDelete={() => deleteSupplier.mutate(r.id)}
          isDeleting={deleteSupplier.isPending}
          deleteTitle={`ลบ "${r.name}"?`}
        />
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
            <Button icon={<AppIcons.exportFile size={16} />} onClick={handleExport} loading={exporting}>
              Export Excel
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

      <Flex gap={12} wrap style={{ marginBottom: 16 }}>
        <SummaryCard title="ทั้งหมด" value={total} suffix="ราย" color={colors.brand.primary} style={{ flex: 1, minWidth: 140 }} />
        <SummaryCard title="ใช้งาน (หน้านี้)" value={activeCount} suffix="ราย" color={colors.semantic.success} style={{ flex: 1, minWidth: 140 }} />
        <SummaryCard title="ปิดใช้งาน (หน้านี้)" value={inactiveCount} suffix="ราย" color={colors.text.secondary} style={{ flex: 1, minWidth: 140 }} />
      </Flex>

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
