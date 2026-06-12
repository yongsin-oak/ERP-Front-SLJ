import { useState } from 'react';
import { Flex, Card, Tag, Tabs, Space, DatePicker } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { PageHeader, MoneyCell, Button, AppIcons, colors, Table, Select, CodeCell } from '@design-system';
import { downloadFile, showError, notify } from '@shared';
import { useSalesSummary, useSalesByShop, useSalesByProduct, useManHour, reportService } from '../react-query';
import { useShops } from '@features/shop';
import { useEmployees } from '@features/employee/react-query';
import { useCategories } from '@features/category';
import { useBrands } from '@features/brand';
import { REPORT_GROUP_BY } from '../types';
import type { ReportGroupBy, SalesSummaryItem, SalesByShopItem, SalesByProductItem, ManHourItem } from '../types';
import type { ColumnType } from '@design-system';

const { RangePicker } = DatePicker;

const DEFAULT_DATE_FROM = dayjs().subtract(29, 'day').format('YYYY-MM-DD');
const DEFAULT_DATE_TO = dayjs().format('YYYY-MM-DD');

const GROUP_BY_OPTIONS: { label: string; value: ReportGroupBy }[] = [
  { label: 'รายวัน', value: REPORT_GROUP_BY.DAY },
  { label: 'รายสัปดาห์', value: REPORT_GROUP_BY.WEEK },
  { label: 'รายเดือน', value: REPORT_GROUP_BY.MONTH },
];

function ProfitCell({ value }: { value: number }) {
  const color = value > 0 ? colors.semantic.successText : value < 0 ? colors.semantic.errorText : colors.text.secondary;
  return <span style={{ color, fontWeight: 600 }}>฿{value.toLocaleString()}</span>;
}

