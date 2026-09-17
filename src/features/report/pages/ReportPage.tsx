import { useMemo, useRef, useState } from 'react';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { Tabs } from 'radix-ui';
import { useVirtualizer } from '@tanstack/react-virtual';
import { downloadFile, showError, notify } from '@shared';
import { ShopSearchSelect } from '@features/shop/components/ShopSearchSelect';
import { EmployeeSearchSelect } from '@features/employee/components/EmployeeSearchSelect';
import { CategorySearchSelect } from '@features/category/components/CategorySearchSelect';
import { BrandSearchSelect } from '@features/brand/components/BrandSearchSelect';
import { AppIcons } from '@/lib/icons';
import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  btn,
  CARD_SM,
  CELL_CODE,
  INPUT,
  PAGE_HEADER,
  PAGE_SUBTITLE,
  PAGE_TITLE,
  TABLE,
  TABLE_EMPTY,
  TABLE_TD,
  TABLE_TH,
  TABLE_TR,
  TABLE_WRAP,
  TABS_LIST,
  TABS_TRIGGER,
  tag,
  TEXT,
  TH_SORT,
} from '@/lib/styles';
import { useSalesSummary, useSalesByShop, useSalesByProduct, useManHour, reportService } from '../react-query';
import { REPORT_GROUP_BY } from '../types';
import type {
  ReportGroupBy,
  SalesSummaryItem,
  SalesByShopItem,
  SalesByProductItem,
  ManHourItem,
} from '../types';

const DEFAULT_DATE_FROM = dayjs().subtract(29, 'day').format('YYYY-MM-DD');
const DEFAULT_DATE_TO = dayjs().format('YYYY-MM-DD');

/** แถวเกินเท่านี้จึงเริ่ม virtualize — ต่ำกว่านี้ค่า overhead ไม่คุ้ม */
const VIRTUAL_ROW_HEIGHT = 44;
const TABLE_MAX_HEIGHT = 480;

const GROUP_BY_OPTIONS: { label: string; value: ReportGroupBy }[] = [
  { label: 'รายวัน', value: REPORT_GROUP_BY.DAY },
  { label: 'รายสัปดาห์', value: REPORT_GROUP_BY.WEEK },
  { label: 'รายเดือน', value: REPORT_GROUP_BY.MONTH },
];

type SortOrder = 'asc' | 'desc';

/**
 * เรียงตารางรายงาน — ข้อมูลรายงานมาทั้งชุด (ไม่แบ่งหน้า) การเรียงจึงเรียงทั้งชุดจริง
 * ไม่ใช่แค่แถวที่เห็น ต่างจากตารางที่แบ่งหน้าฝั่ง server
 */
function useSort<T>(rows: T[], initialKey: keyof T, initialOrder: SortOrder = 'asc') {
  const [sort, setSort] = useState<{ key: keyof T; order: SortOrder }>({
    key: initialKey,
    order: initialOrder,
  });

  const sorted = useMemo(() => {
    const dir = sort.order === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av ?? '').localeCompare(String(bv ?? '')) * dir;
    });
  }, [rows, sort]);

  function toggle(key: keyof T) {
    setSort((s) => (s.key === key ? { key, order: s.order === 'asc' ? 'desc' : 'asc' } : { key, order: 'asc' }));
  }

  function icon(key: keyof T) {
    if (sort.key !== key) return <AppIcons.sort className="size-3 text-foreground-subtle" />;
    return sort.order === 'asc' ?
        <AppIcons.sortAsc className="size-3 text-foreground-light" />
      : <AppIcons.sortDesc className="size-3 text-foreground-light" />;
  }

  return { sorted, toggle, icon };
}

function SortTh<T>({
  label,
  field,
  sorter,
  className,
}: {
  label: string;
  field: keyof T;
  sorter: { toggle: (k: keyof T) => void; icon: (k: keyof T) => React.ReactNode };
  className?: string;
}) {
  return (
    <th className={cn(TABLE_TH, className)}>
      <button type="button" className={TH_SORT} onClick={() => sorter.toggle(field)}>
        {label}
        {sorter.icon(field)}
      </button>
    </th>
  );
}

function ProfitValue({ value }: { value: number }) {
  const colorClass =
    value > 0 ? 'text-success-text'
    : value < 0 ? 'text-destructive'
    : 'text-foreground-lighter';
  return <span className={cn('font-semibold', colorClass)}>{formatMoney(value)}</span>;
}

function ExportButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button type="button" className={btn()} onClick={onClick} disabled={loading}>
      {loading ? <AppIcons.loading spin /> : <AppIcons.exportFile />}
      Export Excel
    </button>
  );
}

function LoadingRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className={TABLE_EMPTY}>
        <AppIcons.loading spin className="mx-auto size-5 text-primary" />
      </td>
    </tr>
  );
}

function EmptyRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className={TABLE_EMPTY}>
        ไม่มีข้อมูลในช่วงวันที่ที่เลือก
      </td>
    </tr>
  );
}

/* ── Tab 1: ยอดขายรวม ─────────────────────────────────────────────────── */

function SalesSummaryTab({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) {
  const [shopId, setShopId] = useState<string | undefined>();
  const [groupBy, setGroupBy] = useState<ReportGroupBy>(REPORT_GROUP_BY.DAY);
  const { data = [], isFetching } = useSalesSummary({ dateFrom, dateTo, shopId, groupBy });
  const [exporting, setExporting] = useState(false);
  const sorter = useSort<SalesSummaryItem>(data, 'date');

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
    } finally {
      setExporting(false);
    }
  }

  const totals = data.reduce(
    (acc, r) => ({
      revenue: acc.revenue + r.revenue,
      cost: acc.cost + r.cost,
      profit: acc.profit + r.profit,
      orderCount: acc.orderCount + r.orderCount,
    }),
    { revenue: 0, cost: 0, profit: 0, orderCount: 0 },
  );

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="w-45">
          <ShopSearchSelect
            placeholder="ทุกร้าน"
            allowClear
            value={shopId}
            onChange={(v) => setShopId(v)}
          />
        </div>
        <select
          aria-label="จัดกลุ่มตามช่วงเวลา"
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as ReportGroupBy)}
          className={cn(INPUT, 'w-35')}
        >
          {GROUP_BY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ExportButton onClick={handleExport} loading={exporting} />
      </div>

      <div className={cn(TABLE_WRAP, 'max-h-120 overflow-y-auto')}>
        <table className={TABLE}>
          <thead className="sticky top-0 z-1">
            <tr>
              <SortTh<SalesSummaryItem> label="วันที่" field="date" sorter={sorter} className="w-33" />
              <SortTh<SalesSummaryItem>
                label="จำนวน Order"
                field="orderCount"
                sorter={sorter}
                className="w-30 text-right"
              />
              <SortTh<SalesSummaryItem> label="รายได้" field="revenue" sorter={sorter} className="text-right" />
              <SortTh<SalesSummaryItem> label="ต้นทุน" field="cost" sorter={sorter} className="text-right" />
              <SortTh<SalesSummaryItem> label="กำไร" field="profit" sorter={sorter} className="text-right" />
            </tr>
          </thead>
          <tbody>
            {isFetching ?
              <LoadingRow colSpan={5} />
            : data.length === 0 ?
              <EmptyRow colSpan={5} />
            : sorter.sorted.map((r) => (
                <tr key={r.date} className={TABLE_TR}>
                  <td className={cn(TABLE_TD, 'font-mono text-xs tabular-nums')}>{r.date}</td>
                  <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                    {r.orderCount.toLocaleString()}
                  </td>
                  <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                    {formatMoney(r.revenue)}
                  </td>
                  <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                    {formatMoney(r.cost)}
                  </td>
                  <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                    <ProfitValue value={r.profit} />
                  </td>
                </tr>
              ))
            }
          </tbody>
          {data.length > 0 && (
            <tfoot className="sticky bottom-0 bg-surface-200 font-medium">
              <tr>
                <td className={cn(TABLE_TD, 'border-t border-border')}>รวม</td>
                <td className={cn(TABLE_TD, 'border-t border-border text-right font-mono tabular-nums')}>
                  {totals.orderCount.toLocaleString()}
                </td>
                <td className={cn(TABLE_TD, 'border-t border-border text-right font-mono tabular-nums')}>
                  {formatMoney(totals.revenue)}
                </td>
                <td className={cn(TABLE_TD, 'border-t border-border text-right font-mono tabular-nums')}>
                  {formatMoney(totals.cost)}
                </td>
                <td className={cn(TABLE_TD, 'border-t border-border text-right font-mono tabular-nums')}>
                  <ProfitValue value={totals.profit} />
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </>
  );
}

/* ── Tab 2: ยอดขายตามร้าน ─────────────────────────────────────────────── */

function SalesByShopTab({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) {
  const { data = [], isFetching } = useSalesByShop({ dateFrom, dateTo });
  const [exporting, setExporting] = useState(false);
  const sorter = useSort<SalesByShopItem>(data, 'revenue', 'desc');

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
    } finally {
      setExporting(false);
    }
  }

  const totals = data.reduce(
    (acc, r) => ({
      revenue: acc.revenue + r.revenue,
      cost: acc.cost + r.cost,
      orderCount: acc.orderCount + r.orderCount,
    }),
    { revenue: 0, cost: 0, orderCount: 0 },
  );

  return (
    <>
      <div className="mb-4">
        <ExportButton onClick={handleExport} loading={exporting} />
      </div>

      <div className={cn(TABLE_WRAP, 'max-h-120 overflow-y-auto')}>
        <table className={TABLE}>
          <thead className="sticky top-0 z-1">
            <tr>
              <SortTh<SalesByShopItem> label="ร้านค้า" field="shopName" sorter={sorter} />
              <th className={cn(TABLE_TH, 'w-30')}>Platform</th>
              <SortTh<SalesByShopItem>
                label="จำนวน Order"
                field="orderCount"
                sorter={sorter}
                className="w-33 text-right"
              />
              <SortTh<SalesByShopItem> label="รายได้" field="revenue" sorter={sorter} className="text-right" />
              <SortTh<SalesByShopItem> label="ต้นทุน" field="cost" sorter={sorter} className="text-right" />
            </tr>
          </thead>
          <tbody>
            {isFetching ?
              <LoadingRow colSpan={5} />
            : data.length === 0 ?
              <EmptyRow colSpan={5} />
            : sorter.sorted.map((r) => (
                <tr key={r.shopId} className={TABLE_TR}>
                  <td className={TABLE_TD}>{r.shopName}</td>
                  <td className={TABLE_TD}>
                    <span className={tag('neutral')}>{r.platform}</span>
                  </td>
                  <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                    {r.orderCount.toLocaleString()}
                  </td>
                  <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                    {formatMoney(r.revenue)}
                  </td>
                  <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                    {formatMoney(r.cost)}
                  </td>
                </tr>
              ))
            }
          </tbody>
          {data.length > 0 && (
            <tfoot className="sticky bottom-0 bg-surface-200 font-medium">
              <tr>
                <td className={cn(TABLE_TD, 'border-t border-border')}>รวม</td>
                <td className={cn(TABLE_TD, 'border-t border-border')} />
                <td className={cn(TABLE_TD, 'border-t border-border text-right font-mono tabular-nums')}>
                  {totals.orderCount.toLocaleString()}
                </td>
                <td className={cn(TABLE_TD, 'border-t border-border text-right font-mono tabular-nums')}>
                  {formatMoney(totals.revenue)}
                </td>
                <td className={cn(TABLE_TD, 'border-t border-border text-right font-mono tabular-nums')}>
                  {formatMoney(totals.cost)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </>
  );
}

/* ── Tab 3: ยอดขายตามสินค้า (แถวเยอะ → virtualize) ───────────────────── */

function SalesByProductTab({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) {
  const [shopId, setShopId] = useState<string | undefined>();
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [brandId, setBrandId] = useState<string | undefined>();
  const { data = [], isFetching } = useSalesByProduct({ dateFrom, dateTo, shopId, categoryId, brandId });
  const [exporting, setExporting] = useState(false);
  const sorter = useSort<SalesByProductItem>(data, 'revenue', 'desc');
  const scrollRef = useRef<HTMLDivElement>(null);

  // รายงานตามสินค้ามีได้เป็นพันแถว — render จริงเฉพาะที่มองเห็น
  const rowVirtualizer = useVirtualizer({
    count: sorter.sorted.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => VIRTUAL_ROW_HEIGHT,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0 ?
      rowVirtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end
    : 0;

  async function handleExport() {
    setExporting(true);
    const key = notify.loading('กำลังส่งออก Excel ยอดขายตามสินค้า...');
    try {
      const res = await reportService.exportSalesByProduct({
        dateFrom,
        dateTo,
        shopId,
        categoryId,
        brandId,
      });
      downloadFile(res.data as unknown as Blob, `ยอดขายตามสินค้า_${dateFrom}_${dateTo}.xlsx`);
      notify.resolve(key, 'success', 'ส่งออก Excel ยอดขายตามสินค้า สำเร็จ');
    } catch (err) {
      notify.dismiss(key);
      showError(err, 'ส่งออก Excel ยอดขายตามสินค้า');
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="w-40">
          <ShopSearchSelect
            placeholder="ทุกร้าน"
            allowClear
            value={shopId}
            onChange={(v) => setShopId(v)}
          />
        </div>
        <div className="w-40">
          <CategorySearchSelect
            placeholder="ทุกหมวดหมู่"
            allowClear
            value={categoryId}
            onChange={(v) => setCategoryId(v)}
          />
        </div>
        <div className="w-40">
          <BrandSearchSelect
            placeholder="ทุกแบรนด์"
            allowClear
            value={brandId}
            onChange={(v) => setBrandId(v)}
          />
        </div>
        <ExportButton onClick={handleExport} loading={exporting} />
      </div>

      <div
        ref={scrollRef}
        className={cn(TABLE_WRAP, 'overflow-y-auto')}
        style={{ maxHeight: TABLE_MAX_HEIGHT }}
      >
        <table className={cn(TABLE, 'table-fixed')}>
          <thead className="sticky top-0 z-1">
            <tr>
              <SortTh<SalesByProductItem> label="สินค้า" field="name" sorter={sorter} />
              <SortTh<SalesByProductItem>
                label="Pack"
                field="quantityPack"
                sorter={sorter}
                className="w-23 text-right"
              />
              <SortTh<SalesByProductItem>
                label="Carton"
                field="quantityCarton"
                sorter={sorter}
                className="w-23 text-right"
              />
              <SortTh<SalesByProductItem>
                label="รายได้"
                field="revenue"
                sorter={sorter}
                className="w-35 text-right"
              />
              <SortTh<SalesByProductItem>
                label="ต้นทุน"
                field="cost"
                sorter={sorter}
                className="w-35 text-right"
              />
              <SortTh<SalesByProductItem>
                label="กำไร"
                field="profit"
                sorter={sorter}
                className="w-35 text-right"
              />
            </tr>
          </thead>
          <tbody>
            {isFetching ?
              <LoadingRow colSpan={6} />
            : sorter.sorted.length === 0 ?
              <EmptyRow colSpan={6} />
            : <>
                {paddingTop > 0 && (
                  <tr aria-hidden>
                    <td colSpan={6} style={{ height: paddingTop }} />
                  </tr>
                )}
                {virtualRows.map((v) => {
                  const r = sorter.sorted[v.index];
                  return (
                    <tr key={r.barcode} className={TABLE_TR}>
                      <td className={TABLE_TD}>
                        <div className="truncate font-medium">{r.name}</div>
                        <code className={cn(CELL_CODE, 'text-[11px]')}>{r.barcode}</code>
                      </td>
                      <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                        {r.quantityPack.toLocaleString()}
                      </td>
                      <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                        {r.quantityCarton.toLocaleString()}
                      </td>
                      <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                        {formatMoney(r.revenue)}
                      </td>
                      <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                        {formatMoney(r.cost)}
                      </td>
                      <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                        <ProfitValue value={r.profit} />
                      </td>
                    </tr>
                  );
                })}
                {paddingBottom > 0 && (
                  <tr aria-hidden>
                    <td colSpan={6} style={{ height: paddingBottom }} />
                  </tr>
                )}
              </>
            }
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ── Tab 4: ชั่วโมงทำงาน ──────────────────────────────────────────────── */

function ManHourTab({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) {
  const [employeeId, setEmployeeId] = useState<string | undefined>();
  const { data = [], isFetching } = useManHour({ dateFrom, dateTo, employeeId });
  const [exporting, setExporting] = useState(false);
  const sorter = useSort<ManHourItem>(data, 'avgMinutesPerOrder');

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
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="w-50">
          <EmployeeSearchSelect
            placeholder="ทุกพนักงาน"
            allowClear
            value={employeeId}
            onChange={(v) => setEmployeeId(v)}
          />
        </div>
        <ExportButton onClick={handleExport} loading={exporting} />
      </div>

      <div className={cn(TABLE_WRAP, 'max-h-120 overflow-y-auto')}>
        <table className={TABLE}>
          <thead className="sticky top-0 z-1">
            <tr>
              <SortTh<ManHourItem> label="พนักงาน" field="name" sorter={sorter} />
              <SortTh<ManHourItem>
                label="Order"
                field="orderCount"
                sorter={sorter}
                className="w-25 text-right"
              />
              <SortTh<ManHourItem>
                label="เวลารวม (นาที)"
                field="totalMinutes"
                sorter={sorter}
                className="w-38 text-right"
              />
              <SortTh<ManHourItem>
                label="เฉลี่ย/Order (นาที)"
                field="avgMinutesPerOrder"
                sorter={sorter}
                className="w-43 text-right"
              />
            </tr>
          </thead>
          <tbody>
            {isFetching ?
              <LoadingRow colSpan={4} />
            : data.length === 0 ?
              <EmptyRow colSpan={4} />
            : sorter.sorted.map((r) => (
                <tr key={r.employeeId} className={TABLE_TR}>
                  <td className={TABLE_TD}>{r.name}</td>
                  <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                    {r.orderCount.toLocaleString()}
                  </td>
                  <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                    {r.totalMinutes.toLocaleString()}
                  </td>
                  <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                    {r.avgMinutesPerOrder}
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */

const TABS = [
  { key: 'summary', label: 'ยอดขายรวม' },
  { key: 'by-shop', label: 'ยอดขายตามร้าน' },
  { key: 'by-product', label: 'ยอดขายตามสินค้า' },
  { key: 'man-hour', label: 'ชั่วโมงทำงาน' },
];

/** ช่วงวันที่ที่ใช้บ่อย — คิดตอนกด ไม่ใช่ตอน import */
const RANGE_PRESETS: { label: string; get: () => [Dayjs, Dayjs] }[] = [
  { label: 'สัปดาห์นี้', get: () => [dayjs().startOf('week'), dayjs()] },
  { label: '7 วัน', get: () => [dayjs().subtract(6, 'day'), dayjs()] },
  { label: '30 วัน', get: () => [dayjs().subtract(29, 'day'), dayjs()] },
  { label: 'เดือนนี้', get: () => [dayjs().startOf('month'), dayjs()] },
  { label: '3 เดือน', get: () => [dayjs().subtract(89, 'day'), dayjs()] },
];

export function ReportPage() {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs(DEFAULT_DATE_FROM),
    dayjs(DEFAULT_DATE_TO),
  ]);
  const [activeTab, setActiveTab] = useState('summary');

  const dateFrom = dateRange[0].format('YYYY-MM-DD');
  const dateTo = dateRange[1].format('YYYY-MM-DD');

  return (
    <div className="flex flex-col gap-5">
      <div className={PAGE_HEADER}>
        <div className="min-w-0">
          <h1 className={PAGE_TITLE}>รายงาน</h1>
          <p className={cn(PAGE_SUBTITLE, 'font-mono tabular-nums')}>
            {dateFrom} — {dateTo}
          </p>
        </div>

        {/* Radix ไม่มีตัวเลือกวันที่ — ปุ่มลัด + <input type="date"> คู่ */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap gap-1.5">
            {RANGE_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                className={btn('ghost', 'xs')}
                onClick={() => setDateRange(p.get())}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <input
              type="date"
              aria-label="วันที่เริ่ม"
              value={dateFrom}
              max={dateTo}
              onChange={(e) => e.target.value && setDateRange([dayjs(e.target.value), dateRange[1]])}
              className={cn(INPUT, 'w-38')}
            />
            <span aria-hidden className={TEXT.subtle}>
              –
            </span>
            <input
              type="date"
              aria-label="วันที่สิ้นสุด"
              value={dateTo}
              min={dateFrom}
              onChange={(e) => e.target.value && setDateRange([dateRange[0], dayjs(e.target.value)])}
              className={cn(INPUT, 'w-38')}
            />
          </div>
        </div>
      </div>

      <section className={CARD_SM}>
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List className={cn(TABS_LIST, 'mb-4 flex-wrap')}>
            {TABS.map((t) => (
              <Tabs.Trigger key={t.key} value={t.key} className={TABS_TRIGGER}>
                {t.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content value="summary" className="outline-none">
            <SalesSummaryTab dateFrom={dateFrom} dateTo={dateTo} />
          </Tabs.Content>
          <Tabs.Content value="by-shop" className="outline-none">
            <SalesByShopTab dateFrom={dateFrom} dateTo={dateTo} />
          </Tabs.Content>
          <Tabs.Content value="by-product" className="outline-none">
            <SalesByProductTab dateFrom={dateFrom} dateTo={dateTo} />
          </Tabs.Content>
          <Tabs.Content value="man-hour" className="outline-none">
            <ManHourTab dateFrom={dateFrom} dateTo={dateTo} />
          </Tabs.Content>
        </Tabs.Root>
      </section>
    </div>
  );
}
