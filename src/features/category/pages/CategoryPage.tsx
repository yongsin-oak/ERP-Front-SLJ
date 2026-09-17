import { useEffect, useMemo, useRef, useState } from 'react';
import { Checkbox, Dialog, DropdownMenu } from 'radix-ui';
import { AppIcons } from '@/lib/icons';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  btn,
  btnIcon,
  CELL_CODE,
  CHECKBOX,
  dataPill,
  DIALOG_CONTENT,
  DIALOG_FOOTER,
  DIALOG_OVERLAY,
  DIALOG_TITLE,
  MENU_CONTENT,
  MENU_ITEM,
  MENU_ITEM_DANGER,
  MENU_SEPARATOR,
  PAGE_HEADER,
  PAGE_SUBTITLE,
  PAGE_TITLE,
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
import { CategoryFormModal } from '../components/CategoryFormModal';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../react-query';
import type { Category, CreateCategoryDto } from '../types';

type CatNode = Category & { children?: CatNode[] };
type SortKey = 'name' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

/** หนึ่งแถวที่จะถูก render จริง — ระดับความลึกใช้เยื้องชื่อให้เห็นโครงต้นไม้ */
interface FlatRow {
  node: CatNode;
  depth: number;
}

/** แปลงต้นไม้เป็นรายการแถวตามลำดับที่เห็นบนจอ — ข้ามลูกของหมวดที่ถูกยุบไว้ */
function flattenVisible(nodes: CatNode[], expanded: Set<string>, depth = 0): FlatRow[] {
  return nodes.flatMap((node) => {
    const row: FlatRow = { node, depth };
    const kids = node.children ?? [];
    if (kids.length === 0 || !expanded.has(node.id)) return [row];
    return [row, ...flattenVisible(kids, expanded, depth + 1)];
  });
}

