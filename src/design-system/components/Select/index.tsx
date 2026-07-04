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

const SIZE_H = {
  small: 'h-8 text-sm',
  middle: 'h-9 text-sm',
  large: 'h-10 text-base',
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

export function Select({
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
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [internal, setInternal] = React.useState<string | undefined>(defaultValue);
  const selected = value !== undefined ? value : internal;

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
    if (value === undefined) setInternal(v);
    onChange?.(v);
    setOpen(false);
    setSearch('');
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    if (value === undefined) setInternal(undefined);
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
        'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none',
        'hover:bg-accent focus-visible:bg-accent',
        o.value === selected && 'font-medium',
        o.disabled && 'pointer-events-none opacity-50',
      )}
    >
      <span className="truncate">{optionRender ? optionRender(o) : o.label}</span>
      {o.value === selected && <IconCheck className="size-4 shrink-0 text-primary" />}
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
            'group flex w-full items-center justify-between gap-2 rounded-md border bg-background px-3 text-foreground shadow-xs transition-[color,border-color,box-shadow] duration-150 outline-none',
            'hover:border-border-strong focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20',
            'data-[state=open]:border-ring data-[state=open]:ring-[3px] data-[state=open]:ring-ring/20',
            SIZE_H[size],
            status === 'error' && 'border-destructive focus-visible:ring-destructive/20',
            !status && 'border-input',
            disabled && 'cursor-not-allowed border-border bg-disabled-bg text-disabled',
            className,
          )}
          style={style}
        >
          <span className={cn('truncate', selectedOption == null && 'text-foreground-subtle')}>
            {selectedOption?.label ?? placeholder}
          </span>
          <span className="flex shrink-0 items-center text-foreground-subtle">
            {loading ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : showClear ? (
              <span
                role="button"
                tabIndex={-1}
                aria-label="ล้าง"
                onClick={clear}
                className="hover:text-foreground"
              >
                <IconX className="size-4" />
              </span>
            ) : (
              <IconChevronDown className="size-4 opacity-70" />
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
          <div className="mb-1 flex items-center gap-2 border-b border-divider px-2 pb-2">
            <IconSearch className="size-4 shrink-0 text-foreground-subtle" />
            <input
              autoFocus
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                searchCfg?.onSearch?.(e.target.value);
              }}
              placeholder="ค้นหา"
              className="w-full bg-transparent text-sm outline-none placeholder:text-foreground-subtle"
            />
          </div>
        )}
        <div role="listbox" className="max-h-64 overflow-y-auto" onScroll={onPopupScroll}>
          {flatten(filtered).length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              {notFoundContent}
            </div>
          ) : (
            filtered.map((it, i) =>
              isGroup(it) ? (
                <div key={`group-${String(it.label ?? i)}`} className="py-1">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">{it.label}</div>
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
