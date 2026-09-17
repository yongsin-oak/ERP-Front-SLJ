import { useMemo, useState } from 'react';
import { AlertDialog, DropdownMenu } from 'radix-ui';
import { downloadFile, showError, useSearchState, notify } from '@shared';
import { AppIcons } from '@/lib/icons';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  btn,
  btnIcon,
  CELL_CODE,
  DIALOG_CONTENT,
  DIALOG_DESC,
  DIALOG_FOOTER,
  DIALOG_OVERLAY,
  DIALOG_TITLE,
  DOT,
  DOT_BASE,
  DOT_TONE,
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
  TH_SORT,
} from '@/lib/styles';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier, supplierService } from '../react-query';
import { SupplierFormModal } from '../components/SupplierFormModal';
import type { Supplier, CreateSupplierDto } from '../types';

const SUPPLIER_LIST_DEFAULTS = { search: '', page: 1, pageSize: 20 };
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

type SortKey = 'name' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

export function SupplierPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [tableState, setTableState] = useSearchState('supplier-list', SUPPLIER_LIST_DEFAULTS);
  const { search, page, pageSize } = tableState;
  const [searchInput, setSearchInput] = useState(search);
  const [exporting, setExporting] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; order: SortOrder }>({ key: 'name', order: 'asc' });
  const [pendingDelete, setPendingDelete] = useState<Supplier | null>(null);

  function commitSearch(val: string) {
    setTableState({ ...tableState, search: val, page: 1 });
  }

  const params = { page, limit: pageSize, search: search || undefined };
  const { data, isLoading, refetch, isFetching } = useSuppliers(params);
  const suppliers = useMemo(() => data?.data ?? [], [data]);
  const total = data?.pagination?.total ?? 0;

  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();

  const activeCount = useMemo(() => suppliers.filter((s) => s.isActive).length, [suppliers]);
  const inactiveCount = useMemo(() => suppliers.filter((s) => !s.isActive).length, [suppliers]);

  // เรียงเฉพาะแถวของหน้านี้ — ข้อมูลถูกแบ่งหน้าจาก server แล้ว
  const rows = useMemo(() => {
    const dir = sort.order === 'asc' ? 1 : -1;
    return [...suppliers].sort(
      (a, b) => String(a[sort.key] ?? '').localeCompare(String(b[sort.key] ?? '')) * dir,
    );
  }, [suppliers, sort]);

  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  function toggleSort(key: SortKey) {
    setSort((s) => (s.key === key ? { key, order: s.order === 'asc' ? 'desc' : 'asc' } : { key, order: 'asc' }));
  }

  function sortIcon(key: SortKey) {
    if (sort.key !== key) return <AppIcons.sort className="size-3 text-foreground-subtle" />;
    return sort.order === 'asc' ?
        <AppIcons.sortAsc className="size-3 text-foreground-light" />
      : <AppIcons.sortDesc className="size-3 text-foreground-light" />;
  }

  async function handleExport() {
    setExporting(true);
    const key = notify.loading('กำลังส่งออก Excel ซัพพลายเออร์...');
    try {
      const res = await supplierService.exportXlsx(search || undefined);
      downloadFile(res.data as unknown as Blob, 'ซัพพลายเออร์.xlsx');
      notify.resolve(key, 'success', 'ส่งออก Excel ซัพพลายเออร์ สำเร็จ');
    } catch (err) {
      notify.dismiss(key);
      showError(err, 'ส่งออก Excel ซัพพลายเออร์');
    } finally {
      setExporting(false);
    }
  }

  async function handleSubmit(values: CreateSupplierDto) {
    if (selected) {
      await updateSupplier.mutateAsync({ id: selected.id, data: values });
    } else {
      await createSupplier.mutateAsync(values);
    }
    setModalOpen(false);
  }

  return (
    <div>
      <div className={`${PAGE_HEADER} mb-4`}>
        <div className="min-w-0">
          <h1 className={PAGE_TITLE}>ซัพพลายเออร์</h1>
          <p className={PAGE_SUBTITLE}>ทั้งหมด {total} ราย</p>
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
          <button
            type="button"
            className={btn('primary')}
            onClick={() => {
              setSelected(null);
              setModalOpen(true);
            }}
          >
            <AppIcons.add />
            เพิ่มซัพพลายเออร์
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>ทั้งหมด</div>
          <div className={cn(STAT_VALUE, 'text-primary')}>
            <span>{total}</span>
            <span className={STAT_SUFFIX}>ราย</span>
          </div>
        </div>
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>ใช้งาน (หน้านี้)</div>
          <div className={cn(STAT_VALUE, 'text-success-text')}>
            <span>{activeCount}</span>
            <span className={STAT_SUFFIX}>ราย</span>
          </div>
        </div>
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>ปิดใช้งาน (หน้านี้)</div>
          <div className={cn(STAT_VALUE, 'text-foreground-lighter')}>
            <span>{inactiveCount}</span>
            <span className={STAT_SUFFIX}>ราย</span>
          </div>
        </div>
      </div>

      <div className="relative mb-4 w-full sm:w-70">
        <AppIcons.search className={SEARCH_ICON} />
        <input
          className={SEARCH_INPUT}
          placeholder="ค้นหาชื่อ..."
          aria-label="ค้นหาซัพพลายเออร์"
          value={searchInput}
          onChange={(e) => {
            const val = e.target.value;
            setSearchInput(val);
            // ล้างช่องแล้วต้องเห็นผลทันที ไม่ต้องรอกด Enter
            if (val === '') commitSearch('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitSearch(searchInput);
          }}
        />
        {searchInput && (
          <button
            type="button"
            aria-label="ล้างคำค้น"
            className={SEARCH_CLEAR}
            onClick={() => {
              setSearchInput('');
              commitSearch('');
            }}
          >
            <AppIcons.close className="size-3.5" />
          </button>
        )}
      </div>

      <div className={TABLE_WRAP}>
        <table className={TABLE}>
          <thead>
            <tr>
              <th className={TABLE_TH}>
                <button type="button" className={TH_SORT} onClick={() => toggleSort('name')}>
                  ชื่อบริษัท / ซัพพลายเออร์
                  {sortIcon('name')}
                </button>
              </th>
              <th className={cn(TABLE_TH, 'w-38')}>ผู้ติดต่อ</th>
              <th className={cn(TABLE_TH, 'w-33')}>เบอร์โทร</th>
              <th className={cn(TABLE_TH, 'w-50')}>อีเมล</th>
              <th className={cn(TABLE_TH, 'w-38')}>เลขผู้เสียภาษี</th>
              <th className={cn(TABLE_TH, 'w-25')}>สถานะ</th>
              <th className={cn(TABLE_TH, 'w-38')}>
                <button type="button" className={TH_SORT} onClick={() => toggleSort('updatedAt')}>
                  อัปเดตล่าสุด
                  {sortIcon('updatedAt')}
                </button>
              </th>
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
            : rows.length === 0 ?
              <tr>
                <td colSpan={8} className={TABLE_EMPTY}>
                  {search ?
                    `ไม่พบซัพพลายเออร์ที่ตรงกับ “${search}”`
                  : 'ยังไม่มีซัพพลายเออร์ — กด “เพิ่มซัพพลายเออร์” เพื่อเริ่ม'}
                </td>
              </tr>
            : rows.map((r) => (
                <tr key={r.id} className={TABLE_TR}>
                  <td className={cn(TABLE_TD, 'font-medium')}>{r.name}</td>
                  <td className={TABLE_TD}>{r.contactName || '-'}</td>
                  <td className={cn(TABLE_TD, 'font-mono text-xs tabular-nums')}>{r.phone || '-'}</td>
                  <td className={cn(TABLE_TD, 'max-w-50 truncate')}>{r.email || '-'}</td>
                  <td className={TABLE_TD}>
                    {r.taxId ? <code className={CELL_CODE}>{r.taxId}</code> : '-'}
                  </td>
                  <td className={TABLE_TD}>
                    <span className={DOT_BASE}>
                      <span className={cn(DOT, r.isActive ? DOT_TONE.success : DOT_TONE.default)} />
                      {r.isActive ? 'ใช้งาน' : 'ปิด'}
                    </span>
                  </td>
                  <td className={cn(TABLE_TD, 'font-mono text-xs tabular-nums')}>
                    {formatDate(r.updatedAt)}
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
                            onSelect={() => {
                              setSelected(r);
                              setModalOpen(true);
                            }}
                          >
                            แก้ไข
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator className={MENU_SEPARATOR} />
                          <DropdownMenu.Item
                            className={MENU_ITEM_DANGER}
                            onSelect={(e) => {
                              // กัน Radix ปิดเมนูแล้วเปิดกล่องยืนยันในจังหวะเดียวกัน
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
              ))
            }
          </tbody>
        </table>
      </div>

      <div className={PAGER}>
        <span className={TEXT.subtle}>
          แสดง {rows.length ? (page - 1) * pageSize + 1 : 0}–{(page - 1) * pageSize + rows.length} จาก{' '}
          {total}
        </span>
        <div className="flex items-center gap-2">
          <label htmlFor="supplier-page-size" className="sr-only">
            จำนวนแถวต่อหน้า
          </label>
          <select
            id="supplier-page-size"
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

      <AlertDialog.Root open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className={DIALOG_OVERLAY} />
          <AlertDialog.Content className={cn(DIALOG_CONTENT, 'max-w-sm')}>
            <AlertDialog.Title className={DIALOG_TITLE}>
              ลบ “{pendingDelete?.name}”?
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
                disabled={deleteSupplier.isPending}
                onClick={() => {
                  if (pendingDelete) deleteSupplier.mutate(pendingDelete.id);
                  setPendingDelete(null);
                }}
              >
                {deleteSupplier.isPending && <AppIcons.loading spin />}
                ลบ
              </button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      <SupplierFormModal
        open={modalOpen}
        supplier={selected}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={createSupplier.isPending || updateSupplier.isPending}
      />
    </div>
  );
}