function SalesSummaryTab({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) {
  const [shopId, setShopId] = useState<string | undefined>();
  const [groupBy, setGroupBy] = useState<ReportGroupBy>(REPORT_GROUP_BY.DAY);
  const { data: shops, isLoading: shopsLoading } = useShops();
  const { data = [], isFetching } = useSalesSummary({ dateFrom, dateTo, shopId, groupBy });
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    const key = notify.loading('กำลังส่งออก Excel ยอดขายรวม...');
    try {
      const res = await reportService.exportSalesSummary({ dateFrom, dateTo, shopId, groupBy });
      downloadFile(res.data as unknown as Blob, `ยอดขายรวม_${dateFrom}_${dateTo}.xlsx`);
      notify.resolve(key, 'success', 'ส่งออก Excel ยอดขายรวม สำเร็จ');
    } catch (err) {
      notify.dismiss(key);
      showError(err, 'ส่งออก Excel ยอดขายรวม');
    } finally { setExporting(false); }
  }

  const columns: ColumnType<SalesSummaryItem>[] = [
    { title: 'วันที่', dataIndex: 'date', width: 130, sorter: (a, b) => a.date.localeCompare(b.date) },
    { title: 'จำนวน Order', dataIndex: 'orderCount', align: 'right', width: 120, sorter: (a, b) => a.orderCount - b.orderCount },
    {
      title: 'รายได้', dataIndex: 'revenue', align: 'right',
      sorter: (a, b) => a.revenue - b.revenue,
      render: (v: number) => <MoneyCell value={v} />,
    },
    {
      title: 'ต้นทุน', dataIndex: 'cost', align: 'right',
      sorter: (a, b) => a.cost - b.cost,
      render: (v: number) => <MoneyCell value={v} />,
    },
    {
      title: 'กำไร', dataIndex: 'profit', align: 'right',
      sorter: (a, b) => a.profit - b.profit,
      render: (v: number) => <ProfitCell value={v} />,
    },
  ];

  return (
    <>
      <Space wrap style={{ marginBottom: 16 }}>
        <Select
          placeholder="ทุกร้าน"
          allowClear
          style={{ minWidth: 180 }}
          value={shopId}
          onChange={(v: string | undefined) => setShopId(v)}
          loading={shopsLoading}
          options={shops?.map((s) => ({ label: s.name, value: s.id }))}
        />
        <Select
          style={{ width: 140 }}
          value={groupBy}
          onChange={(v) => setGroupBy(v)}
          options={GROUP_BY_OPTIONS}
        />
        <Button icon={<AppIcons.exportFile size={16} />} onClick={handleExport} loading={exporting}>Export Excel</Button>
      </Space>
      <Table<SalesSummaryItem>
        rowKey="date"
        columns={columns}
        dataSource={data}
        loading={isFetching}
        size="small"
        pagination={false}
        scroll={{ y: 480 }}
        summary={(rows) => {
          const totals = rows.reduce(
            (acc, r) => ({ revenue: acc.revenue + r.revenue, cost: acc.cost + r.cost, profit: acc.profit + r.profit, orderCount: acc.orderCount + r.orderCount }),
            { revenue: 0, cost: 0, profit: 0, orderCount: 0 },
          );
          return (
            <Table.Summary.Row style={{ fontWeight: 700 }}>
              <Table.Summary.Cell index={0}>รวม</Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">{totals.orderCount.toLocaleString()}</Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="right"><MoneyCell value={totals.revenue} /></Table.Summary.Cell>
              <Table.Summary.Cell index={3} align="right"><MoneyCell value={totals.cost} /></Table.Summary.Cell>
              <Table.Summary.Cell index={4} align="right"><ProfitCell value={totals.profit} /></Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    </>
  );
}

function SalesByShopTab({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) {
  const { data = [], isFetching } = useSalesByShop({ dateFrom, dateTo });
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    const key = notify.loading('กำลังส่งออก Excel ยอดขายตามร้าน...');
    try {
      const res = await reportService.exportSalesByShop({ dateFrom, dateTo });
      downloadFile(res.data as unknown as Blob, `ยอดขายตามร้าน_${dateFrom}_${dateTo}.xlsx`);
      notify.resolve(key, 'success', 'ส่งออก Excel ยอดขายตามร้าน สำเร็จ');
    } catch (err) {
      notify.dismiss(key);
      showError(err, 'ส่งออก Excel ยอดขายตามร้าน');
    } finally { setExporting(false); }
  }

  const columns: ColumnType<SalesByShopItem>[] = [
    { title: 'ร้านค้า', dataIndex: 'shopName', sorter: (a, b) => a.shopName.localeCompare(b.shopName) },
    {
      title: 'Platform', dataIndex: 'platform', width: 120,
      render: (v: string) => <Tag>{v}</Tag>,
    },
    { title: 'จำนวน Order', dataIndex: 'orderCount', align: 'right', width: 130, sorter: (a, b) => a.orderCount - b.orderCount },
    {
      title: 'รายได้', dataIndex: 'revenue', align: 'right',
      defaultSortOrder: 'descend' as const,
      sorter: (a, b) => a.revenue - b.revenue,
      render: (v: number) => <MoneyCell value={v} />,
    },
    {
      title: 'ต้นทุน', dataIndex: 'cost', align: 'right',
      sorter: (a, b) => a.cost - b.cost,
      render: (v: number) => <MoneyCell value={v} />,
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button icon={<AppIcons.exportFile size={16} />} onClick={handleExport} loading={exporting}>Export Excel</Button>
      </div>
      <Table<SalesByShopItem>
        rowKey="shopId"
        columns={columns}
        dataSource={data}
        loading={isFetching}
        size="small"
        pagination={false}
        scroll={{ y: 480 }}
        summary={(rows) => {
          const totals = rows.reduce(
            (acc, r) => ({ revenue: acc.revenue + r.revenue, cost: acc.cost + r.cost, orderCount: acc.orderCount + r.orderCount }),
            { revenue: 0, cost: 0, orderCount: 0 },
          );
          return (
            <Table.Summary.Row style={{ fontWeight: 700 }}>
              <Table.Summary.Cell index={0}>รวม</Table.Summary.Cell>
              <Table.Summary.Cell index={1} />
              <Table.Summary.Cell index={2} align="right">{totals.orderCount.toLocaleString()}</Table.Summary.Cell>
              <Table.Summary.Cell index={3} align="right"><MoneyCell value={totals.revenue} /></Table.Summary.Cell>
              <Table.Summary.Cell index={4} align="right"><MoneyCell value={totals.cost} /></Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    </>
  );
}

function SalesByProductTab({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) {
  const [shopId, setShopId] = useState<string | undefined>();
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [brandId, setBrandId] = useState<string | undefined>();
  const { data: shops, isLoading: shopsLoading } = useShops();
  const { data: categoriesPage, isLoading: catsLoading } = useCategories();
  const { data: brandsPage, isLoading: brandsLoading } = useBrands();
  const { data = [], isFetching } = useSalesByProduct({ dateFrom, dateTo, shopId, categoryId, brandId });
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    const key = notify.loading('กำลังส่งออก Excel ยอดขายตามสินค้า...');
    try {
      const res = await reportService.exportSalesByProduct({ dateFrom, dateTo, shopId, categoryId, brandId });
      downloadFile(res.data as unknown as Blob, `ยอดขายตามสินค้า_${dateFrom}_${dateTo}.xlsx`);
      notify.resolve(key, 'success', 'ส่งออก Excel ยอดขายตามสินค้า สำเร็จ');
    } catch (err) {
      notify.dismiss(key);
      showError(err, 'ส่งออก Excel ยอดขายตามสินค้า');
    } finally { setExporting(false); }
  }

  const columns: ColumnType<SalesByProductItem>[] = [
    {
      title: 'สินค้า',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <CodeCell style={{ fontSize: 11, color: colors.text.tertiary }}>{r.barcode}</CodeCell>
        </div>
      ),
    },
    { title: 'Pack', dataIndex: 'quantityPack', align: 'right', width: 90, sorter: (a, b) => a.quantityPack - b.quantityPack },
    { title: 'Carton', dataIndex: 'quantityCarton', align: 'right', width: 90, sorter: (a, b) => a.quantityCarton - b.quantityCarton },
    {
      title: 'รายได้', dataIndex: 'revenue', align: 'right',
      defaultSortOrder: 'descend' as const,
      sorter: (a, b) => a.revenue - b.revenue,
      render: (v: number) => <MoneyCell value={v} />,
    },
    {
      title: 'ต้นทุน', dataIndex: 'cost', align: 'right',
      sorter: (a, b) => a.cost - b.cost,
      render: (v: number) => <MoneyCell value={v} />,
    },
    {
      title: 'กำไร', dataIndex: 'profit', align: 'right',
      sorter: (a, b) => a.profit - b.profit,
      render: (v: number) => <ProfitCell value={v} />,
    },
  ];

  return (
    <>
      <Space wrap style={{ marginBottom: 16 }}>
        <Select
          placeholder="ทุกร้าน"
          allowClear
          style={{ minWidth: 160 }}
          value={shopId}
          onChange={(v: string | undefined) => setShopId(v)}
          loading={shopsLoading}
          options={shops?.map((s) => ({ label: s.name, value: s.id }))}
        />
        <Select
          placeholder="ทุกหมวดหมู่"
          allowClear
          style={{ minWidth: 160 }}
          value={categoryId}
          onChange={(v: string | undefined) => setCategoryId(v)}
          loading={catsLoading}
          options={categoriesPage?.data?.map((c) => ({ label: c.name, value: c.id }))}
        />
        <Select
          placeholder="ทุกแบรนด์"
          allowClear
          style={{ minWidth: 160 }}
          value={brandId}
          onChange={(v: string | undefined) => setBrandId(v)}
          loading={brandsLoading}
          options={brandsPage?.data?.map((b) => ({ label: b.name, value: b.id }))}
        />
        <Button icon={<AppIcons.exportFile size={16} />} onClick={handleExport} loading={exporting}>Export Excel</Button>
      </Space>
      <Table<SalesByProductItem>
        rowKey="barcode"
        columns={columns}
        dataSource={data}
        loading={isFetching}
        size="small"
        pagination={false}
        virtual
        scroll={{ y: 480 }}
      />
    </>
  );
}

function ManHourTab({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) {
  const [employeeId, setEmployeeId] = useState<string | undefined>();
  const { data: employees, isLoading: empLoading } = useEmployees();
  const { data = [], isFetching } = useManHour({ dateFrom, dateTo, employeeId });
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    const key = notify.loading('กำลังส่งออก Excel ชั่วโมงทำงาน...');
    try {
      const res = await reportService.exportManHour({ dateFrom, dateTo, employeeId });
      downloadFile(res.data as unknown as Blob, `ชั่วโมงทำงาน_${dateFrom}_${dateTo}.xlsx`);
      notify.resolve(key, 'success', 'ส่งออก Excel ชั่วโมงทำงาน สำเร็จ');
    } catch (err) {
      notify.dismiss(key);
      showError(err, 'ส่งออก Excel ชั่วโมงทำงาน');
    } finally { setExporting(false); }
  }

  const columns: ColumnType<ManHourItem>[] = [
    { title: 'พนักงาน', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Order', dataIndex: 'orderCount', align: 'right', width: 100, sorter: (a, b) => a.orderCount - b.orderCount },
    {
      title: 'เวลารวม (นาที)', dataIndex: 'totalMinutes', align: 'right', width: 150,
      sorter: (a, b) => a.totalMinutes - b.totalMinutes,
      render: (v: number) => v.toLocaleString(),
    },
    {
      title: 'เฉลี่ย/Order (นาที)', dataIndex: 'avgMinutesPerOrder', align: 'right', width: 170,
      defaultSortOrder: 'ascend' as const,
      sorter: (a, b) => a.avgMinutesPerOrder - b.avgMinutesPerOrder,
    },
  ];

  return (
    <>
      <Space wrap style={{ marginBottom: 16 }}>
        <Select
          placeholder="ทุกพนักงาน"
          allowClear
          style={{ minWidth: 200 }}
          value={employeeId}
          onChange={(v: string | undefined) => setEmployeeId(v)}
          loading={empLoading}
          options={employees?.map((e) => ({
            label: `${e.firstName} ${e.lastName}`.trim(),
            value: e.id,
          }))}
        />
        <Button icon={<AppIcons.exportFile size={16} />} onClick={handleExport} loading={exporting}>Export Excel</Button>
      </Space>
      <Table<ManHourItem>
        rowKey="employeeId"
        columns={columns}
        dataSource={data}
        loading={isFetching}
        size="small"
        pagination={false}
        scroll={{ y: 480 }}
      />
    </>
  );
}

const TABS = [
  { key: 'summary', label: 'ยอดขายรวม' },
  { key: 'by-shop', label: 'ยอดขายตามร้าน' },
  { key: 'by-product', label: 'ยอดขายตามสินค้า' },
  { key: 'man-hour', label: 'ชั่วโมงทำงาน' },
];

export function ReportPage() {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs(DEFAULT_DATE_FROM),
    dayjs(DEFAULT_DATE_TO),
  ]);
  const [activeTab, setActiveTab] = useState('summary');

  const rangePresets: { label: string; value: [Dayjs, Dayjs] }[] = [
    { label: 'สัปดาห์นี้', value: [dayjs().startOf('week'), dayjs()] },
    { label: '7 วัน', value: [dayjs().subtract(6, 'day'), dayjs()] },
    { label: '30 วัน', value: [dayjs().subtract(29, 'day'), dayjs()] },
    { label: 'เดือนนี้', value: [dayjs().startOf('month'), dayjs()] },
    { label: '3 เดือน', value: [dayjs().subtract(89, 'day'), dayjs()] },
  ];

  const dateFrom = dateRange[0].format('YYYY-MM-DD');
  const dateTo = dateRange[1].format('YYYY-MM-DD');

  return (
    <Flex vertical gap={20}>
      <PageHeader
        title="รายงาน"
        subtitle={`${dateFrom} — ${dateTo}`}
        actions={
          <RangePicker
            value={dateRange}
            onChange={(v) => { if (v?.[0] && v[1]) setDateRange([v[0], v[1]]); }}
            presets={rangePresets}
            allowClear={false}
            format="DD/MM/YYYY"
          />
        }
      />
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={TABS.map(({ key, label }) => ({ key, label }))}
          style={{ marginBottom: 0 }}
        />
        <div style={{ marginTop: 16 }}>
          {activeTab === 'summary' && <SalesSummaryTab dateFrom={dateFrom} dateTo={dateTo} />}
          {activeTab === 'by-shop' && <SalesByShopTab dateFrom={dateFrom} dateTo={dateTo} />}
          {activeTab === 'by-product' && <SalesByProductTab dateFrom={dateFrom} dateTo={dateTo} />}
          {activeTab === 'man-hour' && <ManHourTab dateFrom={dateFrom} dateTo={dateTo} />}
        </div>
      </Card>
    </Flex>
  );
}
