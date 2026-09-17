import { useEffect, useState, useMemo } from 'react';
import { AlertDialog, Dialog, DropdownMenu } from 'radix-ui';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { useSearchState } from '@shared';
import { EmployeeSearchSelect } from '@features/employee/components/EmployeeSearchSelect';
import { AppIcons } from '@/lib/icons';
import { formatDate, DATE_FORMAT } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  btn,
  btnIcon,
  CARD_SM,
  CARD_TITLE,
  CELL_CODE,
  DIALOG_CLOSE_X,
  DIALOG_CONTENT,
  DIALOG_DESC,
  DIALOG_FOOTER,
  DIALOG_OVERLAY,
  DIALOG_TITLE,
  DOT,
  DOT_BASE,
  DOT_TONE,
  FIELD_ROW,
  INPUT,
  LABEL,
  MENU_CONTENT,
  MENU_ITEM,
  MENU_ITEM_DANGER,
  MENU_SEPARATOR,
  PAGE_HEADER,
  PAGE_SIZE_SELECT,
  PAGE_SUBTITLE,
  PAGE_TITLE,
  PAGER,
  STAT_CARD,
  STAT_LABEL,
  STAT_SUFFIX,
  STAT_VALUE,
  TABLE,
  TABLE_EMPTY,
  TABLE_TD,
  TABLE_TH,
  TABLE_TR,
  TABLE_WRAP,
  TEXT,
} from '@/lib/styles';
import { useStockCounts, useCreateStockCount, useDeleteStockCount } from '../react-query';
import { StockCountStatuses } from '../types';
import type { StockCount, StockCountStatus } from '../types';

const STOCK_COUNT_LIST_DEFAULTS = { status: '', page: 1, pageSize: 20 };
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const STATUS_KEYS = Object.keys(StockCountStatuses) as StockCountStatus[];

interface CreateForm {
  employeeId?: string;
  note?: string;
}

const EMPTY_CREATE: CreateForm = { employeeId: undefined, note: '' };