export function CategoryPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Category | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Category | null>(null);
  const [deleteChildren, setDeleteChildren] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<CatNode | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; order: SortOrder }>({ key: 'name', order: 'asc' });

  // limit ต้องไม่เกิน PAGINATION.MAX_LIMIT (=200) ซึ่งตรงกับ MAX_PAGE_LIMIT ของ backend
  // ไม่ส่ง params เลย → useCategories ใช้ค่า default ที่เป็น MAX_LIMIT อยู่แล้ว
  const { data, isLoading, refetch, isFetching } = useCategories();
  const categories = useMemo(() => data?.data ?? [], [data]);
  const total = data?.pagination?.total ?? categories.length;

  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();

  const rootCount = useMemo(() => categories.filter((c) => !c.parentId).length, [categories]);
  const subCount = useMemo(() => categories.filter((c) => !!c.parentId).length, [categories]);

  const descendantsMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    const parentToChildren = new Map<string, string[]>();
    categories.forEach((c) => {
      if (c.parentId) {
        if (!parentToChildren.has(c.parentId)) parentToChildren.set(c.parentId, []);
        parentToChildren.get(c.parentId)!.push(c.id);
      }
    });
    function collect(id: string, out: Set<string>) {
      (parentToChildren.get(id) ?? []).forEach((c) => {
        if (!out.has(c)) {
          out.add(c);
          collect(c, out);
        }
      });
    }
    categories.forEach((c) => {
      const set = new Set<string>();
      collect(c.id, set);
      map.set(c.id, set);
    });
    return map;
  }, [categories]);

  const parentOptions = useMemo(() => {
    const excluded = new Set<string>();
    if (selected) {
      excluded.add(selected.id);
      (descendantsMap.get(selected.id) ?? new Set()).forEach((id) => excluded.add(id));
    }
    return categories
      .filter((c) => !excluded.has(c.id))
      .map((c) => ({ label: c.name, value: c.id }));
  }, [categories, selected, descendantsMap]);

  async function handleSubmit(values: CreateCategoryDto) {
    if (selected) {
      await updateCat.mutateAsync({ id: selected.id, data: values });
    } else {
      await createCat.mutateAsync(values);
    }
    setModalOpen(false);
  }

  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  function handleDeleteWithChildren(c: Category) {
    // ลบแบบ cascade: backend ลบหมวดย่อยทั้งสายลึก (descendant) — แสดงรายชื่อทั้งหมดให้ผู้ใช้เห็นก่อนยืนยัน
    setDeleteChildren(false);
    setConfirmTarget(c);
  }

  async function handleConfirmDelete() {
    if (!confirmTarget) return;
    await deleteCat.mutateAsync({ id: confirmTarget.id, deleteChild: deleteChildren });
    setConfirmTarget(null);
  }

  const confirmDescendantIds = useMemo(
    () => (confirmTarget ? Array.from(descendantsMap.get(confirmTarget.id) ?? []) : []),
    [confirmTarget, descendantsMap],
  );
  const confirmDescendantNames = confirmDescendantIds.map((id) => nameById.get(id) ?? id);

  const nestedCategories = useMemo<CatNode[]>(() => {
    const byId = new Map<string, CatNode>();
    categories.forEach((c) => byId.set(c.id, { ...c, children: undefined }));
    const roots: CatNode[] = [];
    byId.forEach((node) => {
      if (node.parentId && byId.has(node.parentId)) {
        const parent = byId.get(node.parentId)!;
        (parent.children = parent.children ?? []).push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }, [categories]);

  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const seenKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // หมวดที่เป็น "พ่อ" = id ที่ถูกอ้างเป็น parentId ของหมวดอื่น (childrenId จาก backend ไม่เคยถูก populate)
    const parentIds = new Set(categories.filter((c) => c.parentId).map((c) => c.parentId as string));
    const allParentIds = categories.filter((c) => parentIds.has(c.id)).map((c) => c.id);
    const seen = seenKeysRef.current;
    if (seen.size === 0) {
      setExpandedKeys(allParentIds);
    } else {
      const newOnes = allParentIds.filter((k) => !seen.has(k));
      if (newOnes.length > 0) {
        setExpandedKeys((prev) => Array.from(new Set([...prev, ...newOnes])));
      }
    }
    categories.forEach((c) => seen.add(c.id));
  }, [categories]);

  const expandedSet = useMemo(() => new Set(expandedKeys), [expandedKeys]);

  // เรียงพี่น้องในแต่ละชั้น ไม่ใช่เรียงทั้งตารางแบน — ไม่งั้นโครงต้นไม้จะพัง
  const sortedTree = useMemo(() => {
    const dir = sort.order === 'asc' ? 1 : -1;
    function sortNodes(nodes: CatNode[]): CatNode[] {
      return [...nodes]
        .sort((a, b) => String(a[sort.key] ?? '').localeCompare(String(b[sort.key] ?? '')) * dir)
        .map((n) => (n.children ? { ...n, children: sortNodes(n.children) } : n));
    }
    return sortNodes(nestedCategories);
  }, [nestedCategories, sort]);

  const rows = useMemo(
    () => flattenVisible(sortedTree, expandedSet),
    [sortedTree, expandedSet],
  );

  function toggleSort(key: SortKey) {
    setSort((s) => (s.key === key ? { key, order: s.order === 'asc' ? 'desc' : 'asc' } : { key, order: 'asc' }));
  }

  function toggleExpand(id: string) {
    setExpandedKeys((keys) => (keys.includes(id) ? keys.filter((k) => k !== id) : [...keys, id]));
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
          <h1 className={PAGE_TITLE}>จัดการหมวดหมู่</h1>
          <p className={PAGE_SUBTITLE}>ทั้งหมด {total} หมวดหมู่</p>
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
            เพิ่มหมวดหมู่
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>หมวดหมู่ทั้งหมด</div>
          <div className={cn(STAT_VALUE, 'text-primary')}>
            <span>{total}</span>
            <span className={STAT_SUFFIX}>หมวด</span>
          </div>
        </div>
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>หมวดหมู่หลัก</div>
          <div className={cn(STAT_VALUE, 'text-success-text')}>
            <span>{rootCount}</span>
            <span className={STAT_SUFFIX}>หมวด</span>
          </div>
        </div>
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>หมวดย่อย</div>
          <div className={cn(STAT_VALUE, 'text-foreground-lighter')}>
            <span>{subCount}</span>
            <span className={STAT_SUFFIX}>หมวด</span>
          </div>
        </div>
      </div>

      <div className={TABLE_WRAP}>
        <table className={TABLE}>
          <thead>
            <tr>
              <th className={TABLE_TH}>
                <button type="button" className={TH_SORT} onClick={() => toggleSort('name')}>
                  ชื่อหมวดหมู่
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
                <td colSpan={5} className={TABLE_EMPTY}>
                  <AppIcons.loading spin className="mx-auto size-5 text-primary" />
                </td>
              </tr>
            : rows.length === 0 ?
              <tr>
                <td colSpan={5} className={TABLE_EMPTY}>
                  ยังไม่มีหมวดหมู่ — กด “เพิ่มหมวดหมู่” เพื่อเริ่ม
                </td>
              </tr>
            : rows.map(({ node: r, depth }) => {
                const childCount = r.children?.length ?? 0;
                const hasChildren = childCount > 0;
                const isExpanded = expandedSet.has(r.id);
                return (
                  <tr key={r.id} className={TABLE_TR}>
                    <td className={TABLE_TD}>
                      <span
                        className="inline-flex items-center gap-1.5"
                        style={{ paddingInlineStart: depth * 20 }}
                      >
                        {hasChildren ?
                          <button
                            type="button"
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? `ยุบ ${r.name}` : `ขยาย ${r.name}`}
                            onClick={() => toggleExpand(r.id)}
                            className="rounded-sm p-0.5 text-foreground-muted transition-colors hover:bg-surface-200 hover:text-foreground"
                          >
                            <AppIcons.chevronDown
                              className={cn('size-3.5 transition-transform', !isExpanded && '-rotate-90')}
                            />
                          </button>
                        : <span aria-hidden className="inline-block size-4.5" />}
                        <span className="font-medium">{r.name}</span>
                        {hasChildren && (
                          <span className={cn(dataPill('blue'), 'text-[10px]')}>
                            {childCount} หมวดย่อย
                          </span>
                        )}
                      </span>
                    </td>
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
                                e.preventDefault();
                                // มีหมวดย่อย → ถามยืนยันแบบที่บอกรายชื่อลูกทั้งหมด
                                // ไม่มีลูก → ถามยืนยันแบบสั้น
                                if (hasChildren) handleDeleteWithChildren(r);
                                else setPendingDelete(r);
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

      <CategoryFormModal
        open={modalOpen}
        category={selected}
        parentOptions={parentOptions}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={createCat.isPending || updateCat.isPending}
      />

      {/* ลบหมวดที่ไม่มีลูก */}
      <Dialog.Root open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className={DIALOG_OVERLAY} />
          <Dialog.Content className={cn(DIALOG_CONTENT, 'max-w-sm')} aria-describedby={undefined}>
            <Dialog.Title className={DIALOG_TITLE}>
              ลบหมวดหมู่ “{pendingDelete?.name}”?
            </Dialog.Title>
            <p className={TEXT.muted}>ลบหมวดหมู่นี้ออกจากระบบ</p>
            <div className={DIALOG_FOOTER}>
              <Dialog.Close asChild>
                <button type="button" className={btn()}>
                  ยกเลิก
                </button>
              </Dialog.Close>
              <button
                type="button"
                className={btn('danger')}
                disabled={deleteCat.isPending}
                onClick={async () => {
                  if (pendingDelete) await deleteCat.mutateAsync({ id: pendingDelete.id });
                  setPendingDelete(null);
                }}
              >
                {deleteCat.isPending && <AppIcons.loading spin />}
                ลบ
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ลบหมวดที่มีลูก — ต้องเห็นรายชื่อลูกก่อนตัดสินใจ */}
      <Dialog.Root open={!!confirmTarget} onOpenChange={(o) => !o && setConfirmTarget(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className={DIALOG_OVERLAY} />
          <Dialog.Content className={DIALOG_CONTENT} aria-describedby={undefined}>
            <Dialog.Title className={DIALOG_TITLE}>
              ลบหมวดหมู่ “{confirmTarget?.name}”?
            </Dialog.Title>

            <div>
              <p className="mb-2 text-sm text-foreground-light">
                หมวดหมู่นี้มีหมวดหมู่ย่อยทั้งหมด {confirmDescendantNames.length} รายการ
                หากเลือกลบด้วย รายการต่อไปนี้จะถูกลบทั้งหมด:
              </p>
              <ul className="mb-2 max-h-40 list-disc overflow-auto ps-5">
                {confirmDescendantNames.map((name, i) => (
                  <li key={confirmDescendantIds[i]} className={TEXT.muted}>
                    {name}
                  </li>
                ))}
              </ul>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                <Checkbox.Root
                  checked={deleteChildren}
                  onCheckedChange={(c) => setDeleteChildren(c === true)}
                  className={CHECKBOX}
                >
                  <Checkbox.Indicator className="flex items-center justify-center">
                    <AppIcons.check className="size-3" />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                ลบหมวดหมู่ย่อยทั้งหมดด้วย (สินค้าในหมวดจะไม่ถูกลบ)
              </label>
            </div>

            <div className={DIALOG_FOOTER}>
              <Dialog.Close asChild>
                <button type="button" className={btn()}>
                  ยกเลิก
                </button>
              </Dialog.Close>
              <button
                type="button"
                className={btn('danger')}
                disabled={deleteCat.isPending}
                onClick={() => void handleConfirmDelete()}
              >
                {deleteCat.isPending && <AppIcons.loading spin />}
                ลบ
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
