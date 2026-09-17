import type { CSSProperties } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Popover } from 'radix-ui';
import { AppIcons } from '@/lib/icons';
import { highlightText } from '@/lib/highlightText';
import { useCombobox } from '@/lib/useCombobox';
import { cn } from '@/lib/utils';
import { INPUT_SM, POPOVER_CONTENT, SELECT_ITEM, SELECT_TRIGGER } from '@/lib/styles';
import { useBrandDropdown } from '../react-query';

export interface BrandSearchSelectProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  id?: string;
  'aria-invalid'?: boolean;
}

export function BrandSearchSelect({
  value,
  onChange,
  onOpenChange,
  placeholder = 'ค้นหาแบรนด์...',
  allowClear,
  disabled,
  className,
  style,
  id,
  'aria-invalid': ariaInvalid,
}: BrandSearchSelectProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  /**
   * ยิง API เมื่อ "เปิด dropdown" หรือ "มีค่าที่เลือกไว้แล้ว" เท่านั้น
   *
   * เปิด → ต้องมีตัวเลือกให้ดู · มีค่าอยู่แล้ว → ต้องโหลดมาแปลง id เป็นชื่อให้โชว์บนปุ่ม
   * ไม่งั้นฟอร์มแก้ไขจะโชว์ placeholder แทนชื่อแบรนด์ที่เลือกไว้
   * กรณีที่เหลือ (ฟอร์มสร้างใหม่ที่ยังไม่แตะช่องนี้) = ไม่ยิงเลย
   */
  const enabled = isOpen || (value != null && value !== '');

  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } = useBrandDropdown(
    search || undefined,
    { enabled },
  );

  const options = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.data.map((b) => ({ value: b.id, label: b.name }))),
    [data],
  );

  const handleOpenChange = useCallback(
    (o: boolean) => {
      setIsOpen(o);
      onOpenChange?.(o);
    },
    [onOpenChange],
  );

  const combo = useCombobox({
    options,
    value,
    onChange,
    // backend กรองให้แล้วผ่าน dropdown-search — กรองซ้ำในเครื่องจะตัดผลของหน้าถัดไปทิ้ง
    localFilter: false,
    onSearch: setSearch,
    onFetchNextPage: fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    onOpenChange: handleOpenChange,
  });

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
            <span className={cn('truncate', !combo.selected && 'text-foreground-muted')}>
              {combo.selected?.label ?? placeholder}
            </span>
            <AppIcons.chevronDown />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={4}
            className={cn(POPOVER_CONTENT, 'w-(--radix-popover-trigger-width) p-0')}
            // โฟกัสไปที่ช่องค้นหาเสมอ — ผู้ใช้เปิดช่องที่ค้นได้มาเพื่อพิมพ์ ไม่ใช่เพื่อกดลูกศร
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              searchInputRef.current?.focus();
            }}
          >
            <div className="border-b border-border-muted p-1.5">
              <input
                ref={searchInputRef}
                value={combo.search}
                onChange={(e) => combo.onSearchChange(e.target.value)}
                onKeyDown={combo.onKeyDown}
                placeholder="ค้นหาแบรนด์..."
                aria-label="ค้นหาแบรนด์"
                className={INPUT_SM}
              />
            </div>

            <div
              ref={combo.setListEl}
              onScroll={combo.onListScroll}
              role="listbox"
              className="max-h-60 overflow-y-auto p-1"
            >
              {combo.filtered.length === 0 ?
                <div className="px-2 py-6 text-center text-sm text-foreground-muted">
                  {isLoading ?
                    <AppIcons.loading spin className="mx-auto size-4" />
                  : 'ไม่พบแบรนด์'}
                </div>
              : combo.filtered.map((opt, i) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={opt.value === value}
                    data-index={i}
                    data-state={opt.value === value ? 'checked' : undefined}
                    onMouseEnter={() => combo.setActiveIndex(i)}
                    onClick={() => combo.pick(opt.value)}
                    className={cn(
                      SELECT_ITEM,
                      'text-left',
                      i === combo.activeIndex && 'bg-surface-200 text-foreground',
                    )}
                  >
                    <span className="flex-1 truncate">{highlightText(opt.label, combo.search)}</span>
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

      {/* ปุ่มล้างค่าอยู่นอกปุ่ม trigger — <button> ซ้อน <button> เป็น HTML ที่ใช้ไม่ได้ */}
      {showClear && (
        <button
          type="button"
          aria-label="ล้างแบรนด์ที่เลือก"
          onClick={() => combo.clear()}
          className="absolute top-1/2 right-8 -translate-y-1/2 rounded-sm p-0.5 text-foreground-muted transition-colors hover:text-foreground"
        >
          <AppIcons.close className="size-3.5" />
        </button>
      )}
    </div>
  );
}
