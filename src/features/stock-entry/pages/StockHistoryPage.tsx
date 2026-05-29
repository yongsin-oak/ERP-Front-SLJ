import { useState } from 'react';
import { Flex, DatePicker, Select } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Table, Button, PageHeader, Tag } from '@design-system';
import type { ColumnType } from '@design-system';
import { useStockEntries } from '../hooks';
import { StockEntryTypeLabel, StockEntryTypeColor } from '../types';
import type { StockEntry, StockEntryType } from '../types';
import { useEmployeeList } from '@features/employee/hooks';
import { useProducts } from '@features/inventory/hooks';

const { RangePicker } = DatePicker;

export function StockHistoryPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState<string | undefined>();
  const [type, setType] = useState<StockEntryType | undefined>();
  const [employeeId, setEmployeeId] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  const params = {
    page, limit: pageSize,
    productBarcode: search || undefined,
    type,
    employeeId,
    dateFrom: dateRange?.[0],
    dateTo: dateRange?.[1],
  };

  const { data, isLoading, refetch, isFetching } = useStockEntries(params);
  const entries = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  const { data: empData } = useEmployeeList({ page: 1, limit: 200 });
  const employees = empData?.data ?? [];

  const { data: prodData } = useProducts({ page: 1, limit: 500 });
  const products = prodData?.data ?? [];

  const columns: ColumnType<StockEntry>[] = [
    {
      title: 'วันที่',
      dataIndex: 'createdAt',
      width: 160,
      render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'สินค้า',
      key: 'product',
      render: (_: unknown, r: StockEntry) => (
        <div>
          <div>{r.product?.name ?? r.productBarcode}</div>
          <code style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>{r.productBarcode}</code>
        </div>
      ),
    },
    {
      title: 'ประเภท',
      dataIndex: 'type',
      width: 120,
      render: (v: StockEntryType) => (
        <Tag color={StockEntryTypeColor[v]}>{StockEntryTypeLabel[v]}</Tag>
      ),
    },
    {
      title: 'จำนวน',
      dataIndex: 'quantity',
      width: 90,
      align: 'right',
      render: (v: number, r: StockEntry) => (
        <span style={{ color: r.type === 'adjust' ? 'inherit' : '#389e0d', fontWeight: 500 }}>
          {r.type === 'adjust' ? v : `+${v}`}
        </span>
      ),
    },
    {
      title: 'สต็อกก่อน',
      dataIndex: 'previousRemaining',
      width: 100,
      align: 'right',
      render: (v?: number) => v ?? '-',
    },
    {
      title: 'สต็อกหลัง',
      dataIndex: 'newRemaining',
      width: 100,
      align: 'right',
      render: (v?: number) => v != null ? <strong>{v}</strong> : '-',
    },
    {
      title: 'พนักงาน',
      key: 'employee',
      width: 140,
      render: (_: unknown, r: StockEntry) =>
        r.employee ? `${r.employee.firstName} (${r.employee.nickname})` : '-',
    },
    {
      title: 'หมายเหตุ',
      dataIndex: 'note',
      ellipsis: true,
      render: (v?: string | null) => v || '-',
    },
  ];

  return (
    <div>
      <PageHeader
        title="ประวัติการเคลื่อนไหวสต็อก"
        subtitle={`ทั้งหมด ${total} รายการ`}
        actions={
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>
            รีเฟรช
          </Button>
        }
      />

      <Flex gap={8} wrap style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="บาร์โค้ดสินค้า"
          showSearch={{ optionFilterProp: 'label' }}
          style={{ width: 220 }}
          options={products.map((p) => ({ label: `${p.name} (${p.barcode})`, value: p.barcode }))}
          onChange={(v) => { setSearch(v); setPage(1); }}
        />
        <Select
          allowClear
          placeholder="ประเภท"
          style={{ width: 140 }}
          options={[
            { label: 'รับสินค้าเข้า', value: 'in' },
            { label: 'รับคืน', value: 'return' },
            { label: 'ปรับสต็อก', value: 'adjust' },
          ]}
          onChange={(v) => { setType(v); setPage(1); }}
        />
        <Select
          allowClear
          placeholder="พนักงาน"
          showSearch={{ optionFilterProp: 'label' }}
          style={{ width: 180 }}
          options={employees.map((e) => ({ label: `${e.firstName} (${e.nickname})`, value: e.id }))}
          onChange={(v) => { setEmployeeId(v); setPage(1); }}
        />
        <RangePicker
          style={{ width: 240 }}
          onChange={(dates) => {
            if (dates?.[0] && dates?.[1]) {
              setDateRange([dates[0].toISOString(), dates[1].toISOString()]);
            } else {
              setDateRange(null);
            }
            setPage(1);
          }}
        />
      </Flex>

      <Table<StockEntry>
        rowKey="id"
        columns={columns}
        dataSource={entries}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
        }}
      />
    </div>
  );
}
