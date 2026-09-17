import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertDialog } from 'radix-ui';
import { useSearchState, showError, notify } from '@shared';
import { AppIcons } from '@/lib/icons';
import { formatDate, DATE_FORMAT } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  alertBox,
  btn,
  btnIcon,
  CARD_SM,
  CELL_CODE,
  DIALOG_CONTENT,
  DIALOG_DESC,
  DIALOG_FOOTER,
  DIALOG_OVERLAY,
  DIALOG_TITLE,
  INPUT_NUMBER,
  PAGE_HEADER,
  PAGE_TITLE,
  PAGER,
  SEARCH_CLEAR,
  SEARCH_ICON,
  SEARCH_INPUT,
  STAT_CARD,
  STAT_LABEL,
  STAT_SUFFIX,
  STAT_VALUE,
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
  useStockCount,
  useUpdateStockCountItems,
  useCompleteStockCount,
  useApplyStockCountAdjustments,
  stockCountService,
} from '../react-query';
import { StockCountStatuses } from '../types';
import type { StockCountItem, StockCountStatus } from '../types';

type CountFilter = 'all' | 'uncounted' | 'counted';

const PAGE_SIZE = 50;

const FILTER_OPTIONS: { label: string; value: CountFilter }[] = [
  { label: 'ทั้งหมด', value: 'all' },
  { label: 'ยังไม่นับ', value: 'uncounted' },
  { label: 'นับแล้ว', value: 'counted' },
];

