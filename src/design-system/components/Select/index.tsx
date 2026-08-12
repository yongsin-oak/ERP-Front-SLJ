import * as React from 'react';
import {
  IconCheck,
  IconChevronDown,
  IconLoader2,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { FIELD_BORDER } from '@/lib/fieldStyles';

export interface SelectOption {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
}

export interface SelectOptionGroup {
  label: React.ReactNode;
  options: SelectOption[];
}

type SelectItems = Array<SelectOption | SelectOptionGroup>;

export interface SelectShowSearch {
  optionFilterProp?: string;
  filterOption?: boolean | ((input: string, option?: SelectOption) => boolean);
  onSearch?: (value: string) => void;
}

export interface SelectProps {
  options?: SelectItems;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string | undefined) => void;
  placeholder?: React.ReactNode;
  showSearch?: boolean | SelectShowSearch;
  allowClear?: boolean;
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'middle' | 'large';
  notFoundContent?: React.ReactNode;
  popupMatchSelectWidth?: boolean;
  /** antd compat — filtering here is always by visible label text */
  optionFilterProp?: string;
  /** fires on dropdown list scroll — for infinite loading */
  onPopupScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  /** rendered below the option list (e.g. loading-more spinner) */
  dropdownFooter?: React.ReactNode;
  /** custom render for each option row (antd `optionRender`) */
  optionRender?: (option: SelectOption) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  status?: 'error' | 'warning';
}

/** ความสูง control ตาม geometry contract — 30 / 34 / 38px (SUPABASE-DS-PLAN.md §2.4) */
const SIZE_H = {
  small: 'h-7.5 text-sm',
  middle: 'h-8.5 text-sm',
  large: 'h-9.5 text-sm',
} as const;

function isGroup(item: SelectOption | SelectOptionGroup): item is SelectOptionGroup {
  return Array.isArray((item as SelectOptionGroup).options);
}

function flatten(items: SelectItems): SelectOption[] {
  return items.flatMap((it) => (isGroup(it) ? it.options : [it]));
}

function labelText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(labelText).join('');
  if (React.isValidElement(node)) {
    return labelText((node.props as { children?: React.ReactNode }).children);
  }
  return '';
}

