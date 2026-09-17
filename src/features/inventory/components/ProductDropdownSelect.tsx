import type { CSSProperties } from 'react';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Popover } from 'radix-ui';
import { debounce } from 'lodash';
import { AppIcons } from '@/lib/icons';
import { highlightText } from '@/lib/highlightText';
import { useCombobox } from '@/lib/useCombobox';
import { cn } from '@/lib/utils';
import { INPUT_SM, POPOVER_CONTENT, SELECT_ITEM, SELECT_TRIGGER } from '@/lib/styles';
import { useProductDropdown } from '../react-query';
import type { ProductDropdown } from '../types';

const SEARCH_DEBOUNCE_MS = 300;
const SCAN_FAST_MS = 30;
const SCAN_JUMP_CHARS = 3;

export interface ProductDropdownSelectProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  onSelect?: (barcode: string, product: ProductDropdown) => void;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  className?: string;
  style?: CSSProperties;
  id?: string;
  'aria-invalid'?: boolean;
}

export function ProductDropdownSelect({
  value,
  onChange,
  onSelect,
  onOpenChange,
  placeholder = 'ค้นหาสินค้า...',
  disabled,
  allowClear,
  className,
  style,
  id,
  'aria-invalid': ariaInvalid,
}: ProductDropdownSelectProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const isScanModeRef = useRef(false);
  const scanRef = useRef({ lastTime: 0, lastValue: '' });
  const searchInputRef = useRef<HTMLInputElement>(null);

  /**
   * ยิง API เมื่อเปิด / มีค่าที่เลือกไว้ / กำลังค้นหาอยู่ — ไม่ยิงตอน mount
   * `search` อยู่ในเงื่อนไขด้วยเพราะโหมดสแกน: ค่าอาจถูกเซ็ตแล้วต้องรอผลมา auto-select
   * ต่อให้ popover ถูกปิดไประหว่างนั้น
   */
  const enabled = isOpen || search !== '' || (value != null && value !== '');

  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } = useProductDropdown(
    { search: search || undefined },
    { enabled },
  );

  const productMap = useMemo(() => {
    const map = new Map<string, ProductDropdown>();
    (data?.pages ?? []).forEach((page) => page.data.forEach((p) => map.set(p.barcode, p)));
    return map;
  }, [data]);

  const options = useMemo(
    () =>
      (data?.pages ?? []).flatMap((page) =>
        page.data.map((product) => ({
          value: product.barcode,
          label: product.name,
          searchText: product.barcode,
        })),
      ),
    [data],
  );

  const handleOpenChange = useCallback(
    (o: boolean) => {
      setIsOpen(o);
      // useCombobox ไม่ได้ถือ `search` ของตัวนี้ไว้ (เราจัดการ debounce เอง) จึงต้องล้างเอง
      if (!o) setSearch('');
      onOpenChange?.(o);
    },
    [onOpenChange],
  );

  const handleChange = useCallback(
    (barcode: string | undefined) => {
      onChange?.(barcode);
      if (barcode != null) {
        const product = productMap.get(barcode);
        if (product) onSelect?.(barcode, product);
      }
    },
    [onChange, onSelect, productMap],
  );

  const combo = useCombobox({
    options,
    value,
    onChange: handleChange,
    // backend ค้นให้แล้ว — กรองซ้ำในเครื่องจะตัดผลของหน้าถัดไปทิ้ง
    localFilter: false,
    onFetchNextPage: fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    onOpenChange: handleOpenChange,
  });

  // เลือกอัตโนมัติเมื่อบาร์โค้ดตรงเป๊ะหลังสแกน
  useEffect(() => {
    if (!isScanModeRef.current || !search || isFetching) return;
    const allProducts = (data?.pages ?? []).flatMap((p) => p.data);
    const exact = allProducts.find((p) => p.barcode === search);
    if (exact) {
      isScanModeRef.current = false;
      onChange?.(exact.barcode);
      onSelect?.(exact.barcode, exact);
    }
  }, [data, isFetching, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const debouncedSetSearch = useMemo(
    () => debounce((v: string) => setSearch(v), SEARCH_DEBOUNCE_MS),
    [],
  );
  useEffect(() => () => debouncedSetSearch.cancel(), [debouncedSetSearch]);

  /**
   * แยก "คนพิมพ์" ออกจาก "เครื่องสแกนยิง" — เครื่องสแกนส่งอักขระรัวมากและมาทีละหลายตัว
   * ถ้า debounce แบบเดียวกับการพิมพ์ บาร์โค้ดจะมาช้าไป 300ms ทุกครั้งที่ยิง
   */
  function handleSearch(v: string) {
    const now = Date.now();
    const timeSinceLast = now - scanRef.current.lastTime;
    const lenDiff = v.length - scanRef.current.lastValue.length;
    scanRef.current = { lastTime: now, lastValue: v };

    const looksLikeScan =
      lenDiff >= SCAN_JUMP_CHARS || (lenDiff > 0 && timeSinceLast < SCAN_FAST_MS);

    if (looksLikeScan) {
      debouncedSetSearch.cancel();
      isScanModeRef.current = true;
      setSearch(v);
    } else {
      isScanModeRef.current = false;
      debouncedSetSearch(v);
    }
  }

  const selectedProduct = value ? productMap.get(value) : undefined;
  const isLoading = isFetching && !isFetchingNextPage;
  const showClear = allowClear && value != null && value !== '' && !disabled;

  return (
    <div className={cn('relative inline-flex w-full', className)} style={style}>
      <Popover.Root open={combo.open} onOpenChange={combo.setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            id={id}
            disabled={disabled}
            aria-invalid={ariaInvalid}
            className={cn(SELECT_TRIGGER, showClear && 'pr-14')}
          >
            {selectedProduct ?
              <span className="flex min-w-0 items-center gap-1 truncate">
                <span className="font-mono text-foreground-lighter">
                  [{selectedProduct.barcode}]
                </span>
                <span className="truncate">- {selectedProduct.name}</span>
              </span>
            : value ?
              <span className="truncate font-mono">{value}</span>
            : <span className="truncate text-foreground-muted">{placeholder}</span>}
            <AppIcons.chevronDown />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={4}
            className={cn(POPOVER_CONTENT, 'w-(--radix-popover-trigger-width) min-w-65 p-0')}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              searchInputRef.current?.focus();
            }}
          >
            <div className="border-b border-border-muted p-1.5">
              <input
                ref={searchInputRef}
                value={combo.search}
                onChange={(e) => {
                  combo.onSearchChange(e.target.value);
                  handleSearch(e.target.value);
                }}
                onKeyDown={combo.onKeyDown}
                placeholder="พิมพ์ชื่อหรือยิงบาร์โค้ด"
                aria-label="ค้นหาสินค้า"
                className={INPUT_SM}
              />
            </div>

            <div
              ref={combo.listRef}
              onScroll={combo.onListScroll}
              role="listbox"
              className="max-h-60 overflow-y-auto p-1"
            >
              {combo.filtered.length === 0 ?
                <div className="px-2 py-6 text-center text-sm text-foreground-muted">
                  {isLoading ?
                    <AppIcons.loading spin className="mx-auto size-4" />
                  : 'ไม่พบสินค้า'}
                </div>
              : combo.filtered.map((opt, i) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={opt.value === value}
                    data-index={i}
                    onMouseEnter={() => combo.setActiveIndex(i)}
                    onClick={() => combo.pick(opt.value)}
                    className={cn(
                      SELECT_ITEM,
                      'text-left',
                      i === combo.activeIndex && 'bg-surface-200 text-foreground',
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate text-sm">
                      <span className="font-mono text-foreground-lighter">
                        [{highlightText(opt.value, search)}]
                      </span>{' '}
                      - {highlightText(opt.label, search)}
                    </span>
                    {opt.value === value && <AppIcons.check className="text-primary" />}
                  </button>
                ))
              }

              {isFetchingNextPage && (
                <div className="border-t border-border-muted py-2 text-center">
                  <AppIcons.loading spin className="mx-auto size-4 text-foreground-muted" />
                </div>
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {showClear && (
        <button
          type="button"
          aria-label="ล้างสินค้าที่เลือก"
          onClick={() => combo.clear()}
          className="absolute top-1/2 right-8 -translate-y-1/2 rounded-sm p-0.5 text-foreground-muted transition-colors hover:text-foreground"
        >
          <AppIcons.close className="size-3.5" />
        </button>
      )}
    </div>
  );
}
