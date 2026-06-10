import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  InputNumber, Space, Flex, Progress, Row, Col, Card, Popconfirm, Alert,
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, CheckCircleOutlined,
  FileExcelOutlined, SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Table, Button, PageHeader, Tag, Input, colors, AppIcons, SummaryCard } from '@design-system';
import type { ColumnType } from '@design-system';
import {
  useStockCount,
  useUpdateStockCountItems,
  useCompleteStockCount,
  useApplyStockCountAdjustments,
  stockCountService,
} from '../react-query';
import { StockCountStatuses } from '../types';
import type { StockCountItem, StockCountStatus } from '../types';

type CountFilter = 'all' | 'uncounted' | 'counted';

export function StockCountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: res, isLoading } = useStockCount(id!);
  const session = res?.data;
  const items = session?.items ?? [];

  const [countMap, setCountMap] = useState<Map<string, number>>(new Map());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<CountFilter>('all');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState<'blank' | 'result' | null>(null);

  const updateItems = useUpdateStockCountItems(id!);
  const completeCount = useCompleteStockCount();
  const applyAdjustments = useApplyStockCountAdjustments();

  const isDraft = session?.status === 'Draft';

  function getEffectiveQty(item: StockCountItem): number | null {
    if (countMap.has(item.productBarcode)) {
      return countMap.get(item.productBarcode)!;
    }
    return item.countedQty;
  }

  const displayItems = useMemo(() => {
    let result = items;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (i) =>
          i.productBarcode.toLowerCase().includes(q) ||
          i.product?.name.toLowerCase().includes(q),
      );
    }
    if (filter === 'uncounted') {
      result = result.filter((i) => getEffectiveQty(i) == null);
    } else if (filter === 'counted') {
      result = result.filter((i) => getEffectiveQty(i) != null);
    }
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, search, filter, countMap]);

  const totalItems = items.length;
  const countedItems = items.filter((i) => getEffectiveQty(i) != null).length;
  const pct = totalItems > 0 ? Math.round((countedItems / totalItems) * 100) : 0;
  const hasChanges = countMap.size > 0;

  async function handleSave() {
    if (!hasChanges) return;
    const payload = Array.from(countMap.entries()).map(([productBarcode, countedQty]) => ({
      productBarcode,
      countedQty,
    }));
    await updateItems.mutateAsync({ items: payload });
    setCountMap(new Map());
  }

  async function handleComplete() {
    if (hasChanges) await handleSave();
    await completeCount.mutateAsync(id!);
  }

  async function handleExportBlank() {
    setExporting('blank');
    try { await stockCountService.exportBlank(id!); } finally { setExporting(null); }
  }

  async function handleExportResult() {
    setExporting('result');
    try { await stockCountService.exportResult(id!); } finally { setExporting(null); }
  }

  const filterOptions: { label: string; value: CountFilter }[] = [
    { label: 'ทั้งหมด', value: 'all' },
    { label: 'ยังไม่นับ', value: 'uncounted' },
    { label: 'นับแล้ว', value: 'counted' },
  ];

  const columns: ColumnType<StockCountItem>[] = [
    {
      title: 'Barcode',
      dataIndex: 'productBarcode',
      width: 140,
      render: (v: string) => <code style={{ fontSize: 11 }}>{v}</code>,
    },
    {
      title: 'สินค้า',
      key: 'product',
      render: (_: unknown, r: StockCountItem) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 13 }}>{r.product?.name ?? '-'}</div>
          {r.product?.category && (
            <div style={{ fontSize: 11, color: colors.text.tertiary }}>
              {r.product.category.name}
              {r.product.brand ? ` · ${r.product.brand.name}` : ''}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'สต็อกในระบบ',
      dataIndex: 'systemQty',
      width: 120,
      align: 'right',
      render: (v: number) => <span style={{ fontWeight: 500 }}>{v.toLocaleString()}</span>,
    },
    {
      title: 'จำนวนที่นับได้',
      key: 'countedQty',
      width: 160,
      align: 'right',
      render: (_: unknown, r: StockCountItem) => {
        const effective = getEffectiveQty(r);
        if (!isDraft) {
          return effective != null ? (
            <span style={{ fontWeight: 500 }}>{effective.toLocaleString()}</span>
          ) : '-';
        }
        return (
          <InputNumber
            min={0}
            value={effective ?? undefined}
            placeholder="กรอกจำนวน"
            style={{ width: 110 }}
            onChange={(val) => {
              setCountMap((prev) => {
                const next = new Map(prev);
                if (val == null) {
                  next.delete(r.productBarcode);
                } else {
                  next.set(r.productBarcode, val);
                }
                return next;
              });
              setPage(1);
            }}
          />
        );
      },
    },
    {
      title: 'ส่วนต่าง',
      key: 'diff',
      width: 110,
      align: 'right',
      render: (_: unknown, r: StockCountItem) => {
        const effective = getEffectiveQty(r);
        if (effective == null) return <span style={{ color: colors.text.tertiary }}>-</span>;
        const diff = effective - r.systemQty;
        if (diff === 0) return <Tag color="default">0</Tag>;
        return (
          <Tag color={diff > 0 ? 'green' : 'red'}>
            {diff > 0 ? `+${diff}` : diff}
          </Tag>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div>
        <PageHeader title="นับสต็อก" />
        <div style={{ padding: 32, textAlign: 'center', color: colors.text.tertiary }}>
          กำลังโหลด...
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div>
        <PageHeader title="ไม่พบรายการนับสต็อก" />
        <Alert type="error" message="ไม่พบรายการนับสต็อกนี้" />
      </div>
    );
  }

  const status = session.status as StockCountStatus;

  return (
    <div>
      <PageHeader
        title={`นับสต็อก — ${session.id}`}
        subtitle={
          <Space>
            <Tag color={StockCountStatuses[status].color as string}>
              {StockCountStatuses[status].label}
            </Tag>
            <span>{dayjs(session.countDate).format('DD/MM/YYYY')}</span>
            {session.employee && (
              <span>{session.employee.firstName} ({session.employee.nickname})</span>
            )}
          </Space>
        }
        actions={
          <Space wrap>
            <Button
              variant="ghost"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/stock/count')}
            >
              กลับ
            </Button>
            <Button
              icon={<AppIcons.exportFile size={16} />}
              loading={exporting === 'blank'}
              onClick={handleExportBlank}
            >
              Export ใบนับ
            </Button>
            {status === 'Completed' && (
              <Button
                icon={<FileExcelOutlined />}
                loading={exporting === 'result'}
                onClick={handleExportResult}
              >
                Export ผลลัพธ์
              </Button>
            )}
            {status === 'Completed' && !session.adjustedAt && (
              <Popconfirm
                title="ปรับสต็อกตามผลนับ?"
                description={`จะสร้าง stock adjustment สำหรับทุกรายการที่มีส่วนต่าง และประวัติจะปรากฏใน /stock/history`}
                onConfirm={() => applyAdjustments.mutate(id!)}
                okText="ปรับสต็อก"
                cancelText="ยกเลิก"
              >
                <Button
                  variant="primary"
                  icon={<CheckCircleOutlined />}
                  loading={applyAdjustments.isPending}
                >
                  ปรับสต็อกตามผลนับ
                </Button>
              </Popconfirm>
            )}
            {status === 'Completed' && session.adjustedAt && (
              <Tag color="success">ปรับสต็อกแล้ว</Tag>
            )}
            {isDraft && (
              <>
                <Button
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={updateItems.isPending}
                  disabled={!hasChanges}
                >
                  บันทึก ({countMap.size})
                </Button>
                <Popconfirm
                  title="สิ้นสุดการนับสต็อก?"
                  description={`นับแล้ว ${countedItems}/${totalItems} รายการ — ไม่สามารถแก้ไขได้หลังสิ้นสุด`}
                  onConfirm={handleComplete}
                  okText="สิ้นสุด"
                  cancelText="ยกเลิก"
                  okButtonProps={{ danger: false }}
                  disabled={countedItems < totalItems}
                >
                  <Button
                    variant="primary"
                    icon={<CheckCircleOutlined />}
                    loading={completeCount.isPending}
                    disabled={countedItems < totalItems}
                    title={countedItems < totalItems ? `ยังเหลือ ${totalItems - countedItems} รายการที่ยังไม่นับ` : undefined}
                  >
                    สิ้นสุดการนับ
                  </Button>
                </Popconfirm>
              </>
            )}
          </Space>
        }
      />

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <SummaryCard title="สินค้าทั้งหมด" value={totalItems} suffix="รายการ" />
        </Col>
        <Col span={6}>
          <SummaryCard title="นับแล้ว" value={countedItems} suffix={`/ ${totalItems}`} color={colors.semantic.successText} />
        </Col>
        <Col span={6}>
          <SummaryCard title="ยังไม่นับ" value={totalItems - countedItems} suffix="รายการ" color={totalItems - countedItems > 0 ? colors.semantic.warningText : undefined} />
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ marginBottom: 4, fontSize: 12, color: colors.text.secondary }}>ความคืบหน้า</div>
            <Progress percent={pct} size="default" />
          </Card>
        </Col>
      </Row>

      <Flex gap={8} style={{ marginBottom: 16 }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="ค้นหาชื่อสินค้า หรือ barcode..."
          allowClear
          style={{ width: 300 }}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <Space>
          {filterOptions.map((opt) => (
            <Button
              key={opt.value}
              size="small"
              variant={filter === opt.value ? 'primary' : 'ghost'}
              onClick={() => { setFilter(opt.value); setPage(1); }}
            >
              {opt.label}
            </Button>
          ))}
        </Space>
      </Flex>

      <Table<StockCountItem>
        rowKey="id"
        columns={columns}
        dataSource={displayItems}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize: 50,
          total: displayItems.length,
          showSizeChanger: false,
          onChange: (p) => setPage(p),
        }}
        scroll={{ x: 800 }}
        rowClassName={(r) => {
          const eff = getEffectiveQty(r);
          if (eff == null) return '';
          const diff = eff - r.systemQty;
          if (diff < 0) return 'row-danger';
          if (diff > 0) return 'row-warning';
          return '';
        }}
      />
    </div>
  );
}
