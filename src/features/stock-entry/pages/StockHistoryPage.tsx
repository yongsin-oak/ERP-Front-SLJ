import { useState, useMemo } from 'react';
import { DatePicker, Flex, Space } from 'antd';
import { ReloadOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useSearchState } from '@shared';
import { Table, Button, PageHeader, Tag, Select, colors, AppIcons, SummaryCard, Card } from '@design-system';
import type { ColumnType } from '@design-system';
import { downloadFile, showError, notify } from '@shared';
import { useStockEntries, stockEntryService } from '../react-query';
import { StockEntryTypes } from '../types';
import type { StockEntry, StockEntryType } from '../types';
import { useEmployeeList } from '@features/employee/react-query';
import { useProducts } from '@features/inventory';

const { RangePicker } = DatePicker;

const DECREASE_TYPES: StockEntryType[] = ['damage'];

const TYPE_OPTIONS = (Object.keys(StockEntryTypes) as StockEntryType[]).map((k) => ({
  label: StockEntryTypes[k].label,
  value: k,
}));

function quantityDisplay(r: StockEntry) {
  if (r.type === 'adjust') return String(r.quantity);
  if (DECREASE_TYPES.includes(r.type)) return `-${r.quantity}`;
  return `+${r.quantity}`;
}

function quantityColor(type: StockEntryType) {
  if (type === 'damage') return colors.semantic.errorText;
  if (type === 'adjust') return 'inherit';
  return colors.semantic.successText;
}

const STOCK_HISTORY_DEFAULTS = {
  search: '', type: '', employeeId: '', startDate: '', endDate: '', page: 1, pageSize: 20,
};

