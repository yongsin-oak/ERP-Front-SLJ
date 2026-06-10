import { useState } from 'react';
import { Flex, DatePicker } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { Table, Button, Tag, Select, Input, colors, AppIcons } from '@design-system';
import type { ColumnType } from '@design-system';
import { downloadFile } from '@shared';
import { useStockEntries, inventoryExportService } from '../react-query';
import type { StockEntryParams } from '../react-query/services';
import { StockEntryTypes } from '../types';
import type { StockEntry, StockEntryType } from '../types';

const TYPE_OPTIONS = [
  { label: 'ทุกประเภท', value: '' },
  ...(Object.keys(StockEntryTypes) as StockEntryType[]).map((k) => ({
    value: k,
    label: StockEntryTypes[k].label,
  })),
];

interface Props {
  active: boolean;
}

export function StockHistoryTab({ active }: Props) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [productSearch, setProductSearch] = useState('');
  const [type, setType] = useState<StockEntryType | ''>('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [exporting, setExporting] = useState(false);

  const dateFrom = dateRange?.[0]?.startOf('day').toISOString();
  const dateTo = dateRange?.[1]?.endOf('day').toISOString();

  const params: StockEntryParams = {
    page,
    limit: pageSize,
    productBarcode: productSearch || undefined,
    type: (type || undefined) as StockEntryType | undefined,
    dateFrom,
    dateTo,
  };

  const { data, isLoading, refetch } = useStockEntries(params, { enabled: active });
  const entries = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  async function handleExport() {
    setExporting(true);
    try {
      const res = await inventoryExportService.exportStockHistory({
        productBarcode: productSearch || undefined,
        type: (type || undefined) as StockEntryType | undefined,
        dateFrom,
        dateTo,
      });
      downloadFile(res.data as unknown as Blob, 'ประวัติการเคลื่อนไหวสต็อก.xlsx');
    } finally {
      setExporting(false);
    }
  }

  const columns: ColumnType<StockEntry>[] = [
    {
      title: 'วันที่',
      dataIndex: 'createdAt',
      width: 160,
      render: (v: string) =>
        new Date(v).toLocaleString('th-TH', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        }),
    },
    {
      title: 'สินค้า',
      key: 'product',
      render: (_: unknown, r: StockEntry) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.product?.name ?? '-'}</div>
          <code style={{ fontSize: 11, color: colors.text.tertiary }}>{r.productBarcode}</code>
        </div>
      ),
    },
    {
      title: 'ประเภท',
      dataIndex: 'type',
      width: 120,
      render: (v: StockEntryType) => (
        <Tag color={StockEntryTypes[v]?.color}>{StockEntryTypes[v]?.label ?? v}</Tag>
      ),
    },
    {
      title: 'จำนวน',
      dataIndex: 'quantity',
      width: 90,
      align: 'right',
      render: (v: number) => v?.toLocaleString(),
    },
    {
      title: 'ก่อน',
      dataIndex: 'previousRemaining',
      width: 80,
      align: 'right',
      render: (v?: number) => (v != null ? v.toLocaleString() : '-'),
    },
    {
      title: 'หลัง',
      dataIndex: 'newRemaining',
      width: 80,
      align: 'right',
      render: (v?: number) => (v != null ? <strong>{v.toLocaleString()}</strong> : '-'),
    },
    {
      title: 'พนักงาน',
      key: 'employee',
      width: 140,
      render: (_: unknown, r: StockEntry) =>
        r.employee
          ? `${r.employee.firstName} ${r.employee.lastName}`
          : '-',
    },
    {
      title: 'หมายเหตุ',
      dataIndex: 'note',
      render: (v?: string) => v ?? '-',
    },
  ];

  return (
    <div>
      <Flex gap={8} wrap style={{ marginBottom: 12 }} justify="space-between">
        <Flex gap={8} wrap>
          <Input
            prefix={<SearchOutlined />}
            placeholder="barcode สินค้า..."
            allowClear
            style={{ width: 200 }}
            value={productSearch}
            onChange={(e) => { setProductSearch(e.target.value); setPage(1); }}
          />
          <Select
            value={type}
            onChange={(v) => { setType(v as StockEntryType | ''); setPage(1); }}
            options={TYPE_OPTIONS}
            style={{ width: 140 }}
          />
          <DatePicker.RangePicker
            onChange={(val) => { setDateRange(val); setPage(1); }}
            style={{ width: 240 }}
            placeholder={['วันเริ่มต้น', 'วันสิ้นสุด']}
          />
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
        </Flex>
        <Button
          icon={<AppIcons.exportFile size={16} />}
          onClick={handleExport}
          loading={exporting}
        >
          Export Excel
        </Button>
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
        locale={{ emptyText: 'ไม่มีประวัติการเคลื่อนไหว' }}
      />
    </div>
  );
}
