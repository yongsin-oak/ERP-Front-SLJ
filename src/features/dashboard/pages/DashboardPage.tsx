import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
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
import { Button, PageHeader, Table, Select, CodeCell, DateCell, Card, Tag, Segmented, Alert, SummaryCard, Stack, Inline, Grid, Text, AppIcons } from '@design-system';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardStats, useDailyRevenue, useRecentOrders, useLowStock, dashboardKeys } from '../react-query';
import { useShops } from '@features/shop';
import type { ColumnType } from '@design-system';
import type { RecentOrder, LowStockProduct } from '../types';
import { cn } from '@/lib/utils';

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
    <div
      onClick={onClick}
      className={cn(
        'h-full rounded-lg border border-border bg-card p-6 text-card-foreground transition-shadow',
        onClick ? 'cursor-pointer hover:shadow-md' : 'cursor-default',
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div
            className={cn('mt-1 flex items-baseline gap-1 text-[28px] font-semibold', !color && 'text-foreground')}
            style={color ? { color } : undefined}
          >
            {prefix && <span>{prefix}</span>}
            <span>{loading ? '-' : value}</span>
            {suffix && <span className="text-sm font-normal text-muted-foreground">{suffix}</span>}
          </div>
        </div>
        <div
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-[10px] text-xl',
            !color && 'bg-accent text-foreground-subtle',
          )}
          style={color ? { background: `color-mix(in srgb, ${color} 9%, transparent)`, color } : undefined}
        >
          {icon}
        </div>
      </div>
    </div>
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
            <DateCell value={r.createdAt} format="DD/MM HH:mm" />
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
          <CodeCell className="text-foreground-subtle" style={{ fontSize: 11 }}>{r.barcode}</CodeCell>
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
    <Stack gap={5}>
      <PageHeader
        title="แดชบอร์ด"
        subtitle={`อัพเดตล่าสุด: ${dayjs().format('DD/MM/YYYY HH:mm')}`}
        actions={
          <Button icon={<AppIcons.refresh />} onClick={handleRefetch}>
            รีเฟรช
          </Button>
        }
      />

      <Card size="small">
        <Inline wrap>
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
        </Inline>
      </Card>

      <Grid cols={4} gap={4}>
        <StatCard
          title={`Order ${periodLabel}`}
          value={stats?.todayOrders}
          suffix="รายการ"
          icon={<AppIcons.cart />}
          color="var(--color-info)"
          loading={statsLoading}
          onClick={() => navigate('/order')}
        />
        <StatCard
          title={`ยอดขาย${periodLabel}`}
          value={stats?.todayRevenue?.toLocaleString()}
          prefix="฿"
          icon={<AppIcons.trendUp />}
          color="var(--color-success)"
          loading={statsLoading}
        />
        <StatCard
          title={`กำไร${periodLabel}`}
          value={periodProfit.toLocaleString()}
          prefix="฿"
          suffix={profitMargin > 0 ? `(${profitMargin}%)` : undefined}
          icon={<AppIcons.trendDown />}
          color={periodProfit >= 0 ? 'var(--color-success)' : 'var(--color-error)'}
          loading={statsLoading}
        />
        <StatCard
          title="สินค้าใกล้หมด"
          value={lowStock.length}
          suffix="รายการ"
          icon={<AppIcons.warning />}
          color={lowStock.length > 0 ? 'var(--color-warning)' : 'var(--color-foreground-subtle)'}
          loading={lowStockLoading}
          onClick={() => navigate('/inventory')}
        />
      </Grid>

      <Grid cols={4} gap={4}>
        <StatCard
          title="สินค้าทั้งหมด"
          value={stats?.totalProducts}
          suffix="รายการ"
          icon={<AppIcons.inbox />}
          loading={statsLoading}
          onClick={() => navigate('/inventory')}
        />
        <StatCard
          title="พนักงาน"
          value={stats?.totalEmployees}
          suffix="คน"
          icon={<AppIcons.employees />}
          loading={statsLoading}
          onClick={() => navigate('/employee')}
        />
        <StatCard
          title="ยอดขายรวม"
          value={stats?.totalRevenue?.toLocaleString()}
          prefix="฿"
          icon={<AppIcons.cart />}
          color="var(--color-primary)"
          loading={statsLoading}
        />
        <SummaryCard
          title="ต้นทุนรวม"
          value={stats?.totalCost?.toLocaleString() ?? '-'}
          prefix="฿"
          color="var(--color-muted-foreground)"
          style={{ height: '100%' }}
        />
      </Grid>

      <Grid cols={3} gap={4}>
        <Card title={`รายได้ ${periodLabel}`} className="lg:col-span-2">
            {dailyLoading ? (
              <Stack gap={2}>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </Stack>
            ) : daily.length === 0 ? (
              <Alert type="info" message="ยังไม่มีข้อมูล" showIcon />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={daily} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-info)" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-error)" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="var(--color-error)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    formatter={(value, name) => [
                      `฿${Number(value).toLocaleString()}`,
                      name === 'revenue' ? 'รายได้' : 'ต้นทุน',
                    ]}
                  />
                  <Legend formatter={(v) => (v === 'revenue' ? 'รายได้' : 'ต้นทุน')} />
                  <Area type="monotone" dataKey="revenue" stroke="var(--color-info)" fill="url(#gradRevenue)" strokeWidth={2} />
                  <Area type="monotone" dataKey="cost" stroke="var(--color-error)" fill="url(#gradCost)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
        </Card>

        <Card
          title={
            <Inline>
              <AppIcons.warning className="text-warning" />
              สินค้าใกล้หมด
            </Inline>
          }
          extra={
            <Button size="small" onClick={() => navigate('/inventory')}>ดูทั้งหมด</Button>
          }
          style={{ height: '100%' }}
        >
          {lowStockLoading ? (
            <Stack gap={2}>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </Stack>
          ) : lowStock.length === 0 ? (
            <Alert type="success" title="สินค้าทุกรายการมีเพียงพอ" showIcon />
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
      </Grid>

      <Card
        title="Order ล่าสุด"
        extra={
          <Button size="small" variant="primary" onClick={() => navigate('/order')}>
            ดูทั้งหมด
          </Button>
        }
      >
        {recentLoading ? (
          <Stack gap={2}>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </Stack>
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
    </Stack>
  );
}
