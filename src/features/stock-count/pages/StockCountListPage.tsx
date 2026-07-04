import { useState, useMemo } from 'react';
import { useSearchState } from '@shared';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Table, Button, PageHeader, FormModal, Input, DeleteConfirmButton, Select, Card, colors, SummaryCard , AppIcons, Form, Inline, Stack, Badge } from '@design-system';
import type { ColumnType } from '@design-system';
import { useEmployees } from '@features/employee/react-query';
import {
  useStockCounts,
  useCreateStockCount,
  useDeleteStockCount,
} from '../react-query';
import { StockCountStatuses } from '../types';
import type { StockCount, StockCountStatus } from '../types';

const STOCK_COUNT_LIST_DEFAULTS = { status: '', page: 1, pageSize: 20 };

export function StockCountListPage() {
  const navigate = useNavigate();
  const [tableState, setTableState] = useSearchState('stock-count-list', STOCK_COUNT_LIST_DEFAULTS);
  const { page, pageSize } = tableState;
  const statusFilter = (tableState.status as StockCountStatus) || undefined;
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

  const filtersActive = !!statusFilter;

  function clearFilters() {
    setTableState({ ...tableState, status: '', page: 1 });
  }

  async function handleCreate(values: unknown) {
    await createCount.mutateAsync(values as { note?: string; employeeId?: string });
    setCreateOpen(false);
  }

  const draftCount = useMemo(() => sessions.filter((s) => s.status === 'Draft').length, [sessions]);
  const completedCount = useMemo(() => sessions.filter((s) => s.status === 'Completed').length, [sessions]);

  const statusOptions = (Object.keys(StockCountStatuses) as StockCountStatus[]).map((s) => ({
    label: StockCountStatuses[s].label,
    value: s,
  }));

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
        const tot = r.totalItems ?? 0;
        const counted = r.countedItems ?? 0;
        const pct = tot > 0 ? Math.round((counted / tot) * 100) : 0;
        return (
          <Stack gap={0} className="w-full">
            <div className="h-2 w-full rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[11px] text-muted-foreground">{counted}/{tot} รายการ</span>
          </Stack>
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
        <Inline wrap={false}>
          <Button
            variant="ghost"
            size="small"
            icon={<AppIcons.view />}
            onClick={() => navigate(`/stock/count/${r.id}`)}
          />
          {r.status === 'Draft' && (
            <DeleteConfirmButton
              onConfirm={() => deleteCount.mutate(r.id)}
              loading={deleteCount.isPending}
              title="ลบรายการนับสต็อก?"
              description="ลบได้เฉพาะรายการที่ยังไม่สิ้นสุด"
            />
          )}
        </Inline>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="นับสต็อก"
        subtitle={`ทั้งหมด ${total} รายการ`}
        actions={
          <>
            <Button icon={<AppIcons.refresh />} onClick={() => refetch()} loading={isFetching}>
              รีเฟรช
            </Button>
            <Button
              variant="primary"
              icon={<AppIcons.add />}
              onClick={() => setCreateOpen(true)}
            >
              เริ่มนับสต็อก
            </Button>
          </>
        }
      />

      <Inline gap={3} wrap className="mb-4">
        <SummaryCard title="รอบนับทั้งหมด" value={total} suffix="รอบ" color={colors.brand.primary} style={{ flex: 1, minWidth: 140 }} />
        <SummaryCard title="กำลังนับ (หน้านี้)" value={draftCount} suffix="รอบ" color={colors.semantic.warning} style={{ flex: 1, minWidth: 140 }} />
        <SummaryCard title="สิ้นสุดแล้ว (หน้านี้)" value={completedCount} suffix="รอบ" color={colors.semantic.success} style={{ flex: 1, minWidth: 140 }} />
      </Inline>

      <Card
        size="small"
        title={<Inline wrap={false}><AppIcons.filter /> ตัวกรอง</Inline>}
        extra={
          filtersActive ? (
            <Button size="small" icon={<AppIcons.clear />} onClick={clearFilters}>
              ล้างตัวกรอง
            </Button>
          ) : null
        }
        style={{ marginBottom: 16 }}
      >
        <Select
          allowClear
          placeholder="ทุกสถานะ"
          style={{ width: 180 }}
          options={statusOptions}
          value={statusFilter}
          onChange={(v) => setTableState({ ...tableState, status: v ?? '', page: 1 })}
        />
      </Card>

      <Table<StockCount>
        rowKey="id"
        columns={columns}
        dataSource={sessions}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => setTableState({ ...tableState, page: p, pageSize: ps }),
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
