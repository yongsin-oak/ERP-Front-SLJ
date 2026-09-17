import { useState } from 'react';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { downloadFile, showError, notify } from '@shared';
import { AppIcons } from '@/lib/icons';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  btn,
  btnIcon,
  dataPill,
  INPUT,
  PAGE_SIZE_SELECT,
  PAGER,
  SEARCH_CLEAR,
  SEARCH_ICON,
  SEARCH_INPUT,
  TABLE,
  TABLE_EMPTY,
  TABLE_TD,
  TABLE_TH,
  TABLE_TR,
  TABLE_WRAP,
  TEXT,
} from '@/lib/styles';
import { useStockEntries, inventoryExportService } from '../react-query';
import type { StockEntryParams } from '../react-query/services';
import { StockEntryTypes } from '../types';
import type { StockEntryType } from '../types';

const TYPE_KEYS = Object.keys(StockEntryTypes) as StockEntryType[];
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

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
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  /** เก็บครึ่งหนึ่งของช่วงวันที่ไว้ก่อน — ผู้ใช้เลือกทีละช่อง */
  function setRangePart(index: 0 | 1, value: string) {
    const next: [Dayjs | null, Dayjs | null] = [dateRange?.[0] ?? null, dateRange?.[1] ?? null];
    next[index] = value ? dayjs(value) : null;
    setDateRange(next[0] || next[1] ? next : null);
    setPage(1);
  }

  async function handleExport() {
    setExporting(true);
    const key = notify.loading('กำลังส่งออก Excel ประวัติสต็อก...');
    try {
      const res = await inventoryExportService.exportStockHistory({
        productBarcode: productSearch || undefined,
        type: (type || undefined) as StockEntryType | undefined,
        dateFrom,
        dateTo,
      });
      downloadFile(res.data as unknown as Blob, 'ประวัติการเคลื่อนไหวสต็อก.xlsx');
      notify.resolve(key, 'success', 'ส่งออก Excel ประวัติสต็อก สำเร็จ');
    } catch (err) {
      notify.dismiss(key);
      showError(err, 'ส่งออก Excel ประวัติสต็อก');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-50">
            <AppIcons.search className={SEARCH_ICON} />
            <input
              className={SEARCH_INPUT}
              placeholder="barcode สินค้า..."
              aria-label="ค้นหาด้วย barcode"
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setPage(1);
              }}
            />
            {productSearch && (
              <button
                type="button"
                aria-label="ล้างคำค้น"
                className={SEARCH_CLEAR}
                onClick={() => {
                  setProductSearch('');
                  setPage(1);
                }}
              >
                <AppIcons.close className="size-3.5" />
              </button>
            )}
          </div>

          <select
            aria-label="ประเภทการเคลื่อนไหว"
            value={type}
            onChange={(e) => {
              setType(e.target.value as StockEntryType | '');
              setPage(1);
            }}
            className={cn(INPUT, 'w-35')}
          >
            <option value="">ทุกประเภท</option>
            {TYPE_KEYS.map((k) => (
              <option key={k} value={k}>
                {StockEntryTypes[k].label}
              </option>
            ))}
          </select>

          {/* Radix ไม่มีตัวเลือกวันที่ — ใช้ <input type="date"> ของเบราว์เซอร์ */}
          <div className="flex items-center gap-1">
            <input
              type="date"
              aria-label="วันเริ่มต้น"
              value={dateRange?.[0]?.format('YYYY-MM-DD') ?? ''}
              max={dateRange?.[1]?.format('YYYY-MM-DD')}
              onChange={(e) => setRangePart(0, e.target.value)}
              className={cn(INPUT, 'w-38')}
            />
            <span aria-hidden className={TEXT.subtle}>
              –
            </span>
            <input
              type="date"
              aria-label="วันสิ้นสุด"
              value={dateRange?.[1]?.format('YYYY-MM-DD') ?? ''}
              min={dateRange?.[0]?.format('YYYY-MM-DD')}
              onChange={(e) => setRangePart(1, e.target.value)}
              className={cn(INPUT, 'w-38')}
            />
          </div>

          <button
            type="button"
            aria-label="รีเฟรชประวัติสต็อก"
            className={btnIcon('secondary')}
            onClick={() => refetch()}
          >
            <AppIcons.refresh />
          </button>
        </div>

        <button type="button" className={btn()} onClick={handleExport} disabled={exporting}>
          {exporting ? <AppIcons.loading spin /> : <AppIcons.exportFile />}
          Export Excel
        </button>
      </div>

      <div className={TABLE_WRAP}>
        <table className={TABLE}>
          <thead>
            <tr>
              <th className={cn(TABLE_TH, 'w-40')}>วันที่</th>
              <th className={TABLE_TH}>สินค้า</th>
              <th className={cn(TABLE_TH, 'w-30')}>ประเภท</th>
              <th className={cn(TABLE_TH, 'w-23 text-right')}>จำนวน</th>
              <th className={cn(TABLE_TH, 'w-20 text-right')}>ก่อน</th>
              <th className={cn(TABLE_TH, 'w-20 text-right')}>หลัง</th>
              <th className={cn(TABLE_TH, 'w-35')}>พนักงาน</th>
              <th className={TABLE_TH}>หมายเหตุ</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ?
              <tr>
                <td colSpan={8} className={TABLE_EMPTY}>
                  <AppIcons.loading spin className="mx-auto size-5 text-primary" />
                </td>
              </tr>
            : entries.length === 0 ?
              <tr>
                <td colSpan={8} className={TABLE_EMPTY}>
                  ไม่มีประวัติการเคลื่อนไหว
                </td>
              </tr>
            : entries.map((r) => (
                <tr key={r.id} className={TABLE_TR}>
                  <td className={cn(TABLE_TD, 'font-mono text-xs tabular-nums')}>
                    {formatDate(r.createdAt)}
                  </td>
                  <td className={TABLE_TD}>
                    <div className="font-medium">{r.product?.name ?? '-'}</div>
                    <code className="text-[11px] text-foreground-subtle">{r.productBarcode}</code>
                  </td>
                  <td className={TABLE_TD}>
                    <span className={dataPill(StockEntryTypes[r.type].color)}>
                      {StockEntryTypes[r.type].label}
                    </span>
                  </td>
                  <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                    {r.quantity?.toLocaleString()}
                  </td>
                  <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                    {r.previousRemaining != null ? r.previousRemaining.toLocaleString() : '-'}
                  </td>
                  <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                    {r.newRemaining != null ? <strong>{r.newRemaining.toLocaleString()}</strong> : '-'}
                  </td>
                  <td className={TABLE_TD}>
                    {r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : '-'}
                  </td>
                  <td className={cn(TABLE_TD, 'max-w-50 truncate')}>{r.note ?? '-'}</td>
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
          <label htmlFor="stock-tab-page-size" className="sr-only">
            จำนวนแถวต่อหน้า
          </label>
          <select
            id="stock-tab-page-size"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
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
            onClick={() => setPage(page - 1)}
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
            onClick={() => setPage(page + 1)}
          >
            <AppIcons.arrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