export function StockCountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: res, isLoading } = useStockCount(id!);
  const session = res?.data;
  const items = useMemo(() => session?.items ?? [], [session]);

  const [countMap, setCountMap] = useState<Map<string, number>>(new Map());
  const [tableState, setTableState] = useSearchState('stock-count-detail', {
    search: '',
    filter: 'all',
    page: 1,
  });
  const { search, page } = tableState;
  const filter = tableState.filter as CountFilter;
  const [exporting, setExporting] = useState<'blank' | 'result' | null>(null);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);

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
        (i) => i.productBarcode.toLowerCase().includes(q) || i.product?.name.toLowerCase().includes(q),
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

  // แบ่งหน้าฝั่ง client — รายการทั้งรอบถูกโหลดมาครบแล้วตั้งแต่ต้น (นับจากใบเดียว)
  const lastPage = Math.max(1, Math.ceil(displayItems.length / PAGE_SIZE));
  const pageItems = displayItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
    setCompleteOpen(false);
  }

  async function handleExportBlank() {
    setExporting('blank');
    const key = notify.loading('กำลังส่งออก Excel ใบนับ...');
    try {
      await stockCountService.exportBlank(id!);
      notify.resolve(key, 'success', 'ส่งออก Excel ใบนับ สำเร็จ');
    } catch (err) {
      notify.dismiss(key);
      showError(err, 'ส่งออก Excel ใบนับ');
    } finally {
      setExporting(null);
    }
  }

  async function handleExportResult() {
    setExporting('result');
    const key = notify.loading('กำลังส่งออก Excel ผลลัพธ์...');
    try {
      await stockCountService.exportResult(id!);
      notify.resolve(key, 'success', 'ส่งออก Excel ผลลัพธ์ สำเร็จ');
    } catch (err) {
      notify.dismiss(key);
      showError(err, 'ส่งออก Excel ผลลัพธ์');
    } finally {
      setExporting(null);
    }
  }

  if (isLoading) {
    return (
      <div>
        <div className={`${PAGE_HEADER} mb-4`}>
          <h1 className={PAGE_TITLE}>นับสต็อก</h1>
        </div>
        <div className="p-8 text-center">
          <AppIcons.loading spin className="mx-auto size-5 text-primary" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div>
        <div className={`${PAGE_HEADER} mb-4`}>
          <h1 className={PAGE_TITLE}>ไม่พบรายการนับสต็อก</h1>
        </div>
        <div className={alertBox('danger')}>
          <AppIcons.alert />
          <span>ไม่พบรายการนับสต็อกนี้</span>
        </div>
      </div>
    );
  }

  const status = session.status as StockCountStatus;
  const remaining = totalItems - countedItems;

  return (
    <div>
      <div className={`${PAGE_HEADER} mb-4`}>
        <div className="min-w-0">
          <h1 className={PAGE_TITLE}>นับสต็อก — {session.id}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-foreground-lighter">
            <span className={statusPill(StockCountStatuses[status].color)}>
              {StockCountStatuses[status].label}
            </span>
            <span className="font-mono tabular-nums">
              {formatDate(session.countDate, DATE_FORMAT.date)}
            </span>
            {session.employee && (
              <span>
                {session.employee.firstName} ({session.employee.nickname})
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className={btn('ghost')} onClick={() => navigate('/stock/count')}>
            <AppIcons.arrowLeft />
            กลับ
          </button>
          <button
            type="button"
            className={btn()}
            onClick={handleExportBlank}
            disabled={exporting === 'blank'}
          >
            {exporting === 'blank' ? <AppIcons.loading spin /> : <AppIcons.exportFile />}
            Export ใบนับ
          </button>

          {status === 'Completed' && (
            <button
              type="button"
              className={btn()}
              onClick={handleExportResult}
              disabled={exporting === 'result'}
            >
              {exporting === 'result' ? <AppIcons.loading spin /> : <AppIcons.excel />}
              Export ผลลัพธ์
            </button>
          )}

          {status === 'Completed' && !session.adjustedAt && (
            <button
              type="button"
              className={btn('primary')}
              onClick={() => setAdjustOpen(true)}
              disabled={applyAdjustments.isPending}
            >
              {applyAdjustments.isPending ? <AppIcons.loading spin /> : <AppIcons.success />}
              ปรับสต็อกตามผลนับ
            </button>
          )}

          {status === 'Completed' && session.adjustedAt && (
            <span className={tag('success')}>ปรับสต็อกแล้ว</span>
          )}

          {isDraft && (
            <>
              <button
                type="button"
                className={btn()}
                onClick={() => void handleSave()}
                disabled={!hasChanges || updateItems.isPending}
              >
                {updateItems.isPending ? <AppIcons.loading spin /> : <AppIcons.save />}
                บันทึก ({countMap.size})
              </button>
              <button
                type="button"
                className={btn('primary')}
                onClick={() => setCompleteOpen(true)}
                disabled={remaining > 0 || completeCount.isPending}
                title={remaining > 0 ? `ยังเหลือ ${remaining} รายการที่ยังไม่นับ` : undefined}
              >
                {completeCount.isPending ? <AppIcons.loading spin /> : <AppIcons.success />}
                สิ้นสุดการนับ
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>สินค้าทั้งหมด</div>
          <div className={STAT_VALUE}>
            <span>{totalItems}</span>
            <span className={STAT_SUFFIX}>รายการ</span>
          </div>
        </div>
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>นับแล้ว</div>
          <div className={cn(STAT_VALUE, 'text-success-text')}>
            <span>{countedItems}</span>
            <span className={STAT_SUFFIX}>/ {totalItems}</span>
          </div>
        </div>
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>ยังไม่นับ</div>
          <div className={cn(STAT_VALUE, remaining > 0 && 'text-warning-text')}>
            <span>{remaining}</span>
            <span className={STAT_SUFFIX}>รายการ</span>
          </div>
        </div>
        <div className={CARD_SM}>
          <div className="mb-1 text-xs text-foreground-lighter">ความคืบหน้า</div>
          <div
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`นับแล้ว ${countedItems} จาก ${totalItems} รายการ`}
            className="h-2 w-full rounded-full bg-surface-300"
          >
            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-75">
          <AppIcons.search className={SEARCH_ICON} />
          <input
            className={SEARCH_INPUT}
            placeholder="ค้นหาชื่อสินค้า หรือ barcode..."
            aria-label="ค้นหาสินค้าในรอบนับ"
            value={search}
            onChange={(e) => setTableState({ ...tableState, search: e.target.value, page: 1 })}
          />
          {search && (
            <button
              type="button"
              aria-label="ล้างคำค้น"
              className={SEARCH_CLEAR}
              onClick={() => setTableState({ ...tableState, search: '', page: 1 })}
            >
              <AppIcons.close className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex gap-1">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              aria-pressed={filter === opt.value}
              className={btn(filter === opt.value ? 'primary' : 'ghost', 'sm')}
              onClick={() => setTableState({ ...tableState, filter: opt.value, page: 1 })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className={TABLE_WRAP}>
        <table className={cn(TABLE, 'min-w-200')}>
          <thead>
            <tr>
              <th className={cn(TABLE_TH, 'w-35')}>Barcode</th>
              <th className={TABLE_TH}>สินค้า</th>
              <th className={cn(TABLE_TH, 'w-30 text-right')}>สต็อกในระบบ</th>
              <th className={cn(TABLE_TH, 'w-40 text-right')}>จำนวนที่นับได้</th>
              <th className={cn(TABLE_TH, 'w-28 text-right')}>ส่วนต่าง</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ?
              <tr>
                <td colSpan={5} className={TABLE_EMPTY}>
                  {search || filter !== 'all' ?
                    'ไม่พบรายการที่ตรงกับตัวกรอง'
                  : 'รอบนับนี้ไม่มีรายการสินค้า'}
                </td>
              </tr>
            : pageItems.map((r) => {
                const effective = getEffectiveQty(r);
                const diff = effective == null ? null : effective - r.systemQty;
                return (
                  <tr
                    key={r.id}
                    className={cn(
                      TABLE_TR,
                      // เน้นแถวที่ค่าไม่ตรงกับระบบ — จุดที่ต้องตรวจซ้ำก่อนปิดรอบ
                      diff != null && diff < 0 && 'bg-error-bg/40',
                      diff != null && diff > 0 && 'bg-warning-bg/40',
                    )}
                  >
                    <td className={TABLE_TD}>
                      <code className={CELL_CODE}>{r.productBarcode}</code>
                    </td>
                    <td className={TABLE_TD}>
                      <div className="text-sm font-medium">{r.product?.name ?? '-'}</div>
                      {r.product?.category && (
                        <div className="text-[11px] text-foreground-subtle">
                          {r.product.category.name}
                          {r.product.brand ? ` · ${r.product.brand.name}` : ''}
                        </div>
                      )}
                    </td>
                    <td className={cn(TABLE_TD, 'text-right font-mono font-medium tabular-nums')}>
                      {r.systemQty.toLocaleString()}
                    </td>
                    <td className={cn(TABLE_TD, 'text-right')}>
                      {!isDraft ?
                        effective != null ?
                          <span className="font-mono font-medium tabular-nums">
                            {effective.toLocaleString()}
                          </span>
                        : '-'
                      : <input
                          type="number"
                          min={0}
                          aria-label={`จำนวนที่นับได้ของ ${r.product?.name ?? r.productBarcode}`}
                          placeholder="กรอกจำนวน"
                          value={effective ?? ''}
                          onChange={(e) => {
                            const raw = e.target.value;
                            setCountMap((prev) => {
                              const next = new Map(prev);
                              if (raw === '') next.delete(r.productBarcode);
                              else next.set(r.productBarcode, Number(raw));
                              return next;
                            });
                          }}
                          className={cn(INPUT_NUMBER, 'w-28')}
                        />
                      }
                    </td>
                    <td className={cn(TABLE_TD, 'text-right')}>
                      {diff == null ?
                        <span className="text-foreground-subtle">-</span>
                      : diff === 0 ?
                        <span className={statusPill('default')}>0</span>
                      : <span className={statusPill(diff > 0 ? 'success' : 'error')}>
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      }
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>

      <div className={PAGER}>
        <span className={TEXT.subtle}>
          แสดง {pageItems.length ? (page - 1) * PAGE_SIZE + 1 : 0}–
          {(page - 1) * PAGE_SIZE + pageItems.length} จาก {displayItems.length.toLocaleString()}
        </span>
        <div className="flex items-center gap-2">
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

      {/* สิ้นสุดการนับ */}
      <AlertDialog.Root open={completeOpen} onOpenChange={setCompleteOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className={DIALOG_OVERLAY} />
          <AlertDialog.Content className={cn(DIALOG_CONTENT, 'max-w-sm')}>
            <AlertDialog.Title className={DIALOG_TITLE}>สิ้นสุดการนับสต็อก?</AlertDialog.Title>
            <AlertDialog.Description className={DIALOG_DESC}>
              นับแล้ว {countedItems}/{totalItems} รายการ — ไม่สามารถแก้ไขได้หลังสิ้นสุด
            </AlertDialog.Description>
            <div className={DIALOG_FOOTER}>
              <AlertDialog.Cancel asChild>
                <button type="button" className={btn()}>
                  ยกเลิก
                </button>
              </AlertDialog.Cancel>
              <button
                type="button"
                className={btn('primary')}
                disabled={completeCount.isPending}
                onClick={() => void handleComplete()}
              >
                {completeCount.isPending && <AppIcons.loading spin />}
                สิ้นสุด
              </button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      {/* ปรับสต็อกตามผลนับ */}
      <AlertDialog.Root open={adjustOpen} onOpenChange={setAdjustOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className={DIALOG_OVERLAY} />
          <AlertDialog.Content className={cn(DIALOG_CONTENT, 'max-w-md')}>
            <AlertDialog.Title className={DIALOG_TITLE}>ปรับสต็อกตามผลนับ?</AlertDialog.Title>
            <AlertDialog.Description className={DIALOG_DESC}>
              จะสร้าง stock adjustment สำหรับทุกรายการที่มีส่วนต่าง และประวัติจะปรากฏใน /stock/history
            </AlertDialog.Description>
            <div className={DIALOG_FOOTER}>
              <AlertDialog.Cancel asChild>
                <button type="button" className={btn()}>
                  ยกเลิก
                </button>
              </AlertDialog.Cancel>
              <button
                type="button"
                className={btn('primary')}
                disabled={applyAdjustments.isPending}
                onClick={() => {
                  applyAdjustments.mutate(id!);
                  setAdjustOpen(false);
                }}
              >
                {applyAdjustments.isPending && <AppIcons.loading spin />}
                ปรับสต็อก
              </button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
