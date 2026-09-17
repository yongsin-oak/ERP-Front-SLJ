import { useMemo, useState } from 'react';
import { AlertDialog, Checkbox, DropdownMenu } from 'radix-ui';
import { useSearchState, PAGINATION } from '@shared';
import { AppIcons } from '@/lib/icons';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  btn,
  btnIcon,
  BULK_BAR,
  CELL_CODE,
  CHECKBOX,
  DIALOG_CONTENT,
  DIALOG_DESC,
  DIALOG_FOOTER,
  DIALOG_OVERLAY,
  DIALOG_TITLE,
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
  TH_SORT,
} from '@/lib/styles';
import { BrandFormModal } from '../components/BrandFormModal';
import {
  useBrands, useCreateBrand, useUpdateBrand, useDeleteBrand, useBulkDeleteBrand,
} from '../react-query';
import type { Brand, CreateBrandDto } from '../types';

// annotate เป็น number ตรงๆ — PAGINATION เป็น `as const` ค่าเลยเป็น literal type (1 / 20)
// ถ้าไม่ประกาศชนิด useSearchState จะล็อก state ไว้ที่ literal นั้นแล้วเปลี่ยนหน้าไม่ได้
const BRAND_LIST_DEFAULTS: { page: number; pageSize: number } = {
  page: PAGINATION.DEFAULT_PAGE,
  pageSize: PAGINATION.DEFAULT_LIMIT,
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

type SortKey = 'id' | 'name' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

export function BrandPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Brand | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [sort, setSort] = useState<{ key: SortKey; order: SortOrder }>({
    key: 'name',
    order: 'asc',
  });
  const [pendingDelete, setPendingDelete] = useState<Brand | null>(null);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);

  // แบ่งหน้าฝั่ง server — ไม่ดึงทั้งตารางมาไว้ในหน่วยความจำ
  const [tableState, setTableState] = useSearchState('brand-list', BRAND_LIST_DEFAULTS);
  const { page, pageSize } = tableState;

  const { data, isLoading, refetch, isFetching } = useBrands({ page, limit: pageSize });
  const brands = useMemo(() => data?.data ?? [], [data]);
  const total = data?.pagination?.total ?? brands.length;

  const withDescCount = useMemo(() => brands.filter((b) => !!b.description).length, [brands]);
  const withoutDescCount = useMemo(() => brands.filter((b) => !b.description).length, [brands]);

  // เรียงเฉพาะแถวของหน้านี้ — ข้อมูลถูกแบ่งหน้าจาก server แล้ว การเรียงจึงเป็นการ
  // จัดระเบียบสิ่งที่เห็นอยู่ ไม่ใช่เรียงทั้งชุด (ตรงกับพฤติกรรมเดิมของตาราง)
  const rows = useMemo(() => {
    const dir = sort.order === 'asc' ? 1 : -1;
    return [...brands].sort((a, b) => {
      const av = a[sort.key] ?? '';
      const bv = b[sort.key] ?? '';
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [brands, sort]);

  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const deleteBrand = useDeleteBrand();
  const bulkDelete = useBulkDeleteBrand();

  const allSelected = rows.length > 0 && rows.every((r) => selectedKeys.includes(r.id));
  const someSelected = selectedKeys.length > 0 && !allSelected;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  function toggleSort(key: SortKey) {
    setSort((s) => (s.key === key ? { key, order: s.order === 'asc' ? 'desc' : 'asc' } : { key, order: 'asc' }));
  }

  function toggleAll(checked: boolean) {
    const pageIds = rows.map((r) => r.id);
    setSelectedKeys((keys) =>
      checked ? [...new Set([...keys, ...pageIds])] : keys.filter((k) => !pageIds.includes(k)),
    );
  }

  function toggleRow(id: string, checked: boolean) {
    setSelectedKeys((keys) => (checked ? [...keys, id] : keys.filter((k) => k !== id)));
  }

  async function handleSubmit(values: CreateBrandDto) {
    if (selected) {
      await updateBrand.mutateAsync({ id: selected.id, data: values });
    } else {
      await createBrand.mutateAsync(values);
    }
    setModalOpen(false);
  }

  async function handleBulkDelete() {
    await bulkDelete.mutateAsync(selectedKeys);
    setSelectedKeys([]);
    setBulkConfirmOpen(false);
  }

  function sortIcon(key: SortKey) {
    if (sort.key !== key) return <AppIcons.sort className="size-3 text-foreground-subtle" />;
    return sort.order === 'asc' ?
        <AppIcons.sortAsc className="size-3 text-foreground-light" />
      : <AppIcons.sortDesc className="size-3 text-foreground-light" />;
  }

  return (
    <div>
      <div className={`${PAGE_HEADER} mb-4`}>
        <div className="min-w-0">
          <h1 className={PAGE_TITLE}>จัดการแบรนด์</h1>
          <p className={PAGE_SUBTITLE}>ทั้งหมด {total} แบรนด์</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btn()} onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? <AppIcons.loading spin /> : <AppIcons.refresh />}
            รีเฟรช
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
            เพิ่มแบรนด์
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>แบรนด์ทั้งหมด</div>
          <div className={cn(STAT_VALUE, 'text-primary')}>
            <span>{total}</span>
            <span className={STAT_SUFFIX}>แบรนด์</span>
          </div>
        </div>
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>มีรายละเอียด (หน้านี้)</div>
          <div className={cn(STAT_VALUE, 'text-success-text')}>
            <span>{withDescCount}</span>
            <span className={STAT_SUFFIX}>แบรนด์</span>
          </div>
        </div>
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>ไม่มีรายละเอียด (หน้านี้)</div>
          <div className={cn(STAT_VALUE, 'text-foreground-lighter')}>
            <span>{withoutDescCount}</span>
            <span className={STAT_SUFFIX}>แบรนด์</span>
          </div>
        </div>
      </div>

      {selectedKeys.length > 0 && (
        <div className={`${BULK_BAR} mb-3 justify-between`}>
          <span className={TEXT.muted}>เลือก {selectedKeys.length} รายการ</span>
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

      <div className={TABLE_WRAP}>
        <table className={TABLE}>
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
                    {someSelected ? <AppIcons.minus className="size-3" /> : <AppIcons.check className="size-3" />}
                  </Checkbox.Indicator>
                </Checkbox.Root>
              </th>
              <th className={cn(TABLE_TH, 'w-40')}>
                <button type="button" className={TH_SORT} onClick={() => toggleSort('id')}>
                  รหัส
                  {sortIcon('id')}
                </button>
              </th>
              <th className={TABLE_TH}>
                <button type="button" className={TH_SORT} onClick={() => toggleSort('name')}>
                  ชื่อแบรนด์
                  {sortIcon('name')}
                </button>
              </th>
              <th className={TABLE_TH}>รายละเอียด</th>
              <th className={cn(TABLE_TH, 'w-40')}>
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
                <td colSpan={6} className={TABLE_EMPTY}>
                  <AppIcons.loading spin className="mx-auto size-5 text-primary" />
                </td>
              </tr>
            : rows.length === 0 ?
              <tr>
                <td colSpan={6} className={TABLE_EMPTY}>ยังไม่มีแบรนด์ — กด “เพิ่มแบรนด์” เพื่อเริ่ม</td>
              </tr>
            : rows.map((r) => {
                const checked = selectedKeys.includes(r.id);
                return (
                  <tr key={r.id} data-selected={checked} className={TABLE_TR}>
                    <td className={TABLE_TD}>
                      <Checkbox.Root
                        checked={checked}
                        onCheckedChange={(c) => toggleRow(r.id, c === true)}
                        aria-label={`เลือก ${r.name}`}
                        className={CHECKBOX}
                      >
                        <Checkbox.Indicator className="flex items-center justify-center">
                          <AppIcons.check className="size-3" />
                        </Checkbox.Indicator>
                      </Checkbox.Root>
                    </td>
                    <td className={TABLE_TD}>
                      <code className={CELL_CODE}>{r.id}</code>
                    </td>
                    <td className={TABLE_TD}>{r.name}</td>
                    <td className={cn(TABLE_TD, 'max-w-xs truncate')}>{r.description || '-'}</td>
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
                                // กัน Radix ปิดเมนูแล้วเปิดกล่องยืนยันในจังหวะเดียวกัน (ชนกับ focus trap)
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
                );
              })
            }
          </tbody>
        </table>
      </div>

      {/* แบ่งหน้า */}
      <div className={PAGER}>
        <span className={TEXT.subtle}>
          แสดง {rows.length ? (page - 1) * pageSize + 1 : 0}–{(page - 1) * pageSize + rows.length} จาก {total}
        </span>
        <div className="flex items-center gap-2">
          <label htmlFor="brand-page-size" className="sr-only">
            จำนวนแถวต่อหน้า
          </label>
          <select
            id="brand-page-size"
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

      {/* ยืนยันลบทีละรายการ */}
      <AlertDialog.Root open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className={DIALOG_OVERLAY} />
          <AlertDialog.Content className={cn(DIALOG_CONTENT, 'max-w-sm')}>
            <AlertDialog.Title className={DIALOG_TITLE}>ลบแบรนด์นี้?</AlertDialog.Title>
            <AlertDialog.Description className={DIALOG_DESC}>
              สินค้าที่ผูกอยู่กับแบรนด์นี้จะไม่มีแบรนด์
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
                disabled={deleteBrand.isPending}
                onClick={() => {
                  if (pendingDelete) deleteBrand.mutate(pendingDelete.id);
                  setPendingDelete(null);
                }}
              >
                {deleteBrand.isPending && <AppIcons.loading spin />}
                ลบ
              </button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      {/* ยืนยันลบหลายรายการ */}
      <AlertDialog.Root open={bulkConfirmOpen} onOpenChange={setBulkConfirmOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className={DIALOG_OVERLAY} />
          <AlertDialog.Content className={cn(DIALOG_CONTENT, 'max-w-sm')}>
            <AlertDialog.Title className={DIALOG_TITLE}>
              ลบ {selectedKeys.length} รายการที่เลือก?
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

      <BrandFormModal
        open={modalOpen}
        brand={selected}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={createBrand.isPending || updateBrand.isPending}
      />
    </div>
  );
}