export function StockHistoryPage() {
  const [tableState, setTableState] = useSearchState('stock-history', STOCK_HISTORY_DEFAULTS);
  const { search, type, employeeId, startDate, endDate, page, pageSize } = tableState;
  const dateRange: [Dayjs, Dayjs] | null =
    startDate && endDate ? [dayjs(startDate), dayjs(endDate)] : null;
  const [exporting, setExporting] = useState(false);

  const { data: empData } = useEmployeeList({ page: 1, limit: 200 });
  const employees = empData?.data ?? [];

  const { data: prodData } = useProducts({ page: 1, limit: 500 });
  const products = prodData?.data ?? [];

  const productOptions = useMemo(
    () => products.map((p) => ({ label: `${p.name} (${p.barcode})`, value: p.barcode })),
    [products],
  );
  const employeeOptions = useMemo(
    () => employees.map((e) => ({ label: `${e.firstName} (${e.nickname})`, value: e.id })),
    [employees],
  );

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      productBarcode: search || undefined,
      type: (type || undefined) as StockEntryType | undefined,
      employeeId: employeeId || undefined,
      dateFrom: dateRange?.[0].startOf('day').toISOString(),
      dateTo: dateRange?.[1].endOf('day').toISOString(),
    }),
    [page, pageSize, search, type, employeeId, dateRange],
  );

  const { data, isLoading, refetch, isFetching } = useStockEntries(params);
  const entries = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  const filtersActive = search || type || employeeId || dateRange;

  function clearFilters() {
    setTableState({ ...tableState, search: '', type: '', employeeId: '', startDate: '', endDate: '', page: 1 });
  }

  async function handleExport() {
    setExporting(true);
    const key = notify.loading('กำลังส่งออก Excel ประวัติสต็อก...');
    try {
      const res = await stockEntryService.exportXlsx(params);
      downloadFile(res.data as unknown as Blob, 'ประวัติสต็อก.xlsx');
      notify.resolve(key, 'success', 'ส่งออก Excel ประวัติสต็อก สำเร็จ');
    } catch (err) {
      notify.dismiss(key);
      showError(err, 'ส่งออก Excel ประวัติสต็อก');
    } finally {
      setExporting(false);
    }
  }

  const receiveValue = useMemo(
    () =>
      entries
        .filter((e) => e.type === 'in' || e.type === 'return')
        .reduce((s, e) => s + e.quantity * (e.costPricePerUnit ?? 0), 0),
    [entries],
  );
  const damageValue = useMemo(
    () =>
      entries
        .filter((e) => e.type === 'damage')
        .reduce((s, e) => s + e.quantity * (e.costPricePerUnit ?? 0), 0),
    [entries],
  );

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
          <code style={{ fontSize: 11, color: colors.text.tertiary }}>{r.productBarcode}</code>
        </div>
      ),
    },
    {
      title: 'ประเภท',
      dataIndex: 'type',
      width: 120,
      render: (v: StockEntryType) => (
        <Tag color={StockEntryTypes[v].color}>{StockEntryTypes[v].label}</Tag>
      ),
    },
    {
      title: 'จำนวน',
      dataIndex: 'quantity',
      width: 90,
      align: 'right',
      render: (_: number, r: StockEntry) => (
        <span style={{ color: quantityColor(r.type), fontWeight: 500 }}>
          {quantityDisplay(r)}
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
      render: (v?: number) => (v != null ? <strong>{v}</strong> : '-'),
    },
    {
      title: 'ราคาทุน/หน่วย',
      dataIndex: 'costPricePerUnit',
      width: 120,
      align: 'right',
      render: (v?: number | null) => (v != null ? `฿${Number(v).toLocaleString()}` : '-'),
    },
    {
      title: 'มูลค่า',
      key: 'totalCost',
      width: 110,
      align: 'right',
      render: (_: unknown, r: StockEntry) => {
        if (r.costPricePerUnit == null) return '-';
        return `฿${(r.quantity * Number(r.costPricePerUnit)).toLocaleString()}`;
      },
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
        subtitle={`ทั้งหมด ${total.toLocaleString()} รายการ`}
        actions={
          <>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>
              รีเฟรช
            </Button>
            <Button icon={<AppIcons.exportFile size={16} />} onClick={handleExport} loading={exporting}>
              Export Excel
            </Button>
          </>
        }
      />

      <Flex gap={12} wrap style={{ marginBottom: 16 }}>
        <SummaryCard title="รายการทั้งหมด" value={total} suffix="รายการ" color={colors.brand.primary} style={{ flex: 1, minWidth: 160 }} />
        <SummaryCard title="มูลค่ารับเข้า (หน้านี้)" value={receiveValue} prefix="฿" formatter={(v) => Number(v).toLocaleString()} color={colors.semantic.success} style={{ flex: 1, minWidth: 160 }} />
        <SummaryCard title="มูลค่าของเสีย (หน้านี้)" value={damageValue} prefix="฿" formatter={(v) => Number(v).toLocaleString()} color={colors.semantic.error} style={{ flex: 1, minWidth: 160 }} />
      </Flex>

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
        <Flex gap={8} wrap>
          <Select
            allowClear
            placeholder="สินค้า"
            showSearch={{ optionFilterProp: 'label' }}
            style={{ width: 220 }}
            options={productOptions}
            value={search}
            onChange={(v) => setTableState({ ...tableState, search: v ?? '', page: 1 })}
          />
          <Select
            allowClear
            placeholder="ประเภท"
            style={{ width: 150 }}
            options={TYPE_OPTIONS}
            value={type || undefined}
            onChange={(v) => setTableState({ ...tableState, type: v ?? '', page: 1 })}
          />
          <Select
            allowClear
            placeholder="พนักงาน"
            showSearch={{ optionFilterProp: 'label' }}
            style={{ width: 180 }}
            options={employeeOptions}
            value={employeeId || undefined}
            onChange={(v) => setTableState({ ...tableState, employeeId: v ?? '', page: 1 })}
          />
          <RangePicker
            style={{ width: 240 }}
            value={dateRange}
            onChange={(dates) => setTableState({
              ...tableState,
              startDate: dates?.[0]?.toISOString() ?? '',
              endDate: dates?.[1]?.toISOString() ?? '',
              page: 1,
            })}
            format="DD/MM/YYYY"
            placeholder={['วันที่เริ่ม', 'วันที่สิ้นสุด']}
          />
        </Flex>
      </Card>

      <Table<StockEntry>
        rowKey="id"
        columns={columns}
        dataSource={entries}
        loading={isLoading}
        scroll={{ x: 1100 }}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => setTableState({ ...tableState, page: p, pageSize: ps }),
        }}
      />
    </div>
  );
}
