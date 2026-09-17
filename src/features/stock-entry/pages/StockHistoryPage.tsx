import { useState, useMemo } from 'react';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useSearchState, downloadFile, showError, notify } from '@shared';
import { EmployeeSearchSelect } from '@features/employee/components/EmployeeSearchSelect';
import { ProductDropdownSelect } from '@features/inventory';
import { AppIcons } from '@/lib/icons';
import { formatDate, formatMoney } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  btn,
  btnIcon,
  CARD_SM,
  CARD_TITLE,
  dataPill,
  INPUT,
  PAGE_HEADER,
  PAGE_SIZE_SELECT,
  PAGE_SUBTITLE,
  PAGE_TITLE,
  PAGER,
  STAT_CARD,
  STAT_LABEL,
  STAT_VALUE,
  TABLE,
  TABLE_EMPTY,
  TABLE_TD,
  TABLE_TH,
  TABLE_TR,
  TABLE_WRAP,
  TEXT,
} from '@/lib/styles';
import { useStockEntries, stockEntryService } from '../react-query';
import { StockEntryTypes } from '../types';
import type { StockEntry, StockEntryType } from '../types';

const DECREASE_TYPES: StockEntryType[] = ['damage'];
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const TYPE_KEYS = Object.keys(StockEntryTypes) as StockEntryType[];

function quantityDisplay(r: StockEntry) {
  if (r.type === 'adjust') return String(r.quantity);
  if (DECREASE_TYPES.includes(r.type)) return `-${r.quantity}`;
  return `+${r.quantity}`;
}

function quantityColorClass(type: StockEntryType) {
  if (type === 'damage') return 'text-error-text';
  if (type === 'adjust') return '';
  return 'text-success-text';
}

const STOCK_HISTORY_DEFAULTS = {
  search: '', type: '', employeeId: '', startDate: '', endDate: '', page: 1, pageSize: 20,
};

