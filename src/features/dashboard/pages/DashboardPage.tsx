import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Card, Row, Col, Statistic, Table, Tag, Typography, Space, Skeleton, Alert, Segmented, Select } from 'antd';
import {
  ShoppingCartOutlined,
  InboxOutlined,
  TeamOutlined,
  RiseOutlined,
  FallOutlined,
  WarningOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import dayjs from 'dayjs';
import { Button, PageHeader } from '@design-system';
import { colors } from '@design-system';
import { useDashboardStats, useDailyRevenue, useRecentOrders, useLowStock, dashboardKeys } from '../react-query';
import { useShops } from '@features/shop';
import type { ColumnType } from '@design-system';
import type { RecentOrder, LowStockProduct } from '../types';

const { Text } = Typography;

type Period = 'today' | '7d' | '14d' | '30d' | 'month';

const PERIOD_OPTIONS: { label: string; value: Period }[] = [
  { label: 'วันนี้', value: 'today' },
  { label: '7 วัน', value: '7d' },
  { label: '14 วัน', value: '14d' },
  { label: '30 วัน', value: '30d' },
  { label: 'เดือนนี้', value: 'month' },
];

const PERIOD_LABEL: Record<Period, string> = {
  today: 'วันนี้',
  '7d': '7 วันล่าสุด',
  '14d': '14 วันล่าสุด',
  '30d': '30 วันล่าสุด',
  month: 'เดือนนี้',
};

function resolvePeriod(period: Period): { dateFrom: string; dateTo: string; days: number } {
  const now = dayjs();
  const today = now.format('YYYY-MM-DD');
  switch (period) {
    case 'today':
      return { dateFrom: today, dateTo: today, days: 1 };
    case '7d':
      return { dateFrom: now.subtract(6, 'day').format('YYYY-MM-DD'), dateTo: today, days: 7 };
    case '14d':
      return { dateFrom: now.subtract(13, 'day').format('YYYY-MM-DD'), dateTo: today, days: 14 };
    case '30d':
      return { dateFrom: now.subtract(29, 'day').format('YYYY-MM-DD'), dateTo: today, days: 30 };
    case 'month': {
      const start = now.startOf('month');
      return { dateFrom: start.format('YYYY-MM-DD'), dateTo: today, days: now.diff(start, 'day') + 1 };
    }
  }
}

function StatCard({
  title,
  value,
  prefix,
  suffix,
  color,
  icon,
  loading,
  onClick,
}: {
  title: string;
  value?: number | string;
  prefix?: string;
  suffix?: string;
  color?: string;
  icon: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
}) {
  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', height: '100%' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Statistic
          title={title}
          value={loading ? '-' : value}
          prefix={prefix}
          suffix={suffix}
          valueStyle={{ color: color ?? colors.text.primary, fontSize: 28 }}
          loading={loading}
        />
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: color ? `${color}18` : colors.bg.hover,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, color: color ?? colors.text.tertiary,
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState<Period>('7d');
  const [shopId, setShopId] = useState<string | undefined>();

  const { dateFrom, dateTo, days } = resolvePeriod(period);
  const periodLabel = PERIOD_LABEL[period];

  const { data: shops, isLoading: shopsLoading } = useShops();
  const { data: stats, isLoading: statsLoading } = useDashboardStats({ shopId, dateFrom, dateTo });
  const { data: daily = [], isLoading: dailyLoading } = useDailyRevenue({ days, shopId });
  const { data: recentOrders = [], isLoading: recentLoading } = useRecentOrders({ limit: 8, shopId });
  const { data: lowStock = [], isLoading: lowStockLoading } = useLowStock(5);

  const handleRefetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
  }, [queryClient]);

  const recentOrderColumns: ColumnType<RecentOrder>[] = [
    {
      title: 'Order',
      key: 'order',
      render: (_: unknown, r: RecentOrder) => (
        <div>
          <div style={{ fontWeight: 500 }}>{`#${r.id.slice(0, 8)}`}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(r.createdAt).format('DD/MM HH:mm')}
          </Text>
        </div>
      ),
    },
    {
      title: 'ร้านค้า',
      key: 'shop',
      render: (_: unknown, r: RecentOrder) => r.shopName ? (
        <div>
          <div style={{ fontSize: 13 }}>{r.shopName}</div>
          {r.platform && <Tag style={{ fontSize: 11 }}>{r.platform}</Tag>}
        </div>
      ) : '-',
    },
    {
      title: 'ยอด',
      dataIndex: 'totalPrice',
      align: 'right' as const,
      render: (v: number) => <strong>฿{v?.toLocaleString()}</strong>,
    },
  ];

  const lowStockColumns: ColumnType<LowStockProduct>[] = [
    {
      title: 'สินค้า',
      key: 'product',
      render: (_: unknown, r: LowStockProduct) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.name}</div>
          <code style={{ fontSize: 11, color: colors.text.tertiary }}>{r.barcode}</code>
        </div>
      ),
    },
    {
      title: 'คงเหลือ',
      dataIndex: 'remaining',
      align: 'right' as const,
      width: 80,
      render: (v: number) => (
        <Tag color={v === 0 ? 'red' : 'orange'} style={{ fontWeight: 600 }}>
          {v === 0 ? 'หมด' : `${v} ชิ้น`}
        </Tag>
      ),
    },
  ];

  const periodProfit = (stats?.todayRevenue ?? 0) - (stats?.todayCost ?? 0);
  const profitMargin = stats?.todayRevenue
    ? Math.round((periodProfit / stats.todayRevenue) * 100)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="แดชบอร์ด"
        subtitle={`อัพเดตล่าสุด: ${dayjs().format('DD/MM/YYYY HH:mm')}`}
        actions={
          <Button icon={<ReloadOutlined />} onClick={handleRefetch}>
            รีเฟรช
          </Button>
        }
      />

      {/* Filter bar */}
      <Card size="small">
        <Space wrap>
          <Text type="secondary" style={{ fontSize: 13 }}>ช่วงเวลา:</Text>
          <Segmented
            options={PERIOD_OPTIONS}
            value={period}
            onChange={(v) => setPeriod(v as Period)}
          />
          <Text type="secondary" style={{ fontSize: 13, marginLeft: 8 }}>ร้านค้า:</Text>
          <Select
            placeholder="ทุกร้าน"
            allowClear
            style={{ minWidth: 180 }}
            value={shopId}
            onChange={(v: string | undefined) => setShopId(v)}
            loading={shopsLoading}
            options={shops?.map((s) => ({ label: s.name, value: s.id }))}
          />
        </Space>
      </Card>

      {/* Stat Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={`Order ${periodLabel}`}
            value={stats?.todayOrders}
            suffix="รายการ"
            icon={<ShoppingCartOutlined />}
            color={colors.semantic.info}
            loading={statsLoading}
            onClick={() => navigate('/order')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={`ยอดขาย${periodLabel}`}
            value={stats?.todayRevenue?.toLocaleString()}
            prefix="฿"
            icon={<RiseOutlined />}
            color={colors.semantic.success}
            loading={statsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={`กำไร${periodLabel}`}
            value={periodProfit.toLocaleString()}
            prefix="฿"
            suffix={profitMargin > 0 ? `(${profitMargin}%)` : undefined}
            icon={<FallOutlined />}
            color={periodProfit >= 0 ? colors.semantic.success : colors.semantic.error}
            loading={statsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="สินค้าใกล้หมด"
            value={lowStock.length}
            suffix="รายการ"
            icon={<WarningOutlined />}
            color={lowStock.length > 0 ? colors.semantic.warning : colors.text.tertiary}
            loading={lowStockLoading}
            onClick={() => navigate('/inventory')}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="สินค้าทั้งหมด"
            value={stats?.totalProducts}
            suffix="รายการ"
            icon={<InboxOutlined />}
            loading={statsLoading}
            onClick={() => navigate('/inventory')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="พนักงาน"
            value={stats?.totalEmployees}
            suffix="คน"
            icon={<TeamOutlined />}
            loading={statsLoading}
            onClick={() => navigate('/employee')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="ยอดขายรวม"
            value={stats?.totalRevenue?.toLocaleString()}
            prefix="฿"
            icon={<ShoppingCartOutlined />}
            color={colors.brand.primary}
            loading={statsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: '100%' }}>
            <Statistic
              title="ต้นทุนรวม"
              value={stats?.totalCost?.toLocaleString() ?? '-'}
              prefix="฿"
              loading={statsLoading}
              valueStyle={{ color: colors.text.secondary, fontSize: 28 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Chart + Low stock */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title={`รายได้ ${periodLabel}`}>
            {dailyLoading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : daily.length === 0 ? (
              <Alert type="info" message="ยังไม่มีข้อมูล" showIcon />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={daily} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.semantic.info} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={colors.semantic.info} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.semantic.error} stopOpacity={0.12} />
                      <stop offset="95%" stopColor={colors.semantic.error} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border.default} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    formatter={(value, name) => [
                      `฿${Number(value).toLocaleString()}`,
                      name === 'revenue' ? 'รายได้' : 'ต้นทุน',
                    ]}
                  />
                  <Legend formatter={(v) => (v === 'revenue' ? 'รายได้' : 'ต้นทุน')} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={colors.semantic.info}
                    fill="url(#gradRevenue)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="cost"
                    stroke={colors.semantic.error}
                    fill="url(#gradCost)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: colors.semantic.warning }} />
                สินค้าใกล้หมด
              </Space>
            }
            extra={
              <Button size="small" onClick={() => navigate('/inventory')}>ดูทั้งหมด</Button>
            }
            style={{ height: '100%' }}
          >
            {lowStockLoading ? (
              <Skeleton active paragraph={{ rows: 5 }} />
            ) : lowStock.length === 0 ? (
              <Alert type="success" message="สินค้าทุกรายการมีเพียงพอ" showIcon />
            ) : (
              <Table<LowStockProduct>
                rowKey="barcode"
                columns={lowStockColumns}
                dataSource={lowStock}
                pagination={false}
                size="small"
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Card
        title="Order ล่าสุด"
        extra={
          <Button size="small" variant="primary" onClick={() => navigate('/order')}>
            ดูทั้งหมด
          </Button>
        }
      >
        {recentLoading ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : (
          <Table<RecentOrder>
            rowKey="id"
            columns={recentOrderColumns}
            dataSource={recentOrders}
            pagination={false}
            size="small"
            scroll={{ x: 600 }}
          />
        )}
      </Card>
    </div>
  );
}
