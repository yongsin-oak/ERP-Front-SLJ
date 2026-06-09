import { useMemo, useState } from 'react';
import { Popconfirm, Row, Col, Space, DatePicker, Card } from 'antd';
import {
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs, { type Dayjs } from 'dayjs';
import { Table, Button, Tag, PageHeader, Input, Select, BulkSelectionBar, colors, AppIcons } from '@design-system';
import type { ColumnType } from '@design-system';
import { downloadFile } from '@shared';
import { useShops } from '@features/shop';
import { useEmployees } from '@features/employee/react-query';
import {
  useOrders, useDeleteOrder, useBulkDeleteOrder, orderService,
} from '../react-query';
import { OrderDetailModal } from '../components';
import { OrderStatuses } from '../types';
import type { Order, OrderStatus } from '../types';

const { RangePicker } = DatePicker;

interface Filters {
  search: string;
  status: string;
  shopId: string;
  employeeId: string;
  dateRange: [Dayjs, Dayjs] | null;
}

const EMPTY_FILTERS: Filters = {
  search: '',
  status: '',
  shopId: '',
  employeeId: '',
  dateRange: null,
};

export function OrderHistoryPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);
  const [exporting, setExporting] = useState(false);


  const { data: shops = [] } = useShops();
  const { data: employees = [] } = useEmployees();

  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      status: filters.status || undefined,
      shopId: filters.shopId || undefined,
      employeeId: filters.employeeId || undefined,
      search: filters.search.trim() || undefined,
      dateFrom: filters.dateRange?.[0].startOf('day').toISOString(),
      dateTo: filters.dateRange?.[1].endOf('day').toISOString(),
    }),
    [page, pageSize, filters],
  );

  const { data, isLoading, refetch, isFetching } = useOrders(queryParams);
  const orders = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  const deleteOrder = useDeleteOrder();
  const bulkDelete = useBulkDeleteOrder();

  const filtersActive =
    filters.search || filters.status || filters.shopId || filters.employeeId || filters.dateRange;

  function patchFilter(patch: Partial<Filters>) {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }

  async function handleBulkDelete() {
    await bulkDelete.mutateAsync(selectedKeys.map(String));
    setSelectedKeys([]);
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await orderService.exportXlsx(queryParams);
      downloadFile(res.data as unknown as Blob, 'ออเดอร์.xlsx');
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
          <div style={{ fontWeight: 500, fontFamily: 'monospace', fontSize: 12 }}>{r.id}</div>
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
      title: 'หมายเหตุ',
      dataIndex: 'note',
      ellipsis: true,
      render: (v?: string | null) => v ?? '-',
    },
    {
      title: '',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_: unknown, r: Order) => (
        <Space>
          <Button
            variant="ghost" size="small" icon={<EyeOutlined />}
            onClick={() => { setSelected(r); setDetailOpen(true); }}
          />
          <Popconfirm
            title="ลบ order นี้?"
            onConfirm={() => deleteOrder.mutate(r.id)}
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
        title="ประวัติออเดอร์"
        subtitle={`ทั้งหมด ${total.toLocaleString()} รายการ`}
        actions={
          <>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>
              รีเฟรช
            </Button>
            <Button icon={<AppIcons.exportFile size={16} />} onClick={handleExport} loading={exporting}>
              Export Excel
            </Button>
            <Button variant="primary" icon={<PlusOutlined />} onClick={() => navigate('/order')}>
              สร้าง Order
            </Button>
          </>
        }
      />

      <Card
        size="small"
        title={<Space><FilterOutlined /> ตัวกรอง</Space>}
        extra={
          filtersActive ? (
            <Button size="small" icon={<ClearOutlined />} onClick={clearFilters}>
              ล้างตัวกรอง
            </Button>
          ) : null
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} lg={8}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="ค้นหาเลขออเดอร์ / หมายเหตุ"
              allowClear
              value={filters.search}
              onChange={(e) => patchFilter({ search: e.target.value })}
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <RangePicker
              value={filters.dateRange}
              onChange={(v) => patchFilter({ dateRange: v as [Dayjs, Dayjs] | null })}
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
              placeholder={['วันที่เริ่ม', 'วันที่สิ้นสุด']}
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Select
              allowClear
              placeholder="สถานะ"
              value={filters.status || undefined}
              onChange={(v) => patchFilter({ status: v ?? '' })}
              options={statusOptions}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Select
              allowClear
              placeholder="ร้านค้า"
              value={filters.shopId || undefined}
              onChange={(v) => patchFilter({ shopId: v ?? '' })}
              options={shopOptions}
              style={{ width: '100%' }}
              showSearch={{ optionFilterProp: 'label' }}
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Select
              allowClear
              placeholder="พนักงาน"
              value={filters.employeeId || undefined}
              onChange={(v) => patchFilter({ employeeId: v ?? '' })}
              options={employeeOptions}
              style={{ width: '100%' }}
              showSearch={{ optionFilterProp: 'label' }}
            />
          </Col>
        </Row>
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
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
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