export function StockCountListPage() {
  const navigate = useNavigate();
  const [tableState, setTableState] = useSearchState('stock-count-list', STOCK_COUNT_LIST_DEFAULTS);
  const { page, pageSize } = tableState;
  const statusFilter = (tableState.status as StockCountStatus) || undefined;
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<StockCount | null>(null);

  const { control, register, handleSubmit, reset } = useForm<CreateForm>({
    defaultValues: EMPTY_CREATE,
  });

  const { data, isLoading, refetch, isFetching } = useStockCounts({
    page,
    limit: pageSize,
    status: statusFilter,
  });
  const sessions = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  const createCount = useCreateStockCount();
  const deleteCount = useDeleteStockCount();

  const filtersActive = !!statusFilter;

  // ล้างฟอร์มทุกครั้งที่เปิด — ไม่งั้นรอบนับถัดไปจะเห็นค่าของรอบก่อนค้างอยู่
  useEffect(() => {
    if (createOpen) reset(EMPTY_CREATE);
  }, [createOpen, reset]);

  function clearFilters() {
    setTableState({ ...tableState, status: '', page: 1 });
  }

  async function handleCreate(values: CreateForm) {
    await createCount.mutateAsync(values);
    setCreateOpen(false);
  }

  const draftCount = useMemo(() => sessions.filter((s) => s.status === 'Draft').length, [sessions]);
  const completedCount = useMemo(
    () => sessions.filter((s) => s.status === 'Completed').length,
    [sessions],
  );

  return (
    <div>
      <div className={`${PAGE_HEADER} mb-4`}>
        <div className="min-w-0">
          <h1 className={PAGE_TITLE}>นับสต็อก</h1>
          <p className={PAGE_SUBTITLE}>ทั้งหมด {total} รายการ</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btn()} onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? <AppIcons.loading spin /> : <AppIcons.refresh />}
            รีเฟรช
          </button>
          <button type="button" className={btn('primary')} onClick={() => setCreateOpen(true)}>
            <AppIcons.add />
            เริ่มนับสต็อก
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>รอบนับทั้งหมด</div>
          <div className={cn(STAT_VALUE, 'text-primary')}>
            <span>{total}</span>
            <span className={STAT_SUFFIX}>รอบ</span>
          </div>
        </div>
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>กำลังนับ (หน้านี้)</div>
          <div className={cn(STAT_VALUE, 'text-warning-text')}>
            <span>{draftCount}</span>
            <span className={STAT_SUFFIX}>รอบ</span>
          </div>
        </div>
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>สิ้นสุดแล้ว (หน้านี้)</div>
          <div className={cn(STAT_VALUE, 'text-success-text')}>
            <span>{completedCount}</span>
            <span className={STAT_SUFFIX}>รอบ</span>
          </div>
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
        <select
          aria-label="สถานะรอบนับ"
          value={tableState.status}
          onChange={(e) => setTableState({ ...tableState, status: e.target.value, page: 1 })}
          className={cn(INPUT, 'mt-3 w-45')}
        >
          <option value="">ทุกสถานะ</option>
          {STATUS_KEYS.map((s) => (
            <option key={s} value={s}>
              {StockCountStatuses[s].label}
            </option>
          ))}
        </select>
      </section>

      <div className={TABLE_WRAP}>
        <table className={cn(TABLE, 'min-w-225')}>
          <thead>
            <tr>
              <th className={cn(TABLE_TH, 'w-50')}>รหัส</th>
              <th className={cn(TABLE_TH, 'w-30')}>วันที่นับ</th>
              <th className={cn(TABLE_TH, 'w-33')}>สถานะ</th>
              <th className={cn(TABLE_TH, 'w-45')}>ความคืบหน้า</th>
              <th className={cn(TABLE_TH, 'w-38')}>ผู้รับผิดชอบ</th>
              <th className={TABLE_TH}>หมายเหตุ</th>
              <th className={cn(TABLE_TH, 'w-35')}>วันที่สร้าง</th>
              <th className={cn(TABLE_TH, 'w-14 text-center')}>
                <span className="sr-only">ตัวเลือก</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ?
              <tr>
                <td colSpan={8} className={TABLE_EMPTY}>
                  <AppIcons.loading spin className="mx-auto size-5 text-primary" />
                </td>
              </tr>
            : sessions.length === 0 ?
              <tr>
                <td colSpan={8} className={TABLE_EMPTY}>
                  {filtersActive ?
                    'ไม่พบรอบนับที่ตรงกับตัวกรอง'
                  : 'ยังไม่มีรอบนับสต็อก — กด “เริ่มนับสต็อก” เพื่อเริ่ม'}
                </td>
              </tr>
            : sessions.map((r) => {
                const tot = r.totalItems ?? 0;
                const counted = r.countedItems ?? 0;
                const pct = tot > 0 ? Math.round((counted / tot) * 100) : 0;
                return (
                  <tr key={r.id} className={TABLE_TR}>
                    <td className={TABLE_TD}>
                      <code className={CELL_CODE}>{r.id}</code>
                    </td>
                    <td className={cn(TABLE_TD, 'font-mono text-xs tabular-nums')}>
                      {formatDate(r.countDate, DATE_FORMAT.date)}
                    </td>
                    <td className={TABLE_TD}>
                      <span className={DOT_BASE}>
                        <span
                          className={cn(
                            DOT,
                            r.status === 'Completed' ? DOT_TONE.success : DOT_TONE.info,
                          )}
                        />
                        {StockCountStatuses[r.status].label}
                      </span>
                    </td>
                    <td className={TABLE_TD}>
                      <div
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`ความคืบหน้า ${counted} จาก ${tot} รายการ`}
                        className="h-2 w-full rounded-full bg-surface-300"
                      >
                        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[11px] text-foreground-muted">
                        {counted}/{tot} รายการ
                      </span>
                    </td>
                    <td className={TABLE_TD}>
                      {r.employee ? `${r.employee.firstName} (${r.employee.nickname})` : '-'}
                    </td>
                    <td className={cn(TABLE_TD, 'max-w-50 truncate')}>{r.note || '-'}</td>
                    <td className={cn(TABLE_TD, 'font-mono text-xs tabular-nums')}>
                      {formatDate(r.createdAt)}
                    </td>
                    <td className={cn(TABLE_TD, 'text-center')}>
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button
                            type="button"
                            aria-label="ตัวเลือกของแถวนี้"
                            className={btnIcon('ghost', 'sm')}
                          >
                            <AppIcons.more />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content align="end" sideOffset={4} className={MENU_CONTENT}>
                            <DropdownMenu.Item
                              className={MENU_ITEM}
                              onSelect={() => navigate(`/stock/count/${r.id}`)}
                            >
                              ดูรายละเอียด
                            </DropdownMenu.Item>
                            {/* ลบได้เฉพาะรายการที่ยังไม่สิ้นสุด — สถานะอื่นไม่ต้องมีเมนูลบเลย */}
                            {r.status === 'Draft' && (
                              <>
                                <DropdownMenu.Separator className={MENU_SEPARATOR} />
                                <DropdownMenu.Item
                                  className={MENU_ITEM_DANGER}
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    setPendingDelete(r);
                                  }}
                                >
                                  ลบ
                                </DropdownMenu.Item>
                              </>
                            )}
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
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
          แสดง {sessions.length ? (page - 1) * pageSize + 1 : 0}–
          {(page - 1) * pageSize + sessions.length} จาก {total.toLocaleString()}
        </span>
        <div className="flex items-center gap-2">
          <label htmlFor="stock-count-page-size" className="sr-only">
            จำนวนแถวต่อหน้า
          </label>
          <select
            id="stock-count-page-size"
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

      {/* เริ่มรอบนับใหม่ */}
      <Dialog.Root open={createOpen} onOpenChange={(o) => !o && setCreateOpen(false)}>
        <Dialog.Portal>
          <Dialog.Overlay className={DIALOG_OVERLAY} />
          <Dialog.Content className={DIALOG_CONTENT} aria-describedby={undefined}>
            <Dialog.Title className={DIALOG_TITLE}>เริ่มนับสต็อกใหม่</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" aria-label="ปิด" className={DIALOG_CLOSE_X}>
                <AppIcons.close />
              </button>
            </Dialog.Close>

            <form
              noValidate
              className="flex flex-col gap-4"
              onSubmit={handleSubmit(handleCreate)}
            >
              <div className={FIELD_ROW}>
                <label htmlFor="stock-count-employee" className={LABEL}>
                  ผู้รับผิดชอบ
                </label>
                <Controller
                  control={control}
                  name="employeeId"
                  render={({ field }) => (
                    <EmployeeSearchSelect
                      id="stock-count-employee"
                      allowClear
                      placeholder="เลือกพนักงาน (ถ้ามี)"
                      value={field.value ?? undefined}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className={FIELD_ROW}>
                <label htmlFor="stock-count-note" className={LABEL}>
                  หมายเหตุ
                </label>
                <input
                  id="stock-count-note"
                  className={INPUT}
                  placeholder="หมายเหตุ (ถ้ามี)"
                  {...register('note')}
                />
              </div>

              <div className={DIALOG_FOOTER}>
                <button type="button" className={btn()} onClick={() => setCreateOpen(false)}>
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className={btn('primary')}
                  disabled={createCount.isPending}
                >
                  {createCount.isPending && <AppIcons.loading spin />}
                  สร้างรายการนับ
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <AlertDialog.Root open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className={DIALOG_OVERLAY} />
          <AlertDialog.Content className={cn(DIALOG_CONTENT, 'max-w-sm')}>
            <AlertDialog.Title className={DIALOG_TITLE}>ลบรายการนับสต็อก?</AlertDialog.Title>
            <AlertDialog.Description className={DIALOG_DESC}>
              ไม่สามารถยกเลิกการดำเนินการนี้ได้
            </AlertDialog.Description>
            <div className={DIALOG_FOOTER}>
              <AlertDialog.Cancel asChild>
                <button type="button" className={btn()}>
                  ยกเลิก
                </button>
              </AlertDialog.Cancel>
              <button
                type="button"
                className={btn('danger')}
                disabled={deleteCount.isPending}
                onClick={() => {
                  if (pendingDelete) deleteCount.mutate(pendingDelete.id);
                  setPendingDelete(null);
                }}
              >
                {deleteCount.isPending && <AppIcons.loading spin />}
                ลบ
              </button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
