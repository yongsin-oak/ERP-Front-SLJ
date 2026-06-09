import { useState } from 'react';
import { Popconfirm, Space, Badge, Progress, Form, Select } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Table, Button, PageHeader, FormModal, Input } from '@design-system';
import type { ColumnType } from '@design-system';
import { useEmployees } from '@features/employee/react-query';
import {
  useStockCounts,
  useCreateStockCount,
  useDeleteStockCount,
} from '../react-query';
import { StockCountStatuses } from '../types';
import type { StockCount, StockCountStatus } from '../types';

export function StockCountListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<StockCountStatus | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading, refetch, isFetching } = useStockCounts({
    page,
    limit: pageSize,
    status: statusFilter,
  });
  const sessions = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  const { data: employees = [] } = useEmployees();

  const createCount = useCreateStockCount();
  const deleteCount = useDeleteStockCount();

  async function handleCreate(values: unknown) {
    await createCount.mutateAsync(values as { note?: string; employeeId?: string });
    setCreateOpen(false);
  }

  const columns: ColumnType<StockCount>[] = [
    {
      title: 'รหัส',
      dataIndex: 'id',
      width: 200,
      render: (v: string) => <code style={{ fontSize: 11 }}>{v}</code>,
    },
    {
      title: 'วันที่นับ',
      dataIndex: 'countDate',
      width: 120,
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      width: 130,
      render: (v: StockCountStatus) => (
        <Badge
          status={v === 'Completed' ? 'success' : 'processing'}
          text={StockCountStatuses[v].label}
        />
      ),
    },
    {
      title: 'ความคืบหน้า',
      key: 'progress',
      width: 180,
      render: (_: unknown, r: StockCount) => {
        const tot = (r as unknown as { totalItems: number }).totalItems ?? 0;
        const counted = (r as unknown as { countedItems: number }).countedItems ?? 0;
        const pct = tot > 0 ? Math.round((counted / tot) * 100) : 0;
        return (
          <Space orientation="vertical" size={0} style={{ width: '100%' }}>
            <Progress percent={pct} size="small" style={{ margin: 0 }} />
            <span style={{ fontSize: 11, color: '#888' }}>{counted}/{tot} รายการ</span>
          </Space>
        );
      },
    },
    {
      title: 'ผู้รับผิดชอบ',
      key: 'employee',
      width: 150,
      render: (_: unknown, r: StockCount) =>
        r.employee ? `${r.employee.firstName} (${r.employee.nickname})` : '-',
    },
    {
      title: 'หมายเหตุ',
      dataIndex: 'note',
      ellipsis: true,
      render: (v?: string | null) => v || '-',
    },
    {
      title: 'วันที่สร้าง',
      dataIndex: 'createdAt',
      width: 140,
      render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: '',
      key: 'action',
      width: 90,
      fixed: 'right',
      render: (_: unknown, r: StockCount) => (
        <Space>
          <Button
            variant="ghost"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/stock/count/${r.id}`)}
          />
          {r.status === 'Draft' && (
            <Popconfirm
              title={`ลบรายการนับสต็อก ${r.id}?`}
              description="ลบได้เฉพาะรายการที่ยังไม่สิ้นสุด"
              onConfirm={() => deleteCount.mutate(r.id)}
              okText="ลบ"
              cancelText="ยกเลิก"
              okButtonProps={{ danger: true }}
            >
              <Button variant="danger-ghost" size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const statusOptions = (Object.keys(StockCountStatuses) as StockCountStatus[]).map((s) => ({
    label: StockCountStatuses[s].label,
    value: s,
  }));

  return (
    <div>
      <PageHeader
        title="นับสต็อก"
        subtitle={`ทั้งหมด ${total} รายการ`}
        actions={
          <>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>
              รีเฟรช
            </Button>
            <Button
              variant="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateOpen(true)}
            >
              เริ่มนับสต็อก
            </Button>
          </>
        }
      />

      <div style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="ทุกสถานะ"
          style={{ width: 180 }}
          options={statusOptions}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
        />
      </div>

      <Table<StockCount>
        rowKey="id"
        columns={columns}
        dataSource={sessions}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
        }}
        scroll={{ x: 900 }}
      />

      <FormModal
        open={createOpen}
        title="เริ่มนับสต็อกใหม่"
        onClose={() => setCreateOpen(false)}
        form={form}
        onFinish={handleCreate}
        loading={createCount.isPending}
        submitLabel="สร้างรายการนับ"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="employeeId" label="ผู้รับผิดชอบ">
            <Select
              allowClear
              placeholder="เลือกพนักงาน (ถ้ามี)"
              showSearch={{ optionFilterProp: 'label' }}
              options={employees.map((e) => ({
                label: `${e.firstName} (${e.nickname})`,
                value: e.id,
              }))}
            />
          </Form.Item>
          <Form.Item name="note" label="หมายเหตุ">
            <Input placeholder="หมายเหตุ (ถ้ามี)" />
          </Form.Item>
        </Form>
      </FormModal>
    </div>
  );
}
