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
  dataPill,
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
import { ShopFormModal } from '../components/ShopFormModal';
import { PlatformBadge } from '../components/PlatformBadge';
import { useShopList, useCreateShop, useUpdateShop, useDeleteShop, useBulkDeleteShop } from '../react-query';
import { PlatformColor, PLATFORM_ORDER } from '../types';
import type { Shop, CreateShopDto, Platform } from '../types';

const ONLINE_PLATFORMS: Platform[] = ['Shopee', 'Lazada', 'TikTok', 'LineOA', 'LineMan'];

// annotate เป็น number ตรงๆ — PAGINATION เป็น `as const` ค่าเลยเป็น literal type
const SHOP_LIST_DEFAULTS: { page: number; pageSize: number } = {
  page: PAGINATION.DEFAULT_PAGE,
  pageSize: PAGINATION.DEFAULT_LIMIT,
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

type SortKey = 'platform' | 'name' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

export function ShopPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Shop | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [sort, setSort] = useState<{ key: SortKey; order: SortOrder }>({
    key: 'name',
    order: 'asc',
  });
  const [platformFilter, setPlatformFilter] = useState<Platform | ''>('');
  const [pendingDelete, setPendingDelete] = useState<Shop | null>(null);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);

  // แบ่งหน้าฝั่ง server — ไม่ดึงร้านค้าทั้งหมดมาไว้ในหน่วยความจำ
  const [tableState, setTableState] = useSearchState('shop-list', SHOP_LIST_DEFAULTS);
  const { page, pageSize } = tableState;

  const { data, isLoading, refetch, isFetching } = useShopList({ page, limit: pageSize });
  const shops = useMemo(() => data?.data ?? [], [data]);
  const total = data?.pagination?.total ?? shops.length;
  const createShop = useCreateShop();
  const updateShop = useUpdateShop();
  const deleteShop = useDeleteShop();
  const bulkDelete = useBulkDeleteShop();

  async function handleSubmit(values: CreateShopDto) {
    if (selected) {
      await updateShop.mutateAsync({ id: selected.id, data: values });
    } else {
      await createShop.mutateAsync(values);
    }
    setModalOpen(false);
  }

  async function handleBulkDelete() {
    await bulkDelete.mutateAsync(selectedKeys);
    setSelectedKeys([]);
    setBulkConfirmOpen(false);
  }

  const platformCounts = useMemo(() => {
    const m = new Map<Platform, number>();
    PLATFORM_ORDER.forEach((p) => m.set(p, 0));
    shops.forEach((s) => m.set(s.platform, (m.get(s.platform) ?? 0) + 1));
    return m;
  }, [shops]);

  const onlineCount = useMemo(
    () => shops.filter((s) => ONLINE_PLATFORMS.includes(s.platform)).length,
    [shops],
  );
  const offlineCount = useMemo(
    () => shops.filter((s) => s.platform === 'Offline').length,
    [shops],
  );

  // กรอง + เรียงเฉพาะแถวของหน้านี้ — ข้อมูลถูกแบ่งหน้าจาก server แล้ว
  const rows = useMemo(() => {
    const dir = sort.order === 'asc' ? 1 : -1;
    return shops
      .filter((s) => !platformFilter || s.platform === platformFilter)
      .sort((a, b) => String(a[sort.key] ?? '').localeCompare(String(b[sort.key] ?? '')) * dir);
  }, [shops, sort, platformFilter]);

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
          <h1 className={PAGE_TITLE}>จัดการร้านค้า</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-foreground-lighter">
            <span>ทั้งหมด {shops.length} ร้าน</span>
            {PLATFORM_ORDER.map((p) => (
              <span key={p} className="flex items-center gap-1">
                <PlatformBadge platform={p} size={14} />
                <span className="text-xs tabular-nums">{platformCounts.get(p) ?? 0}</span>
              </span>
            ))}
          </div>
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
            เพิ่มร้านค้า
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>ร้านทั้งหมด</div>
          <div className={cn(STAT_VALUE, 'text-primary')}>
            <span>{shops.length}</span>
            <span className={STAT_SUFFIX}>ร้าน</span>
          </div>
        </div>
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>ออนไลน์</div>
          <div className={cn(STAT_VALUE, 'text-success-text')}>
            <span>{onlineCount}</span>
            <span className={STAT_SUFFIX}>ร้าน</span>
          </div>
        </div>
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>ออฟไลน์</div>
          <div className={cn(STAT_VALUE, 'text-foreground-lighter')}>
            <span>{offlineCount}</span>
            <span className={STAT_SUFFIX}>ร้าน</span>
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
                    {someSelected ?
                      <AppIcons.minus className="size-3" />
                    : <AppIcons.check className="size-3" />}
                  </Checkbox.Indicator>
                </Checkbox.Root>
              </th>
              <th className={cn(TABLE_TH, 'w-44')}>
                <div className="flex items-center gap-1.5">
                  <button type="button" className={TH_SORT} onClick={() => toggleSort('platform')}>
                    แพลตฟอร์ม
                    {sortIcon('platform')}
                  </button>
                  <select
                    value={platformFilter}
                    onChange={(e) => setPlatformFilter(e.target.value as Platform | '')}
                    aria-label="กรองตามแพลตฟอร์ม"
                    className="h-6 rounded-sm border border-border-control bg-control px-1 text-xs text-foreground-light"
                  >
                    <option value="">ทั้งหมด</option>
                    {PLATFORM_ORDER.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </th>
              <th className={TABLE_TH}>
                <button type="button" className={TH_SORT} onClick={() => toggleSort('name')}>
                  ชื่อร้าน
                  {sortIcon('name')}
                </button>
              </th>
              <th className={cn(TABLE_TH, 'w-48')}>รหัส</th>
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
                <td colSpan={7} className={TABLE_EMPTY}>
                  <AppIcons.loading spin className="mx-auto size-5 text-primary" />
                </td>
              </tr>
            : rows.length === 0 ?
              <tr>
                <td colSpan={7} className={TABLE_EMPTY}>
                  ยังไม่มีร้านค้า — กด “เพิ่มร้านค้า” เพื่อเริ่ม
                </td>
              </tr>
            : rows.map((r) => {
                const checked = selectedKeys.includes(r.id);
                return (
                  <tr key={r.id} data-selected={checked} className={TABLE_TR}>
                    <td className={TABLE_TD}>
                      <Checkbox.Root
                        checked={checked}
                        onCheckedChange={(c) =>
                          setSelectedKeys((keys) =>
                            c === true ? [...keys, r.id] : keys.filter((k) => k !== r.id),
                          )
                        }
                        aria-label={`เลือก ${r.name}`}
                        className={CHECKBOX}
                      >
                        <Checkbox.Indicator className="flex items-center justify-center">
                          <AppIcons.check className="size-3" />
                        </Checkbox.Indicator>
                      </Checkbox.Root>
                    </td>
                    <td className={TABLE_TD}>
                      <span className="flex items-center gap-2">
                        <PlatformBadge platform={r.platform} size={18} />
                        <span className={dataPill(PlatformColor[r.platform])}>{r.platform}</span>
                      </span>
                    </td>
                    <td className={cn(TABLE_TD, 'font-medium')}>{r.name}</td>
                    <td className={TABLE_TD}>
                      <code className={CELL_CODE}>{r.id}</code>
                    </td>
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
                );
              })
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
          <label htmlFor="shop-page-size" className="sr-only">
            จำนวนแถวต่อหน้า
          </label>
          <select
            id="shop-page-size"
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
            <AlertDialog.Title className={DIALOG_TITLE}>ลบร้านค้านี้?</AlertDialog.Title>
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
                disabled={deleteShop.isPending}
                onClick={() => {
                  if (pendingDelete) deleteShop.mutate(pendingDelete.id);
                  setPendingDelete(null);
                }}
              >
                {deleteShop.isPending && <AppIcons.loading spin />}
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

      <ShopFormModal
        open={modalOpen}
        shop={selected}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={createShop.isPending || updateShop.isPending}
      />
    </div>
  );
}