export function StockHistoryPage() {
  const [tableState, setTableState] = useSearchState('stock-history', STOCK_HISTORY_DEFAULTS);
  const { search, type, employeeId, startDate, endDate, page, pageSize } = tableState;
  // ต้อง memo — เป็น array ใหม่ทุก render ถ้าไม่ทำ แล้วมันเป็น dep ของ `params` ข้างล่าง
  // ผลคือ useMemo ของ params ไม่เคย hit เลย และ queryKey ก็เป็น object ใหม่ทุกรอบ
  const dateRange = useMemo<[Dayjs, Dayjs] | null>(
    () => (startDate && endDate ? [dayjs(startDate), dayjs(endDate)] : null),
    [startDate, endDate],
  );
  const [exporting, setExporting] = useState(false);

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
  const entries = useMemo(() => data?.data ?? [], [data]);
  const total = data?.pagination?.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

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

  return (
    <div>
      <div className={`${PAGE_HEADER} mb-4`}>
        <div className="min-w-0">
          <h1 className={PAGE_TITLE}>ประวัติการเคลื่อนไหวสต็อก</h1>
          <p className={PAGE_SUBTITLE}>ทั้งหมด {total.toLocaleString()} รายการ</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btn()} onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? <AppIcons.loading spin /> : <AppIcons.refresh />}
            รีเฟรช
          </button>
          <button type="button" className={btn()} onClick={handleExport} disabled={exporting}>
            {exporting ? <AppIcons.loading spin /> : <AppIcons.exportFile />}
            Export Excel
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>รายการทั้งหมด</div>
          <div className={cn(STAT_VALUE, 'text-primary')}>
            <span>{total.toLocaleString()}</span>
            <span className="font-sans text-sm font-normal text-foreground-light">รายการ</span>
          </div>
        </div>
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>มูลค่ารับเข้า (หน้านี้)</div>
          <div className={cn(STAT_VALUE, 'text-success-text')}>{formatMoney(receiveValue, 0)}</div>
        </div>
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>มูลค่าของเสีย (หน้านี้)</div>
          <div className={cn(STAT_VALUE, 'text-destructive')}>{formatMoney(damageValue, 0)}</div>
        </div>
      </div>

      <section className={cn(CARD_SM, 'mb-4')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className={cn(CARD_TITLE, 'flex items-center gap-2')}>
            <AppIcons.filter />
            ตัวกรอง
          </h2>
          {filtersActive && (
            <button type="button" className={btn('ghost', 'sm')} onClick={clearFilters}>
              <AppIcons.clear />
              ล้างตัวกรอง
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="w-55">
            <ProductDropdownSelect
              allowClear
              placeholder="สินค้า"
              value={search || undefined}
              onChange={(v) => setTableState({ ...tableState, search: v ?? '', page: 1 })}
            />
          </div>

          <select
            aria-label="ประเภทการเคลื่อนไหว"
            value={type}
            onChange={(e) => setTableState({ ...tableState, type: e.target.value, page: 1 })}
            className={cn(INPUT, 'w-38')}
          >
            <option value="">ทุกประเภท</option>
            {TYPE_KEYS.map((k) => (
              <option key={k} value={k}>
                {StockEntryTypes[k].label}
              </option>
            ))}
          </select>

          <div className="w-45">
            <EmployeeSearchSelect
              allowClear
              placeholder="พนักงาน"
              value={employeeId || undefined}
              onChange={(v) => setTableState({ ...tableState, employeeId: v ?? '', page: 1 })}
            />
          </div>

          {/* Radix ไม่มีตัวเลือกวันที่ — ใช้ <input type="date"> ของเบราว์เซอร์
              ซึ่งได้ปฏิทินพื้นเมืองบนมือถือฟรี และคนใช้คีย์บอร์ดพิมพ์วันที่ได้ตรงๆ */}
          <div className="flex items-center gap-1">
            <input
              type="date"
              aria-label="วันที่เริ่ม"
              value={startDate ? startDate.slice(0, 10) : ''}
              max={endDate ? endDate.slice(0, 10) : undefined}
              onChange={(e) =>
                setTableState({
                  ...tableState,
                  startDate: e.target.value ? dayjs(e.target.value).toISOString() : '',
                  page: 1,
                })
              }
              className={cn(INPUT, 'w-38')}
            />
            <span aria-hidden className={TEXT.subtle}>
              –
            </span>
            <input
              type="date"
              aria-label="วันที่สิ้นสุด"
              value={endDate ? endDate.slice(0, 10) : ''}
              min={startDate ? startDate.slice(0, 10) : undefined}
              onChange={(e) =>
                setTableState({
                  ...tableState,
                  endDate: e.target.value ? dayjs(e.target.value).toISOString() : '',
                  page: 1,
                })
              }
              className={cn(INPUT, 'w-38')}
            />
          </div>
        </div>
      </section>

      <div className={TABLE_WRAP}>
        <table className={cn(TABLE, 'min-w-275')}>
          <thead>
            <tr>
              <th className={cn(TABLE_TH, 'w-40')}>วันที่</th>
              <th className={TABLE_TH}>สินค้า</th>
              <th className={cn(TABLE_TH, 'w-30')}>ประเภท</th>
              <th className={cn(TABLE_TH, 'w-23 text-right')}>จำนวน</th>
              <th className={cn(TABLE_TH, 'w-25 text-right')}>สต็อกก่อน</th>
              <th className={cn(TABLE_TH, 'w-25 text-right')}>สต็อกหลัง</th>
              <th className={cn(TABLE_TH, 'w-30 text-right')}>ราคาทุน/หน่วย</th>
              <th className={cn(TABLE_TH, 'w-28 text-right')}>มูลค่า</th>
              <th className={cn(TABLE_TH, 'w-35')}>พนักงาน</th>
              <th className={TABLE_TH}>หมายเหตุ</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ?
              <tr>
                <td colSpan={10} className={TABLE_EMPTY}>
                  <AppIcons.loading spin className="mx-auto size-5 text-primary" />
                </td>
              </tr>
            : entries.length === 0 ?
              <tr>
                <td colSpan={10} className={TABLE_EMPTY}>
                  {filtersActive ?
                    'ไม่พบรายการที่ตรงกับตัวกรอง — ลองล้างตัวกรองดู'
                  : 'ยังไม่มีการเคลื่อนไหวสต็อก'}
                </td>
              </tr>
            : entries.map((r) => (
                <tr key={r.id} className={TABLE_TR}>
                  <td className={cn(TABLE_TD, 'font-mono text-xs tabular-nums')}>
                    {formatDate(r.createdAt)}
                  </td>
                  <td className={TABLE_TD}>
                    <div>{r.product?.name ?? r.productBarcode}</div>
                    <code className="text-[11px] text-foreground-subtle">{r.productBarcode}</code>
                  </td>
                  <td className={TABLE_TD}>
                    <span className={dataPill(StockEntryTypes[r.type].color)}>
                      {StockEntryTypes[r.type].label}
                    </span>
                  </td>
                  <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                    <span className={cn('font-medium', quantityColorClass(r.type))}>
                      {quantityDisplay(r)}
                    </span>
                  </td>
                  <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                    {r.previousRemaining ?? '-'}
                  </td>
                  <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                    {r.newRemaining != null ? <strong>{r.newRemaining}</strong> : '-'}
                  </td>
                  <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                    {r.costPricePerUnit != null ? formatMoney(Number(r.costPricePerUnit)) : '-'}
                  </td>
                  <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                    {r.costPricePerUnit != null ?
                      formatMoney(r.quantity * Number(r.costPricePerUnit))
                    : '-'}
                  </td>
                  <td className={TABLE_TD}>
                    {r.employee ? `${r.employee.firstName} (${r.employee.nickname})` : '-'}
                  </td>
                  <td className={cn(TABLE_TD, 'max-w-50 truncate')}>{r.note || '-'}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      <div className={PAGER}>
        <span className={TEXT.subtle}>
          แสดง {entries.length ? (page - 1) * pageSize + 1 : 0}–
          {(page - 1) * pageSize + entries.length} จาก {total.toLocaleString()}
        </span>
        <div className="flex items-center gap-2">
          <label htmlFor="stock-history-page-size" className="sr-only">
            จำนวนแถวต่อหน้า
          </label>
          <select
            id="stock-history-page-size"
            value={pageSize}
            onChange={(e) =>
              setTableState({ ...tableState, page: 1, pageSize: Number(e.target.value) })
            }
            className={PAGE_SIZE_SELECT}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} / หน้า
              </option>
            ))}
          </select>
          <button
            type="button"
            aria-label="หน้าก่อนหน้า"
            className={btnIcon('secondary', 'sm')}
            disabled={page <= 1}
            onClick={() => setTableState({ ...tableState, page: page - 1 })}
          >
            <AppIcons.arrowLeft />
          </button>
          <span className={cn(TEXT.subtle, 'tabular-nums')}>
            {page} / {lastPage}
          </span>
          <button
            type="button"
            aria-label="หน้าถัดไป"
            className={btnIcon('secondary', 'sm')}
            disabled={page >= lastPage}
            onClick={() => setTableState({ ...tableState, page: page + 1 })}
          >
            <AppIcons.arrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
