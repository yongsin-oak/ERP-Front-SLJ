import { Fragment, useCallback, useMemo, useState } from 'react';
import { AlertDialog, Checkbox, DropdownMenu } from 'radix-ui';
import { useNavigate } from 'react-router-dom';
import dayjs, { type Dayjs } from 'dayjs';
import { useSearchState, downloadFile, showError, notify, getErrorMessage } from '@shared';
import { ShopSearchSelect } from '@features/shop/components/ShopSearchSelect';
import { EmployeeSearchSelect } from '@features/employee/components/EmployeeSearchSelect';
import { AppIcons } from '@/lib/icons';
import { cn } from '@/lib/utils';
import {
  alertBox,
  btn,
  btnIcon,
  BULK_BAR,
  CHECKBOX,
  dataPill,
  DIALOG_CONTENT,
  DIALOG_DESC,
  DIALOG_FOOTER,
  DIALOG_OVERLAY,
  DIALOG_TITLE,
  EMPTY_TEXT,
  EMPTY_WRAP,
  INPUT,
  MENU_CONTENT,
  MENU_ITEM,
  MENU_ITEM_DANGER,
  MENU_SEPARATOR,
  PAGE_HEADER,
  PAGE_SIZE_SELECT,
  PAGE_SUBTITLE,
  PAGE_TITLE,
  PAGER,
  SEARCH_CLEAR,
  SEARCH_ICON,
  SEARCH_INPUT,
  TABLE,
  TABLE_TD,
  TABLE_TH,
  TABLE_TR,
  TABLE_WRAP,
  TEXT,
} from '@/lib/styles';
import { useOrders, useDeleteOrder, useBulkDeleteOrder, orderService } from '../react-query';
import { OrderDetailModal } from '../components';
import { OrderStatuses } from '../types';
import type { Order, OrderStatus, OrderDetail } from '../types';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

/**
 * ค่าเริ่มต้นของหน้า — ช่วงวันที่คือ **วันนี้**
 *
 * เป็นฟังก์ชันไม่ใช่ค่าคงที่ระดับโมดูล เพราะ "วันนี้" ต้องคิดตอนเข้าหน้า ไม่ใช่ตอน import
 * (โมดูลถูก import ครั้งเดียวต่อการโหลดแอป ถ้าฝังค่าไว้ แท็บที่เปิดค้างข้ามคืนจะยังกรองวันเก่า)
 *
 * เหตุผลที่ default ไม่ใช่ "ทั้งหมด": ออเดอร์โตวันละหลายร้อย การเปิดหน้ามาแล้วโหลดทั้งปี
 * ช้าและไม่ตรงกับสิ่งที่คนเปิดหน้านี้อยากรู้ (งานของวันนี้) อยากดูย้อนหลังค่อยขยายช่วงเอง
 */
function makeDefaults() {
  const today = dayjs();
  return {
    search: '',
    status: '',
    shopId: '',
    employeeId: '',
    startDate: today.startOf('day').toISOString(),
    endDate: today.endOf('day').toISOString(),
    page: 1,
    pageSize: 20,
  };
}

const STATUS_KEYS = Object.keys(OrderStatuses) as OrderStatus[];

/** ช่วงวันที่ที่ใช้บ่อย — คิดตอนกด ไม่ใช่ตอน import (เหตุผลเดียวกับ makeDefaults) */
const RANGE_PRESETS: { label: string; get: () => [Dayjs, Dayjs] }[] = [
  { label: 'วันนี้', get: () => [dayjs().startOf('day'), dayjs().endOf('day')] },
  {
    label: 'เมื่อวาน',
    get: () => [
      dayjs().subtract(1, 'day').startOf('day'),
      dayjs().subtract(1, 'day').endOf('day'),
    ],
  },
  { label: 'สัปดาห์นี้', get: () => [dayjs().startOf('week'), dayjs().endOf('week')] },
  { label: 'เดือนนี้', get: () => [dayjs().startOf('month'), dayjs().endOf('month')] },
  {
    label: '3 เดือน',
    get: () => [dayjs().subtract(3, 'month').startOf('day'), dayjs().endOf('day')],
  },
  { label: 'ปีนี้', get: () => [dayjs().startOf('year'), dayjs().endOf('year')] },
];