export function Select(props: SelectProps) {
  const {
    options = [],
    value,
    defaultValue,
    onChange,
    placeholder = 'เลือก',
    showSearch,
    allowClear,
    disabled,
    loading,
    size = 'middle',
    notFoundContent = 'ไม่พบข้อมูล',
    popupMatchSelectWidth = true,
    onPopupScroll,
    dropdownFooter,
    optionRender,
    className,
    style,
    id,
    status,
  } = props;

  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [internal, setInternal] = React.useState<string | undefined>(defaultValue);

  // controlled = ผู้เรียก "ส่ง prop value มา" ไม่ใช่ "ส่งค่าที่ไม่ใช่ undefined มา"
  // เทียบด้วย `value !== undefined` ไม่ได้ เพราะทุกหน้าเขียน `value={status || undefined}`
  // พอเคลียร์ตัวกรองค่าเป็น '' → undefined → component จะสลับไป uncontrolled เงียบๆ
  // แล้วโชว์ `internal` ที่ค้างค่าเดิม (ตัวกรองหายจากข้อมูลแล้วแต่ยังโชว์อยู่บนจอ)
  // เทียบเท่ากับที่ `Input` ทำอยู่ — ดู Input/index.tsx
  const isControlled = 'value' in props;
  const selected = isControlled ? value : internal;

  const all = React.useMemo(() => flatten(options), [options]);
  const selectedOption = all.find((o) => o.value === selected);

  const searchCfg = typeof showSearch === 'object' ? showSearch : null;
  const searchEnabled = Boolean(showSearch);
  const localFilter = searchCfg?.filterOption !== false;

  const filtered = React.useMemo(() => {
    if (!searchEnabled || !localFilter || !search.trim()) return options;
    const q = search.trim().toLowerCase();
    const custom = typeof searchCfg?.filterOption === 'function' ? searchCfg.filterOption : null;
    const keep = (o: SelectOption) =>
      custom ? custom(search, o) : labelText(o.label).toLowerCase().includes(q);
    return options
      .map((it) =>
        isGroup(it) ? { ...it, options: it.options.filter(keep) } : keep(it) ? it : null,
      )
      .filter((it): it is SelectOption | SelectOptionGroup =>
        it != null && (!isGroup(it) || it.options.length > 0),
      );
  }, [options, searchEnabled, localFilter, searchCfg, search]);

  function pick(v: string) {
    if (!isControlled) setInternal(v);
    onChange?.(v);
    setOpen(false);
    setSearch('');
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    if (!isControlled) setInternal(undefined);
    onChange?.(undefined);
  }

  const showClear = allowClear && selected != null && selected !== '' && !disabled;

  const renderOption = (o: SelectOption) => (
    <button
      key={o.value}
      type="button"
      role="option"
      aria-selected={o.value === selected}
      disabled={o.disabled}
      onClick={() => pick(o.value)}
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none',
        'hover:bg-surface-200 focus-visible:bg-surface-200',
        o.value === selected && 'font-medium',
        o.disabled && 'pointer-events-none opacity-50',
      )}
    >
      <span className="truncate">{optionRender ? optionRender(o) : o.label}</span>
      {o.value === selected && <IconCheck className="size-3.5 shrink-0 text-primary" />}
    </button>
  );

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          aria-invalid={status === 'error' || undefined}
          className={cn(
            'group flex w-full items-center justify-between gap-2 rounded-md bg-control px-3 text-foreground',
            FIELD_BORDER,
            SIZE_H[size],
            className,
          )}
          style={style}
        >
          <span className={cn('truncate', selectedOption == null && 'text-foreground-muted')}>
            {selectedOption?.label ?? placeholder}
          </span>
          <span className="flex shrink-0 items-center text-foreground-muted">
            {loading ? (
              <IconLoader2 className="size-3.5 animate-spin" />
            ) : showClear ? (
              <span
                role="button"
                tabIndex={-1}
                aria-label="ล้าง"
                onClick={clear}
                className="hover:text-foreground"
              >
                <IconX className="size-3.5" />
              </span>
            ) : (
              <IconChevronDown className="size-3.5" />
            )}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className={cn('p-1', popupMatchSelectWidth && 'w-(--radix-popover-trigger-width)')}
        style={popupMatchSelectWidth ? undefined : { minWidth: 'var(--radix-popover-trigger-width)' }}
      >
        {searchEnabled && (
          <div className="mb-1 flex items-center gap-2 border-b border-border-muted px-2 pb-2">
            <IconSearch className="size-3.5 shrink-0 text-foreground-muted" />
            <input
              autoFocus
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                searchCfg?.onSearch?.(e.target.value);
              }}
              placeholder="ค้นหา"
              className="w-full bg-transparent text-sm outline-none placeholder:text-foreground-muted"
            />
          </div>
        )}
        <div role="listbox" className="max-h-64 overflow-y-auto" onScroll={onPopupScroll}>
          {flatten(filtered).length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-foreground-lighter">
              {notFoundContent}
            </div>
          ) : (
            filtered.map((it, i) =>
              isGroup(it) ? (
                // label อาจเป็น ReactNode (เช่น badge+ข้อความ) → stringify แล้วชนกันเป็น
                // "[object Object]". ใช้ value ของ option แรกซึ่งเป็น string ที่ไม่ซ้ำแทน
                <div key={`group-${it.options[0]?.value ?? i}`} className="py-1">
                  <div className="px-2 py-1 text-xs font-medium text-foreground-lighter">{it.label}</div>
                  {it.options.map(renderOption)}
                </div>
              ) : (
                renderOption(it)
              ),
            )
          )}
          {dropdownFooter}
        </div>
      </PopoverContent>
    </Popover>
  );
}
