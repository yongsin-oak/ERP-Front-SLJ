import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ToggleGroup } from 'radix-ui';
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
import { ShopSearchSelect } from '@features/shop/components/ShopSearchSelect';
import { AppIcons } from '@/lib/icons';
import { formatDate, formatMoney } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  alertBox,
  btn,
  CARD_SM,
  CARD_TITLE,
  CELL_CODE,
  PAGE_HEADER,
  PAGE_SUBTITLE,
  PAGE_TITLE,
  SEGMENTED_ITEM,
  SEGMENTED_ROOT,
  SKELETON,
  statusPill,
  TABLE,
  TABLE_EMPTY,
  TABLE_TD,
  TABLE_TH,
  TABLE_TR,
  TABLE_WRAP,
  tag,
  TEXT,
} from '@/lib/styles';
import {
  useDashboardStats,
  useDailyRevenue,
  useRecentOrders,
  useLowStock,
  dashboardKeys,
} from '../react-query';

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

const SKELETON_ROWS = 5;

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
      return {
        dateFrom: start.format('YYYY-MM-DD'),
        dateTo: today,
        days: now.diff(start, 'day') + 1,
      };
    }
  }
}

/** แถบโครงร่างระหว่างรอข้อมูล — บอกว่ามีเนื้อหากำลังมา ไม่ใช่ว่าง */
function SkeletonRows({ count = SKELETON_ROWS }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2" role="status" aria-label="กำลังโหลด">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn(SKELETON, 'h-4', i === count - 1 ? 'w-3/4' : 'w-full')} />
      ))}
    </div>
  );
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
  /** ค่า CSS color — ส่งเป็น var(--color-…) จากโทเคนเสมอ ไม่ใช่ hex */
  color?: string;
  icon: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
}) {
  const body = (
    <div className="flex items-start justify-between">
      <div>
        <div className={TEXT.muted}>{title}</div>
        <div
          className={cn(
            'mt-2 flex items-baseline gap-1 text-[28px] font-semibold tracking-tight tabular-nums',
            !color && 'text-foreground',
          )}
          style={color ? { color } : undefined}
        >
          {prefix && <span>{prefix}</span>}
          <span>{loading ? '-' : value}</span>
          {suffix && <span className="text-sm font-normal text-foreground-lighter">{suffix}</span>}
        </div>
      </div>
      <div
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-[10px] text-xl',
          !color && 'bg-accent text-foreground-subtle',
        )}
        style={
          color ? { background: `color-mix(in srgb, ${color} 9%, transparent)`, color } : undefined
        }
      >
        {icon}
      </div>
    </div>
  );

  // การ์ดที่กดได้ต้องเป็น <button> จริง — ไม่ใช่ <div onClick> ที่คีย์บอร์ดเข้าไม่ถึง
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="h-full w-full rounded-xl border border-border bg-card p-5 text-left text-card-foreground transition-all hover:-translate-y-0.5 hover:border-border-stronger"
      >
        {body}
      </button>
    );
  }

  return (
    <div className="h-full rounded-xl border border-border bg-card p-5 text-card-foreground">
      {body}
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

  const { data: stats, isLoading: statsLoading } = useDashboardStats({ shopId, dateFrom, dateTo });
  const { data: daily = [], isLoading: dailyLoading } = useDailyRevenue({ days, shopId });
  const { data: recentOrders = [], isLoading: recentLoading } = useRecentOrders({
    limit: 8,
    shopId,
  });
  const { data: lowStock = [], isLoading: lowStockLoading } = useLowStock(5);

  const handleRefetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
  }, [queryClient]);

  const periodProfit = (stats?.todayRevenue ?? 0) - (stats?.todayCost ?? 0);
  const profitMargin =
    stats?.todayRevenue ? Math.round((periodProfit / stats.todayRevenue) * 100) : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className={PAGE_HEADER}>
        <div className="min-w-0">
          <h1 className={PAGE_TITLE}>แดชบอร์ด</h1>
          <p className={PAGE_SUBTITLE}>อัพเดตล่าสุด: {dayjs().format('DD/MM/YYYY HH:mm')}</p>
        </div>
        <button type="button" className={btn()} onClick={handleRefetch}>
          <AppIcons.refresh />
          รีเฟรช
        </button>
      </div>

      <section className={CARD_SM}>
        <div className="flex flex-wrap items-center gap-3">
          <span className={TEXT.muted}>ช่วงเวลา:</span>
          <ToggleGroup.Root
            type="single"
            value={period}
            // ToggleGroup ยอมให้ "ไม่เลือกอะไรเลย" ได้ — กันค่าว่างไว้
            onValueChange={(v) => v && setPeriod(v as Period)}
            className={SEGMENTED_ROOT}
          >
            {PERIOD_OPTIONS.map((opt) => (
              <ToggleGroup.Item key={opt.value} value={opt.value} className={SEGMENTED_ITEM}>
                {opt.label}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>

          <span className={cn(TEXT.muted, 'ml-2')}>ร้านค้า:</span>
          <div className="w-45">
            <ShopSearchSelect
              placeholder="ทุกร้าน"
              allowClear
              value={shopId}
              onChange={(v) => setShopId(v)}
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={`Order ${periodLabel}`}
          value={stats?.todayOrders}
          suffix="รายการ"
          icon={<AppIcons.cart />}
          color="var(--color-primary)"
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
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <StatCard
          title="ต้นทุนรวม"
          value={stats?.totalCost?.toLocaleString() ?? '-'}
          prefix="฿"
          icon={<AppIcons.money />}
          loading={statsLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className={cn(CARD_SM, 'lg:col-span-2')}>
          <h2 className={CARD_TITLE}>รายได้ {periodLabel}</h2>
          <div className="mt-3">
            {dailyLoading ?
              <SkeletonRows count={6} />
            : daily.length === 0 ?
              <div className={alertBox('info')}>
                <AppIcons.alert />
                <span>ยังไม่มีข้อมูล</span>
              </div>
            : <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={daily} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.16} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-error)" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="var(--color-error)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}K`}
                  />
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
                    stroke="var(--color-primary)"
                    fill="url(#gradRevenue)"
                    strokeWidth={2.25}
                  />
                  <Area
                    type="monotone"
                    dataKey="cost"
                    stroke="var(--color-error)"
                    fill="url(#gradCost)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            }
          </div>
        </section>

        <section className={CARD_SM}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className={cn(CARD_TITLE, 'flex items-center gap-2')}>
              <AppIcons.warning className="text-warning" />
              สินค้าใกล้หมด
            </h2>
            <button type="button" className={btn('ghost', 'sm')} onClick={() => navigate('/inventory')}>
              ดูทั้งหมด
            </button>
          </div>

          <div className="mt-3">
            {lowStockLoading ?
              <SkeletonRows />
            : lowStock.length === 0 ?
              <div className={alertBox('success')}>
                <AppIcons.success />
                <span>สินค้าทุกรายการมีเพียงพอ</span>
              </div>
            : <div className={TABLE_WRAP}>
                <table className={TABLE}>
                  <thead>
                    <tr>
                      <th className={TABLE_TH}>สินค้า</th>
                      <th className={cn(TABLE_TH, 'w-20 text-right')}>คงเหลือ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((r) => (
                      <tr key={r.barcode} className={TABLE_TR}>
                        <td className={TABLE_TD}>
                          <div className="font-medium">{r.name}</div>
                          <code className={cn(CELL_CODE, 'text-[11px]')}>{r.barcode}</code>
                        </td>
                        <td className={cn(TABLE_TD, 'text-right')}>
                          <span className={statusPill(r.remaining === 0 ? 'error' : 'warning')}>
                            {r.remaining === 0 ? 'หมด' : `${r.remaining} ชิ้น`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
          </div>
        </section>
      </div>

      <section className={CARD_SM}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className={CARD_TITLE}>Order ล่าสุด</h2>
          <button type="button" className={btn('primary', 'sm')} onClick={() => navigate('/order')}>
            ดูทั้งหมด
          </button>
        </div>

        <div className="mt-3">
          {recentLoading ?
            <SkeletonRows />
          : <div className={TABLE_WRAP}>
              <table className={cn(TABLE, 'min-w-150')}>
                <thead>
                  <tr>
                    <th className={TABLE_TH}>Order</th>
                    <th className={TABLE_TH}>ร้านค้า</th>
                    <th className={cn(TABLE_TH, 'text-right')}>ยอด</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ?
                    <tr>
                      <td colSpan={3} className={TABLE_EMPTY}>
                        ยังไม่มีออเดอร์
                      </td>
                    </tr>
                  : recentOrders.map((r) => (
                      <tr key={r.id} className={TABLE_TR}>
                        <td className={TABLE_TD}>
                          <div className="font-medium">{`#${r.id.slice(0, 8)}`}</div>
                          <span className="font-mono text-xs tabular-nums text-foreground-lighter">
                            {formatDate(r.createdAt, 'DD/MM HH:mm')}
                          </span>
                        </td>
                        <td className={TABLE_TD}>
                          {r.shopName ?
                            <div>
                              <div className="text-sm">{r.shopName}</div>
                              {r.platform && (
                                <span className={cn(tag('neutral'), 'text-[11px]')}>
                                  {r.platform}
                                </span>
                              )}
                            </div>
                          : '-'}
                        </td>
                        <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                          <strong>{formatMoney(r.totalPrice, 0)}</strong>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </section>
    </div>
  );
}
