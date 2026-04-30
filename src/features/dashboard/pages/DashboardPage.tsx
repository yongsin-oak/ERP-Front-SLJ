import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Table, Tag, Typography, Space, Skeleton, Alert } from 'antd';
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
import { useDashboardStats, useDailyRevenue, useRecentOrders, useLowStock } from '../hooks';
import { OrderStatusColor, OrderStatusLabel } from '@features/order/types';
import type { OrderStatus } from '@features/order/types';
import type { ColumnType } from '@design-system';
import type { RecentOrder, LowStockProduct } from '../types';

const { Text } = Typography;

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
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { data: daily = [], isLoading: dailyLoading } = useDailyRevenue(7);
  const { data: recentOrders = [], isLoading: recentLoading } = useRecentOrders(8);
  const { data: lowStock = [], isLoading: lowStockLoading } = useLowStock(5);

  const recentOrderColumns: ColumnType<RecentOrder>[] = [
    {
      title: 'Order',
      key: 'order',
      render: (_: unknown, r: RecentOrder) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.orderNumber ?? `#${r.id.slice(0, 8)}`}</div>
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
      title: 'พนักงาน',
      dataIndex: 'employeeName',
      render: (v: string) => v ?? '-',
    },
    {
      title: 'ยอด',
      dataIndex: 'totalSellingPrice',
      align: 'right' as const,
      render: (v: number) => <strong>฿{v?.toLocaleString()}</strong>,
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      width: 110,
      render: (v: OrderStatus) => (
        <Tag color={OrderStatusColor[v]}>{OrderStatusLabel[v]}</Tag>
      ),
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
      dataIndex: 'stock',
      align: 'right' as const,
      width: 80,
      render: (v: number) => (
        <Tag color={v === 0 ? 'red' : 'orange'} style={{ fontWeight: 600 }}>
          {v === 0 ? 'หมด' : `${v} ชิ้น`}
        </Tag>
      ),
    },
  ];

  const todayProfit = (stats?.todayRevenue ?? 0) - (stats?.todayCost ?? 0);
  const profitMargin = stats?.todayRevenue
    ? Math.round((todayProfit / stats.todayRevenue) * 100)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="แดชบอร์ด"
        subtitle={`อัพเดตล่าสุด: ${dayjs().format('DD/MM/YYYY HH:mm')}`}
        actions={
          <Button icon={<ReloadOutlined />} onClick={() => refetchStats()}>
            รีเฟรช
          </Button>
        }
      />

      {/* Stat Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Order วันนี้"
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
            title="ยอดขายวันนี้"
            value={stats?.todayRevenue?.toLocaleString()}
            prefix="฿"
            icon={<RiseOutlined />}
            color={colors.semantic.success}
            loading={statsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="กำไรวันนี้"
            value={todayProfit.toLocaleString()}
            prefix="฿"
            suffix={profitMargin > 0 ? `(${profitMargin}%)` : undefined}
            icon={<FallOutlined />}
            color={todayProfit >= 0 ? colors.semantic.success : colors.semantic.error}
            loading={statsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="สินค้าใกล้หมด"
            value={stats?.lowStockCount}
            suffix="รายการ"
            icon={<WarningOutlined />}
            color={lowStock.length > 0 ? colors.semantic.warning : colors.text.tertiary}
            loading={statsLoading}
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
            title="สินค้าวันนี้ (ชิ้น)"
            value={stats?.todayItems}
            suffix="ชิ้น"
            icon={<ShoppingCartOutlined />}
            color={colors.brand.primary}
            loading={statsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: '100%' }}>
            <Statistic
              title="ต้นทุนวันนี้"
              value={stats?.todayCost?.toLocaleString() ?? '-'}
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
          <Card title="รายได้ 7 วันล่าสุด">
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
                rowKey="id"
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
