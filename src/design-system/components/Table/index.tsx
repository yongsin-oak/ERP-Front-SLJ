import * as React from 'react';
import {
  IconChevronLeft,
  IconChevronRight,
  IconFilter,
  IconSearch,
  IconSelector,
  IconSortAscending,
  IconSortDescending,
} from '@tabler/icons-react';
import { Checkbox as UICheckbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '../Spinner';
import { Empty } from '../Empty';
import { Select } from '../Select';
import { cn } from '@/lib/utils';

export type SortOrder = 'ascend' | 'descend';

export interface ColumnType<T> {
  title?: React.ReactNode;
  dataIndex?: string | string[];
  key?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right' | boolean;
  sorter?: boolean | ((a: T, b: T) => number);
  defaultSortOrder?: SortOrder;
  ellipsis?: boolean;
  searchable?: boolean;
  searchKey?: string;
  filters?: { text: React.ReactNode; value: string }[];
  onFilter?: (value: string, record: T) => boolean;
  className?: string;
  colSpan?: number;
}

export interface TableRowSelection<T> {
  selectedRowKeys?: React.Key[];
  onChange?: (keys: React.Key[], rows: T[]) => void;
  preserveSelectedRowKeys?: boolean;
  getCheckboxProps?: (record: T) => { disabled?: boolean };
  type?: 'checkbox' | 'radio';
}

export interface TablePaginationConfig {
  current?: number;
  pageSize?: number;
  total?: number;
  defaultPageSize?: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: string[];
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  onChange?: (page: number, pageSize: number) => void;
}

export interface TableExpandable<T> {
  expandedRowKeys?: React.Key[];
  defaultExpandedRowKeys?: React.Key[];
  onExpandedRowsChange?: (keys: React.Key[]) => void;
  rowExpandable?: (record: T) => boolean;
  childrenColumnName?: string;
  indentSize?: number;
}

export interface TableProps<T extends object = object> {
  columns?: ColumnType<T>[];
  dataSource?: T[];
  rowKey?: string | ((record: T) => React.Key);
  loading?: boolean;
  size?: 'small' | 'middle' | 'large';
  bordered?: boolean;
  pagination?: false | TablePaginationConfig;
  rowSelection?: TableRowSelection<T>;
  scroll?: { x?: number | string; y?: number | string };
  virtual?: boolean;
  expandable?: TableExpandable<T>;
  rowClassName?: (record: T, index: number) => string;
  locale?: { emptyText?: React.ReactNode };
  summary?: (data: readonly T[]) => React.ReactNode;
  onRow?: (record: T, index: number) => React.HTMLAttributes<HTMLTableRowElement>;
  className?: string;
  style?: React.CSSProperties;
}

const CELL_PAD = { small: 'px-2 py-1.5', middle: 'px-3 py-2.5', large: 'px-4 py-3.5' } as const;

function getValue(record: unknown, path?: string | string[]): unknown {
  if (path == null) return undefined;
  const parts = Array.isArray(path) ? path : [path];
  let cur: unknown = record;
  for (const p of parts) {
    if (cur == null) return cur;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function colKeyOf<T>(col: ColumnType<T>, index: number): string {
  if (col.key != null) return col.key;
  if (col.dataIndex != null) return Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : col.dataIndex;
  return String(index);
}

function alignClass(align?: 'left' | 'center' | 'right') {
  return align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
}

// ── Summary subcomponents ─────────────────────────────────────────────────────

function SummaryRow({
  className,
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <tr style={style} className={cn('border-t border-border bg-muted/40 font-medium', className)}>
      {children}
    </tr>
  );
}

function SummaryCell({
  align,
  colSpan,
  className,
  style,
  children,
}: {
  index?: number;
  align?: 'left' | 'center' | 'right';
  colSpan?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  return (
    <td colSpan={colSpan} style={style} className={cn('px-3 py-2.5 text-sm', alignClass(align), className)}>
      {children}
    </td>
  );
}

const Summary = Object.assign(({ children }: { children: React.ReactNode; fixed?: boolean }) => <>{children}</>, {
  Row: SummaryRow,
  Cell: SummaryCell,
});

// ── Column search dropdown ────────────────────────────────────────────────────

function SearchFilter({
  active,
  value,
  onApply,
}: {
  active: boolean;
  value: string;
  onApply: (v: string) => void;
}) {
  const [draft, setDraft] = React.useState(value);
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => setDraft(value), [value]);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex size-5 items-center justify-center rounded transition-colors',
            active ? 'text-primary' : 'text-foreground-subtle hover:text-foreground',
          )}
        >
          <IconSearch className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-2">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onApply(draft.trim());
              setOpen(false);
            }
          }}
          placeholder="ค้นหา"
          className="mb-2 h-8 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20"
        />
        <div className="flex justify-end gap-1.5">
          <button
            type="button"
            onClick={() => {
              setDraft('');
              onApply('');
              setOpen(false);
            }}
            className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
          >
            ล้าง
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(draft.trim());
              setOpen(false);
            }}
            className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary-hover"
          >
            ค้นหา
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FilterDropdown({
  options,
  selected,
  onApply,
}: {
  options: { text: React.ReactNode; value: string }[];
  selected: string[];
  onApply: (vals: string[]) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<string[]>(selected);
  React.useEffect(() => setDraft(selected), [selected]);

  function toggle(v: string, on: boolean) {
    setDraft((d) => (on ? [...d, v] : d.filter((x) => x !== v)));
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex size-5 items-center justify-center rounded transition-colors',
            selected.length > 0 ? 'text-primary' : 'text-foreground-subtle hover:text-foreground',
          )}
        >
          <IconFilter className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-48 p-2">
        <div className="flex flex-col gap-1.5 pb-2">
          {options.map((o) => (
            <label key={o.value} className="flex cursor-pointer items-center gap-2 text-sm">
              <UICheckbox
                checked={draft.includes(o.value)}
                onCheckedChange={(c) => toggle(o.value, c === true)}
              />
              {o.text}
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-1.5 border-t border-divider pt-2">
          <button
            type="button"
            onClick={() => {
              setDraft([]);
              onApply([]);
              setOpen(false);
            }}
            className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
          >
            ล้าง
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(draft);
              setOpen(false);
            }}
            className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary-hover"
          >
            ตกลง
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── Table ─────────────────────────────────────────────────────────────────────

export function Table<T extends object = object>({
  columns = [],
  dataSource = [],
  rowKey,
  loading,
  size = 'middle',
  bordered,
  pagination,
  rowSelection,
  scroll,
  expandable,
  rowClassName,
  locale,
  summary,
  onRow,
  className,
  style,
}: TableProps<T>) {
  const pad = CELL_PAD[size];

  const getKey = React.useCallback(
    (record: T, index: number): React.Key => {
      if (typeof rowKey === 'function') return rowKey(record);
      if (rowKey) return String(getValue(record, rowKey) ?? index);
      return index;
    },
    [rowKey],
  );

  // ── client-side state ──
  const [sort, setSort] = React.useState<{ key: string; order: SortOrder } | null>(() => {
    const def = columns.findIndex((c) => c.defaultSortOrder);
    return def >= 0 ? { key: colKeyOf(columns[def], def), order: columns[def].defaultSortOrder! } : null;
  });
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const [colFilters, setColFilters] = React.useState<Record<string, string[]>>({});
  const [internalPage, setInternalPage] = React.useState(1);
  const [internalExpanded, setInternalExpanded] = React.useState<React.Key[]>(
    expandable?.defaultExpandedRowKeys ?? [],
  );
  const childrenKey = expandable?.childrenColumnName ?? 'children';
  const expandedKeys = expandable?.expandedRowKeys ?? internalExpanded;

  // ── processing pipeline ──
  const processed = React.useMemo(() => {
    let data = [...dataSource];
    // search filters
    for (const [key, q] of Object.entries(filters)) {
      if (!q) continue;
      const idx = columns.findIndex((c, i) => colKeyOf(c, i) === key);
      if (idx < 0) continue;
      const col = columns[idx];
      const path = col.searchKey ?? col.dataIndex;
      data = data.filter((record) =>
        col.onFilter
          ? col.onFilter(q, record)
          : String(getValue(record, path) ?? '').toLowerCase().includes(q.toLowerCase()),
      );
    }
    // column value-filters (checkbox dropdown)
    for (const [key, vals] of Object.entries(colFilters)) {
      if (!vals.length) continue;
      const idx = columns.findIndex((c, i) => colKeyOf(c, i) === key);
      if (idx < 0) continue;
      const col = columns[idx];
      data = data.filter((record) =>
        vals.some((val) =>
          col.onFilter ? col.onFilter(val, record) : String(getValue(record, col.dataIndex)) === val,
        ),
      );
    }
    // sort
    if (sort) {
      const idx = columns.findIndex((c, i) => colKeyOf(c, i) === sort.key);
      const col = idx >= 0 ? columns[idx] : null;
      if (col && typeof col.sorter === 'function') {
        const fn = col.sorter;
        data.sort(fn);
        if (sort.order === 'descend') data.reverse();
      }
    }
    return data;
  }, [dataSource, filters, colFilters, sort, columns]);

  // ── pagination ──
  const paged = pagination !== false ? (pagination ?? {}) : null;
  const serverSide = !!paged && paged.current != null && paged.total != null;
  const pageSize = paged?.pageSize ?? paged?.defaultPageSize ?? 20;
  const current = paged?.current ?? internalPage;
  const total = paged?.total ?? processed.length;

  const pageRows = React.useMemo(() => {
    if (!paged || serverSide) return processed;
    const start = (current - 1) * pageSize;
    return processed.slice(start, start + pageSize);
  }, [paged, serverSide, processed, current, pageSize]);

  function changePage(page: number, ps: number) {
    paged?.onChange?.(page, ps);
    if (!serverSide) setInternalPage(page);
  }

  // ── selection ──
  const selectedKeys = rowSelection?.selectedRowKeys ?? [];
  const selectedSet = React.useMemo(() => new Set(selectedKeys.map(String)), [selectedKeys]);

  const pageKeys = pageRows.map((r, i) => getKey(r, i));
  const allSelected = pageKeys.length > 0 && pageKeys.every((k) => selectedSet.has(String(k)));
  const someSelected = pageKeys.some((k) => selectedSet.has(String(k)));

  function toggleAll(checked: boolean) {
    if (!rowSelection) return;
    const pageKeyStrs = new Set(pageKeys.map(String));
    let keys: React.Key[];
    if (checked) keys = [...selectedKeys, ...pageKeys.filter((k) => !selectedSet.has(String(k)))];
    else keys = selectedKeys.filter((k) => !pageKeyStrs.has(String(k)));
    rowSelection.onChange?.(keys, rowsForKeys(keys));
  }

  function toggleRow(key: React.Key, checked: boolean) {
    if (!rowSelection) return;
    const keys = checked
      ? [...selectedKeys, key]
      : selectedKeys.filter((k) => String(k) !== String(key));
    rowSelection.onChange?.(keys, rowsForKeys(keys));
  }

  function rowsForKeys(keys: React.Key[]): T[] {
    const set = new Set(keys.map(String));
    return dataSource.filter((r, i) => set.has(String(getKey(r, i))));
  }

  function toggleExpand(key: React.Key) {
    const exists = expandedKeys.some((k) => String(k) === String(key));
    const next = exists
      ? expandedKeys.filter((k) => String(k) !== String(key))
      : [...expandedKeys, key];
    if (expandable?.expandedRowKeys == null) setInternalExpanded(next);
    expandable?.onExpandedRowsChange?.(next);
  }

  function onSortClick(col: ColumnType<T>, key: string) {
    if (!col.sorter) return;
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, order: 'ascend' };
      if (prev.order === 'ascend') return { key, order: 'descend' };
      return null;
    });
  }

  const hasSelection = !!rowSelection;
  const indent = expandable?.indentSize ?? 20;

  // ── render rows recursively (tree) ──
  function renderRows(rows: T[], depth: number): React.ReactNode[] {
    const out: React.ReactNode[] = [];
    rows.forEach((record, i) => {
      const key = getKey(record, i);
      const kids = (getValue(record, childrenKey) as T[] | undefined) ?? undefined;
      const expandable2 = expandable && (expandable.rowExpandable ? expandable.rowExpandable(record) : !!kids?.length);
      const isExpanded = expandedKeys.some((k) => String(k) === String(key));
      const rowProps = onRow?.(record, i);

      out.push(
        <tr
          key={String(key)}
          {...rowProps}
          className={cn(
            'border-b border-divider transition-colors hover:bg-accent/50',
            rowClassName?.(record, i),
            rowProps?.className,
          )}
        >
          {hasSelection && (
            <td className={cn(pad, 'w-10')}>
              <UICheckbox
                checked={selectedSet.has(String(key))}
                disabled={rowSelection?.getCheckboxProps?.(record)?.disabled}
                onCheckedChange={(c) => toggleRow(key, c === true)}
              />
            </td>
          )}
          {columns.map((col, ci) => {
            const k = colKeyOf(col, ci);
            const raw = getValue(record, col.dataIndex);
            const content = col.render ? col.render(raw, record, i) : (raw as React.ReactNode);
            const isFirst = ci === 0;
            return (
              <td
                key={k}
                className={cn(
                  pad,
                  'text-sm text-foreground',
                  alignClass(col.align),
                  col.ellipsis && 'max-w-0 truncate',
                  col.fixed === 'right' && 'sticky right-0 z-[1] bg-background',
                  col.fixed === 'left' && 'sticky left-0 z-[1] bg-background',
                  col.className,
                )}
                style={col.ellipsis ? { width: col.width } : undefined}
                title={col.ellipsis && typeof content === 'string' ? content : undefined}
              >
                <span className={cn(isFirst && depth > 0 && 'inline-flex items-center')}>
                  {isFirst && expandable && (
                    <span style={{ paddingLeft: depth * indent }} className="inline-flex">
                      {expandable2 ? (
                        <button
                          type="button"
                          onClick={() => toggleExpand(key)}
                          className="mr-1 flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-accent"
                        >
                          <IconChevronRight className={cn('size-4 transition-transform', isExpanded && 'rotate-90')} />
                        </button>
                      ) : (
                        <span className="mr-1 inline-block size-5" />
                      )}
                    </span>
                  )}
                  {content}
                </span>
              </td>
            );
          })}
        </tr>,
      );

      if (expandable && isExpanded && kids?.length) {
        out.push(...renderRows(kids, depth + 1));
      }
    });
    return out;
  }

  const colCount = columns.length + (hasSelection ? 1 : 0);
  const minWidth = scroll?.x;

  return (
    <div className={cn('w-full', className)} style={style}>
      <div
        className={cn('relative overflow-auto rounded-lg border border-border', bordered && 'border-border')}
        style={{ maxHeight: scroll?.y }}
      >
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
            <Spinner />
          </div>
        )}
        <table className="w-full border-collapse text-left" style={{ minWidth }}>
          <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur">
            <tr className="border-b border-border">
              {hasSelection && (
                <th className={cn(pad, 'w-10')}>
                  <UICheckbox
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={(c) => toggleAll(c === true)}
                  />
                </th>
              )}
              {columns.map((col, ci) => {
                const k = colKeyOf(col, ci);
                const sorted = sort?.key === k ? sort.order : null;
                const filterVal = filters[k] ?? '';
                return (
                  <th
                    key={k}
                    style={{ width: col.width }}
                    className={cn(
                      pad,
                      'whitespace-nowrap text-xs font-semibold tracking-wide text-muted-foreground uppercase',
                      alignClass(col.align),
                      col.fixed === 'right' && 'sticky right-0 z-[1] bg-muted',
                      col.fixed === 'left' && 'sticky left-0 z-[1] bg-muted',
                    )}
                  >
                    <div
                      className={cn(
                        'flex items-center gap-1',
                        col.align === 'right' && 'justify-end',
                        col.align === 'center' && 'justify-center',
                      )}
                    >
                      {col.sorter ? (
                        <button
                          type="button"
                          onClick={() => onSortClick(col, k)}
                          className="inline-flex items-center gap-1 hover:text-foreground"
                        >
                          {col.title}
                          {sorted === 'ascend' ? (
                            <IconSortAscending className="size-3.5 text-primary" />
                          ) : sorted === 'descend' ? (
                            <IconSortDescending className="size-3.5 text-primary" />
                          ) : (
                            <IconSelector className="size-3.5 opacity-50" />
                          )}
                        </button>
                      ) : (
                        col.title
                      )}
                      {col.searchable && (
                        <SearchFilter
                          active={!!filterVal}
                          value={filterVal}
                          onApply={(v) => {
                            setFilters((f) => ({ ...f, [k]: v }));
                            if (!serverSide) setInternalPage(1);
                          }}
                        />
                      )}
                      {col.filters && (
                        <FilterDropdown
                          options={col.filters}
                          selected={colFilters[k] ?? []}
                          onApply={(vals) => {
                            setColFilters((f) => ({ ...f, [k]: vals }));
                            if (!serverSide) setInternalPage(1);
                          }}
                        />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="py-12">
                  {locale?.emptyText != null ? (
                    <div className="text-center text-sm text-muted-foreground">{locale.emptyText}</div>
                  ) : (
                    <Empty />
                  )}
                </td>
              </tr>
            ) : (
              renderRows(pageRows, 0)
            )}
          </tbody>
          {summary && pageRows.length > 0 && <tfoot>{summary(pageRows)}</tfoot>}
        </table>
      </div>

      {paged && total > 0 && (
        <Pagination
          current={current}
          pageSize={pageSize}
          total={total}
          showSizeChanger={paged.showSizeChanger}
          pageSizeOptions={paged.pageSizeOptions}
          showTotal={paged.showTotal}
          onChange={changePage}
        />
      )}
    </div>
  );
}

// ── Pagination control ─────────────────────────────────────────────────────────

function Pagination({
  current,
  pageSize,
  total,
  showSizeChanger,
  pageSizeOptions = ['10', '20', '50', '100'],
  showTotal,
  onChange,
}: {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: string[];
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  onChange: (page: number, pageSize: number) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const end = Math.min(current * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 px-1 py-3 text-sm">
      <span className="text-muted-foreground">
        {showTotal ? showTotal(total, [start, end]) : `${start}-${end} จาก ${total} รายการ`}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={current <= 1}
          onClick={() => onChange(current - 1, pageSize)}
          className="flex size-8 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IconChevronLeft className="size-4" />
        </button>
        <span className="px-2 tabular-nums text-foreground">
          {current} / {pageCount}
        </span>
        <button
          type="button"
          disabled={current >= pageCount}
          onClick={() => onChange(current + 1, pageSize)}
          className="flex size-8 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IconChevronRight className="size-4" />
        </button>
      </div>
      {showSizeChanger && (
        <div className="w-28">
          <Select
            size="small"
            value={String(pageSize)}
            onChange={(v) => v && onChange(1, Number(v))}
            options={pageSizeOptions.map((o) => ({ value: o, label: `${o} / หน้า` }))}
          />
        </div>
      )}
    </div>
  );
}

Table.Summary = Summary;