export function OrderHistoryPage() {
  const navigate = useNavigate();

  // ต้องเป็น object เดิมตลอดอายุ component เพราะ useSearchState เก็บไว้ใช้ตอน reset
  const defaults = useMemo(() => makeDefaults(), []);
  const [tableState, setTableState] = useSearchState('order-history', defaults);
  const { search, status, shopId, employeeId, startDate, endDate, page, pageSize } = tableState;

  const dateRange = useMemo<[Dayjs, Dayjs] | null>(
    () => (startDate && endDate ? [dayjs(startDate), dayjs(endDate)] : null),
    [startDate, endDate],
  );

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);
  const [exporting, setExporting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [pendingDelete, setPendingDelete] = useState<Order | null>(null);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);

  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      status: status || undefined,
      shopId: shopId || undefined,
      employeeId: employeeId || undefined,
      search: search.trim() || undefined,
      dateFrom: dateRange?.[0].startOf('day').toISOString(),
      dateTo: dateRange?.[1].endOf('day').toISOString(),
    }),
    [page, pageSize, status, shopId, employeeId, search, dateRange],
  );

  const { data, isLoading, isError, error, refetch, isFetching } = useOrders(queryParams);
  const orders = useMemo(() => data?.data ?? [], [data]);
  const total = data?.pagination?.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  const deleteOrder = useDeleteOrder();
  const bulkDelete = useBulkDeleteOrder();

  /** patch ที่คงหน้าเดิมไว้ไม่ได้ — เปลี่ยนตัวกรองแล้วต้องเด้งกลับหน้า 1 เสมอ */
  const setFilter = useCallback(
    (patch: Partial<typeof defaults>) => setTableState({ ...tableState, ...patch, page: 1 }),
    [tableState, setTableState],
  );

  // นับเฉพาะตัวกรองที่ "ต่างจากค่าเริ่มต้น" — ช่วงวันที่ = วันนี้ ไม่ควรถูกนับว่าเป็นตัวกรองที่ผู้ใช้ตั้ง
  const activeCount = useMemo(() => {
    let n = 0;
    if (search) n++;
    if (status) n++;
    if (shopId) n++;
    if (employeeId) n++;
    if (startDate !== defaults.startDate || endDate !== defaults.endDate) n++;
    return n;
  }, [search, status, shopId, employeeId, startDate, endDate, defaults]);

  const resetFilters = useCallback(
    () => setTableState({ ...defaults, pageSize }),
    [setTableState, defaults, pageSize],
  );

  const handleBulkDelete = useCallback(async () => {
    await bulkDelete.mutateAsync(selectedKeys);
    setSelectedKeys([]);
    setBulkConfirmOpen(false);
  }, [bulkDelete, selectedKeys]);

  const openDetail = useCallback((order: Order) => {
    setSelected(order);
    setDetailOpen(true);
  }, []);

  async function handleExport() {
    setExporting(true);
    const key = notify.loading('กำลังส่งออก Excel ออเดอร์...');
    try {
      const res = await orderService.exportXlsx(queryParams);
      downloadFile(res.data as unknown as Blob, 'ออเดอร์.xlsx');
      notify.resolve(key, 'success', 'ส่งออก Excel ออเดอร์ สำเร็จ');
    } catch (err) {
      notify.dismiss(key);
      showError(err, 'ส่งออก Excel ออเดอร์');
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteOrder(id: string) {
    setDeletingId(id);
    try {
      await deleteOrder.mutateAsync(id);
    } finally {
      setDeletingId(null);
    }
  }

  const allSelected = orders.length > 0 && orders.every((r) => selectedKeys.includes(r.id));
  const someSelected = selectedKeys.length > 0 && !allSelected;

  function toggleAll(checked: boolean) {
    const pageIds = orders.map((r) => r.id);
    setSelectedKeys((keys) =>
      checked ? [...new Set([...keys, ...pageIds])] : keys.filter((k) => !pageIds.includes(k)),
    );
  }

  function toggleExpand(id: string) {
    setExpandedKeys((keys) => (keys.includes(id) ? keys.filter((k) => k !== id) : [...keys, id]));
  }

  /** เนื้อตาราง — แยกออกมาเพื่อให้สถานะโหลด/ผิดพลาด/ว่าง อ่านเป็นลำดับเดียวกัน */
  function renderBody() {
    if (isLoading) {
      return (
        <div className={EMPTY_WRAP}>
          <AppIcons.loading spin className="size-6 text-primary" />
        </div>
      );
    }

    if (isError) {
      return (
        <div className={EMPTY_WRAP}>
          <div className={alertBox('danger')}>
            <AppIcons.alert />
            <span>{getErrorMessage(error)}</span>
          </div>
          <button type="button" className={btn()} onClick={() => refetch()}>
            <AppIcons.refresh />
            ลองใหม่
          </button>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className={EMPTY_WRAP}>
          <AppIcons.orders className="size-8 text-foreground-subtle" />
          <p className={EMPTY_TEXT}>
            {activeCount > 0 ?
              'ไม่พบออเดอร์ที่ตรงกับตัวกรอง'
            : `ยังไม่มีออเดอร์${dateRange ? 'ในช่วงวันที่ที่เลือก' : ''}`}
          </p>
          {activeCount > 0 ?
            <button type="button" className={btn()} onClick={resetFilters}>
              <AppIcons.clear />
              ล้างตัวกรอง
            </button>
          : <button type="button" className={btn('primary')} onClick={() => navigate('/order')}>
              <AppIcons.add />
              บันทึกออเดอร์แรก
            </button>
          }
        </div>
      );
    }

    return (
      <>
        <div className={TABLE_WRAP}>
          <table className={cn(TABLE, 'min-w-240')}>
            <thead>
              <tr>
                <th className={cn(TABLE_TH, 'w-10')}>
                  <Checkbox.Root
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={(c) => toggleAll(c === true)}
                    aria-label="เลือกทุกแถวในหน้านี้"
                    className={CHECKBOX}
                  >
                    <Checkbox.Indicator className="flex items-center justify-center">
                      {someSelected ?
                        <AppIcons.minus className="size-3" />
                      : <AppIcons.check className="size-3" />}
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                </th>
                <th className={cn(TABLE_TH, 'w-10')}>
                  <span className="sr-only">ขยายแถว</span>
                </th>
                <th className={cn(TABLE_TH, 'w-41')}>เวลาบันทึก</th>
                <th className={cn(TABLE_TH, 'w-38')}>เลขคำสั่งซื้อ</th>
                <th className={cn(TABLE_TH, 'w-28')}>สถานะ</th>
                <th className={cn(TABLE_TH, 'w-48')}>ร้านค้า</th>
                <th className={cn(TABLE_TH, 'w-38')}>ผู้บันทึก</th>
                <th className={cn(TABLE_TH, 'w-23 text-right')}>รายการ</th>
                <th className={TABLE_TH}>หมายเหตุ</th>
                <th className={cn(TABLE_TH, 'w-14 text-center')}>
                  <span className="sr-only">ตัวเลือก</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((r) => {
                const checked = selectedKeys.includes(r.id);
                const itemCount = r.orderDetails?.length ?? 0;
                const isExpanded = expandedKeys.includes(r.id);
                return (
                  <Fragment key={r.id}>
                    <tr data-selected={checked} className={TABLE_TR}>
                      <td className={TABLE_TD}>
                        <Checkbox.Root
                          checked={checked}
                          onCheckedChange={(c) =>
                            setSelectedKeys((keys) =>
                              c === true ? [...keys, r.id] : keys.filter((k) => k !== r.id),
                            )
                          }
                          aria-label={`เลือกออเดอร์ ${r.orderNumber ?? r.id}`}
                          className={CHECKBOX}
                        >
                          <Checkbox.Indicator className="flex items-center justify-center">
                            <AppIcons.check className="size-3" />
                          </Checkbox.Indicator>
                        </Checkbox.Root>
                      </td>
                      <td className={TABLE_TD}>
                        {itemCount > 0 && (
                          <button
                            type="button"
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? 'ยุบรายการสินค้า' : 'ดูรายการสินค้า'}
                            onClick={() => toggleExpand(r.id)}
                            className="rounded-sm p-0.5 text-foreground-muted transition-colors hover:bg-surface-200 hover:text-foreground"
                          >
                            <AppIcons.chevronDown
                              className={cn(
                                'size-3.5 transition-transform',
                                !isExpanded && '-rotate-90',
                              )}
                            />
                          </button>
                        )}
                      </td>
                      <td className={TABLE_TD}>
                        <span className="font-mono text-xs tabular-nums text-foreground-light">
                          {formatRecordedAt(r)}
                        </span>
                      </td>
                      <td className={cn(TABLE_TD, 'max-w-38 truncate')}>
                        <span className="font-mono text-sm tabular-nums text-foreground">
                          {r.orderNumber || '—'}
                        </span>
                      </td>
                      <td className={TABLE_TD}>
                        {r.status ?
                          <span className={dataPill(OrderStatuses[r.status].color)}>
                            {OrderStatuses[r.status].label}
                          </span>
                        : '—'}
                      </td>
                      <td className={cn(TABLE_TD, 'max-w-48 truncate')}>
                        {r.shop ?
                          <>
                            <span className="text-foreground">{r.shop.name}</span>
                            <span className="ml-1.5 text-xs text-foreground-lighter">
                              {r.shop.platform}
                            </span>
                          </>
                        : '—'}
                      </td>
                      <td className={cn(TABLE_TD, 'max-w-38 truncate')}>
                        {r.recordBy ? `${r.recordBy.firstName} (${r.recordBy.nickname})` : '—'}
                      </td>
                      <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                        {itemCount}
                      </td>
                      <td className={cn(TABLE_TD, 'max-w-50 truncate')} title={r.note ?? undefined}>
                        {r.note || '—'}
                      </td>
                      <td className={cn(TABLE_TD, 'text-center')}>
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button
                              type="button"
                              aria-label="ตัวเลือกของแถวนี้"
                              className={btnIcon('ghost', 'sm')}
                              disabled={deletingId === r.id}
                            >
                              {deletingId === r.id ?
                                <AppIcons.loading spin />
                              : <AppIcons.more />}
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content
                              align="end"
                              sideOffset={4}
                              className={MENU_CONTENT}
                            >
                              <DropdownMenu.Item
                                className={MENU_ITEM}
                                onSelect={() => openDetail(r)}
                              >
                                <AppIcons.view />
                                ดูรายละเอียด
                              </DropdownMenu.Item>
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
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={10} className="border-b border-border-muted bg-surface-100 p-3">
                          <OrderItemsPanel items={r.orderDetails ?? []} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className={PAGER}>
          <span className={TEXT.subtle}>
            แสดง {orders.length ? (page - 1) * pageSize + 1 : 0}–
            {(page - 1) * pageSize + orders.length} จาก {total.toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            <label htmlFor="order-page-size" className="sr-only">
              จำนวนแถวต่อหน้า
            </label>
            <select
              id="order-page-size"
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
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={PAGE_HEADER}>
        <div className="min-w-0">
          <h1 className={PAGE_TITLE}>ประวัติออเดอร์</h1>
          <p className={PAGE_SUBTITLE}>{rangeLabel(dateRange, total)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-label="รีเฟรช"
            className={btnIcon('secondary')}
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? <AppIcons.loading spin /> : <AppIcons.refresh />}
          </button>
          <button type="button" className={btn()} onClick={handleExport} disabled={exporting}>
            {exporting ? <AppIcons.loading spin /> : <AppIcons.exportFile />}
            ส่งออก Excel
          </button>
          <button type="button" className={btn('primary')} onClick={() => navigate('/order')}>
            <AppIcons.add />
            บันทึกออเดอร์
          </button>
        </div>
      </div>

      {/* ── แถบตัวกรอง — แถวเดียว ไม่ต้องมีการ์ดครอบ ตามภาษาแบบ Supabase (ความลึกมาจากเส้น) ── */}
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {RANGE_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              className={btn('ghost', 'xs')}
              onClick={() => {
                const [from, to] = p.get();
                setFilter({ startDate: from.toISOString(), endDate: to.toISOString() });
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <input
              type="date"
              aria-label="วันที่เริ่ม"
              value={startDate ? startDate.slice(0, 10) : ''}
              max={endDate ? endDate.slice(0, 10) : undefined}
              onChange={(e) =>
                setFilter({
                  startDate: e.target.value ? dayjs(e.target.value).startOf('day').toISOString() : '',
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
                setFilter({
                  endDate: e.target.value ? dayjs(e.target.value).endOf('day').toISOString() : '',
                })
              }
              className={cn(INPUT, 'w-38')}
            />
          </div>

          <div className="relative w-full sm:w-56">
            <AppIcons.search className={SEARCH_ICON} />
            <input
              className={SEARCH_INPUT}
              placeholder="เลขออเดอร์ / หมายเหตุ"
              aria-label="ค้นหาออเดอร์"
              value={search}
              onChange={(e) => setFilter({ search: e.target.value })}
            />
            {search && (
              <button
                type="button"
                aria-label="ล้างคำค้น"
                className={SEARCH_CLEAR}
                onClick={() => setFilter({ search: '' })}
              >
                <AppIcons.close className="size-3.5" />
              </button>
            )}
          </div>

          <select
            aria-label="สถานะออเดอร์"
            value={status}
            onChange={(e) => setFilter({ status: e.target.value })}
            className={cn(INPUT, 'w-full sm:w-40')}
          >
            <option value="">ทุกสถานะ</option>
            {STATUS_KEYS.map((s) => (
              <option key={s} value={s}>
                {OrderStatuses[s].label}
              </option>
            ))}
          </select>

          <div className="w-full sm:w-48">
            <ShopSearchSelect
              allowClear
              placeholder="ทุกร้านค้า"
              value={shopId || undefined}
              onChange={(v) => setFilter({ shopId: v ?? '' })}
            />
          </div>

          <div className="w-full sm:w-48">
            <EmployeeSearchSelect
              allowClear
              placeholder="ทุกพนักงาน"
              value={employeeId || undefined}
              onChange={(v) => setFilter({ employeeId: v ?? '' })}
            />
          </div>

          {activeCount > 0 && (
            <button type="button" className={btn('ghost', 'sm')} onClick={resetFilters}>
              <AppIcons.clear />
              ล้างตัวกรอง ({activeCount})
            </button>
          )}
        </div>
      </div>

      {selectedKeys.length > 0 && (
        <div className={`${BULK_BAR} justify-between`}>
          <span className={TEXT.muted}>เลือก {selectedKeys.length} ออเดอร์</span>
          <div className="flex gap-2">
            <button
              type="button"
              className={btn('danger', 'sm')}
              onClick={() => setBulkConfirmOpen(true)}
              disabled={bulkDelete.isPending}
            >
              {bulkDelete.isPending ? <AppIcons.loading spin /> : <AppIcons.delete />}
              ลบที่เลือก
            </button>
            <button
              type="button"
              className={btn('ghost', 'sm')}
              onClick={() => setSelectedKeys([])}
              disabled={bulkDelete.isPending}
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {renderBody()}

      <OrderDetailModal open={detailOpen} order={selected} onClose={() => setDetailOpen(false)} />

      <AlertDialog.Root open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className={DIALOG_OVERLAY} />
          <AlertDialog.Content className={cn(DIALOG_CONTENT, 'max-w-sm')}>
            <AlertDialog.Title className={DIALOG_TITLE}>ลบออเดอร์นี้?</AlertDialog.Title>
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
                onClick={() => {
                  if (pendingDelete) void handleDeleteOrder(pendingDelete.id);
                  setPendingDelete(null);
                }}
              >
                ลบ
              </button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      <AlertDialog.Root open={bulkConfirmOpen} onOpenChange={setBulkConfirmOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className={DIALOG_OVERLAY} />
          <AlertDialog.Content className={cn(DIALOG_CONTENT, 'max-w-sm')}>
            <AlertDialog.Title className={DIALOG_TITLE}>
              ลบ {selectedKeys.length} ออเดอร์ที่เลือก?
            </AlertDialog.Title>
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
                disabled={bulkDelete.isPending}
                onClick={() => void handleBulkDelete()}
              >
                {bulkDelete.isPending && <AppIcons.loading spin />}
                ลบที่เลือก
              </button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}

/* ── helpers ────────────────────────────────────────── */

/**
 * เวลาที่เริ่มบันทึกออเดอร์ — ถ้าไม่มีใช้ createdAt แทน
 * ตัดปีทิ้งเมื่อเป็นปีปัจจุบัน: ค่าเริ่มต้นของหน้าคือ "วันนี้" การย้ำ "/2026" ทุกแถว
 * กินความกว้างโดยไม่ได้บอกอะไรใหม่ — ข้ามปีเมื่อไหร่ปีจะโผล่มาเองให้เห็นความต่าง
 */
function formatRecordedAt(order: Order): string {
  const at = order.startRecordAt ?? order.createdAt;
  if (!at) return '—';
  const d = dayjs(at);
  return d.isSame(dayjs(), 'year') ? d.format('DD/MM HH:mm') : d.format('DD/MM/YYYY HH:mm');
}

/** คำบรรยายใต้หัวข้อ — บอกทั้งช่วงเวลาที่กำลังดูและจำนวนที่เจอ */
function rangeLabel(range: [Dayjs, Dayjs] | null, total: number): string {
  const count = `${total.toLocaleString()} รายการ`;
  if (!range) return `ทุกช่วงเวลา · ${count}`;
  const [from, to] = range;
  if (from.isSame(to, 'day')) {
    const label = from.isSame(dayjs(), 'day') ? 'วันนี้' : from.format('DD/MM/YYYY');
    return `${label} · ${count}`;
  }
  return `${from.format('DD/MM/YYYY')} – ${to.format('DD/MM/YYYY')} · ${count}`;
}

/** แผงรายการสินค้าที่บันทึกไว้ในออเดอร์ — แสดงตอนกดขยายแถว (ไม่โชว์ราคา) */
function OrderItemsPanel({ items }: { items: OrderDetail[] }) {
  if (!items.length) {
    return <p className={cn(TEXT.muted, 'px-2 py-1')}>ไม่มีรายการสินค้า</p>;
  }
  return (
    <div className="overflow-hidden rounded-md border border-border bg-background">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-100 text-xs font-medium text-foreground-lighter">
            <th className="px-3 py-1.5 text-left">สินค้า</th>
            <th className="w-24 px-3 py-1.5 text-right">แพ็ค</th>
            <th className="w-24 px-3 py-1.5 text-right">ลัง</th>
          </tr>
        </thead>
        <tbody>
          {items.map((d) => (
            <tr key={d.id} className="border-b border-border-muted last:border-0">
              <td className="px-3 py-1.5">
                <div className="text-foreground">{d.product.name}</div>
                <div className="font-mono text-xs text-foreground-lighter">{d.product.barcode}</div>
              </td>
              <td className="px-3 py-1.5 text-right font-mono tabular-nums">
                {d.quantityPack.toLocaleString()}
              </td>
              <td className="px-3 py-1.5 text-right font-mono tabular-nums">
                {d.quantityCarton.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
