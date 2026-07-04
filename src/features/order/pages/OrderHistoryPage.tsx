import { useMemo, useState } from 'react';
import { useSearchState } from '@shared';
import { useNavigate } from 'react-router-dom';
import dayjs, { type Dayjs } from 'dayjs';
import { Table, Button, Tag, PageHeader, Input, Select, BulkSelectionBar, colors, AppIcons, DeleteConfirmButton, Card, SummaryCard, Inline, Grid, DateRangePicker } from '@design-system';
import type { ColumnType } from '@design-system';
import { downloadFile, showError, notify } from '@shared';
import { useShops } from '@features/shop';
import { useEmployees } from '@features/employee/react-query';
import {
  useOrders, useDeleteOrder, useBulkDeleteOrder, orderService,
} from '../react-query';
import { OrderDetailModal } from '../components';
import { OrderStatuses } from '../types';
import type { Order, OrderStatus } from '../types';

const ORDER_HISTORY_DEFAULTS = {
  search: '', status: '', shopId: '', employeeId: '', startDate: '', endDate: '', page: 1, pageSize: 20,
};

export function OrderHistoryPage() {
  const navigate = useNavigate();
  const [tableState, setTableState] = useSearchState('order-history', ORDER_HISTORY_DEFAULTS);
  const { search, status, shopId, employeeId, startDate, endDate, page, pageSize } = tableState;
  const dateRange = useMemo<[Dayjs, Dayjs] | null>(
    () => (startDate && endDate ? [dayjs(startDate), dayjs(endDate)] : null),
    [startDate, endDate],
  );
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);
  const [exporting, setExporting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: shops = [] } = useShops();
  const { data: employees = [] } = useEmployees();

  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      status: status || undefined,
      shopId: shopId || undefined,
      employeeId: employeeId || undefined,
      search: search.trim() || undefined,
      dateFrom: dateRange?.[0].startOf('day').toISOString(),
      dateTo: dateRange?.[1].endOf('day').toISOString(),
    }),
    [page, pageSize, status, shopId, employeeId, search, dateRange],
  );

  const { data, isLoading, refetch, isFetching } = useOrders(queryParams);
  const orders = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  const deleteOrder = useDeleteOrder();
  const bulkDelete = useBulkDeleteOrder();

  const filtersActive = search || status || shopId || employeeId || startDate;

  function clearFilters() {
    setTableState({ ...tableState, search: '', status: '', shopId: '', employeeId: '', startDate: '', endDate: '', page: 1 });
  }

  async function handleBulkDelete() {
    await bulkDelete.mutateAsync(selectedKeys.map(String));
    setSelectedKeys([]);
  }

  async function handleExport() {
    setExporting(true);
    const key = notify.loading('กำลังส่งออก Excel ออเดอร์...');
    try {
      const res = await orderService.exportXlsx(queryParams);
      downloadFile(res.data as unknown as Blob, 'ออเดอร์.xlsx');
      notify.resolve(key, 'success', 'ส่งออก Excel ออเดอร์ สำเร็จ');
    } catch (err) {
      notify.dismiss(key);
      showError(err, 'ส่งออก Excel ออเดอร์');
    } finally {
      setExporting(false);
    }
  }

  const shopOptions = shops.map((s) => ({
    label: `[${s.platform}] ${s.name}`,
    value: s.id,
  }));

  const employeeOptions = employees.map((e) => ({
    label: `${e.firstName} (${e.nickname})`,
    value: e.id,
  }));

  const statusOptions = (Object.keys(OrderStatuses) as OrderStatus[]).map((s) => ({
    label: OrderStatuses[s].label,
    value: s,
  }));

  const columns: ColumnType<Order>[] = [
    {
      title: 'Order',
      key: 'id',
      render: (_: unknown, r: Order) => (
        <div>
          <div style={{ fontWeight: 500, fontFamily: 'monospace', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <AppIcons.barcode size={14} style={{ color: colors.text.tertiary, flexShrink: 0 }} />
            {r.id}
          </div>
          <div style={{ fontSize: 12, color: colors.text.tertiary }}>
            {r.startRecordAt
              ? dayjs(r.startRecordAt).format('DD/MM/YYYY HH:mm')
              : r.createdAt
                ? dayjs(r.createdAt).format('DD/MM/YYYY HH:mm')
                : '-'}
          </div>
        </div>
      ),
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      width: 130,
      render: (v: OrderStatus) =>
        v ? <Tag color={OrderStatuses[v].color}>{OrderStatuses[v].label}</Tag> : '-',
    },
    {
      title: 'รายการ',
      key: 'items',
      width: 80,
      align: 'right',
      render: (_: unknown, r: Order) => `${r.orderDetails?.length ?? 0} รายการ`,
    },
    {
      title: 'ยอดรวม',
      key: 'totalPrice',
      width: 120,
      align: 'right',
      render: (_: unknown, r: Order) => {
        const total = (r.orderDetails ?? []).reduce((s, d) => {
          const pack = d.product.sellPrice?.pack ?? 0;
          const carton = d.product.sellPrice?.carton ?? 0;
          return s + d.quantityPack * pack + d.quantityCarton * carton;
        }, 0);
        return <strong>฿{total.toLocaleString()}</strong>;
      },
    },
    {
      title: 'ร้านค้า',
      key: 'shop',
      width: 180,
      render: (_: unknown, r: Order) =>
        r.shop ? (
          <div>
            <div style={{ fontWeight: 500, fontSize: 13 }}>{r.shop.name}</div>
            <Tag color="blue" style={{ fontSize: 11 }}>{r.shop.platform}</Tag>
          </div>
        ) : '-',
    },
    {
      title: 'ผู้บันทึก',
      key: 'recordBy',
      width: 150,
      render: (_: unknown, r: Order) =>
        r.recordBy ? `${r.recordBy.firstName} (${r.recordBy.nickname})` : '-',
    },
    {
      title: 'เลขออเดอร์ / หมายเหตุ',
      dataIndex: 'note',
      render: (v?: string | null) => {
        if (!v) return '-';
        const parts = v.split(' | ');
        const orderNum = parts[0];
        const note = parts.slice(1).join(' | ');
        return (
          <div>
            <code style={{ fontSize: 11, fontWeight: 600 }}>{orderNum}</code>
            {note && <div style={{ fontSize: 12, color: colors.text.tertiary }}>{note}</div>}
          </div>
        );
      },
    },
    {
      title: '',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_: unknown, r: Order) => (
        <Inline wrap={false}>
          <Button
            variant="ghost" size="small" icon={<AppIcons.view />}
            onClick={() => { setSelected(r); setDetailOpen(true); }}
          />
          <DeleteConfirmButton
            onConfirm={async () => {
              setDeletingId(r.id);
              try {
                await deleteOrder.mutateAsync(r.id);
              } finally {
                setDeletingId(null);
              }
            }}
            loading={deletingId === r.id}
            title="ลบ order นี้?"
          />
        </Inline>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="ประวัติออเดอร์"
        subtitle={`ทั้งหมด ${total.toLocaleString()} รายการ`}
        actions={
          <>
            <Button icon={<AppIcons.refresh />} onClick={() => refetch()} loading={isFetching}>
              รีเฟรช
            </Button>
            <Button icon={<AppIcons.exportFile size={16} />} onClick={handleExport} loading={exporting}>
              Export Excel
            </Button>
            <Button variant="primary" icon={<AppIcons.add />} onClick={() => navigate('/order')}>
              สร้าง Order
            </Button>
          </>
        }
      />

      <Inline gap={3} wrap className="mb-4">
        <SummaryCard title="ออเดอร์ทั้งหมด" value={total} suffix="รายการ" color={colors.brand.primary} style={{ flex: 1, minWidth: 160 }} />
        <SummaryCard
          title="ยอดรวม (หน้านี้)"
          value={orders.reduce((s, r) => s + (r.orderDetails ?? []).reduce((os, d) => os + d.quantityPack * (d.product.sellPrice?.pack ?? 0) + d.quantityCarton * (d.product.sellPrice?.carton ?? 0), 0), 0)}
          prefix="฿"
          formatter={(v) => Number(v).toLocaleString()}
          color={colors.semantic.success}
          style={{ flex: 1, minWidth: 160 }}
        />
        <SummaryCard title="รายการสินค้ารวม (หน้านี้)" value={orders.reduce((s, r) => s + (r.orderDetails?.length ?? 0), 0)} suffix="รายการ" style={{ flex: 1, minWidth: 160 }} />
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
        <Grid cols={3} gap={3}>
          <Input
            prefix={<AppIcons.search />}
            placeholder="ค้นหาเลขออเดอร์ / หมายเหตุ"
            allowClear
            value={search}
            onChange={(e) => setTableState({ ...tableState, search: e.target.value, page: 1 })}
          />
          <DateRangePicker
            value={dateRange}
            onChange={(v) => setTableState({
              ...tableState,
              startDate: v?.[0]?.toISOString() ?? '',
              endDate: v?.[1]?.toISOString() ?? '',
              page: 1,
            })}
            format="DD/MM/YYYY"
            style={{ width: '100%' }}
            placeholder={['วันที่เริ่ม', 'วันที่สิ้นสุด']}
          />
          <Select
            allowClear
            placeholder="สถานะ"
            value={status || undefined}
            onChange={(v) => setTableState({ ...tableState, status: v ?? '', page: 1 })}
            options={statusOptions}
            style={{ width: '100%' }}
          />
          <Select
            allowClear
            placeholder="ร้านค้า"
            value={shopId || undefined}
            onChange={(v) => setTableState({ ...tableState, shopId: v ?? '', page: 1 })}
            options={shopOptions}
            style={{ width: '100%' }}
            showSearch={{ optionFilterProp: 'label' }}
          />
          <Select
            allowClear
            placeholder="พนักงาน"
            value={employeeId || undefined}
            onChange={(v) => setTableState({ ...tableState, employeeId: v ?? '', page: 1 })}
            options={employeeOptions}
            style={{ width: '100%' }}
            showSearch={{ optionFilterProp: 'label' }}
          />
        </Grid>
      </Card>

      {selectedKeys.length > 0 && (
        <BulkSelectionBar
          count={selectedKeys.length}
          isDeleting={bulkDelete.isPending}
          onDelete={handleBulkDelete}
          onClear={() => setSelectedKeys([])}
        />
      )}

      <Table<Order>
        rowKey="id"
        columns={columns}
        dataSource={orders}
        loading={isLoading}
        scroll={{ x: 1100 }}
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
      />

      <OrderDetailModal
        open={detailOpen}
        order={selected}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
