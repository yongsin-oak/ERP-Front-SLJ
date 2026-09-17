/**
 * Logic ของช่องเลือกที่ "ค้นหาได้" — Radix ไม่มี Combobox primitive ให้
 *
 * Radix Select เป็น listbox ล้วน พิมพ์ค้นไม่ได้ ช่องที่ต้องค้นหาจึงต้องประกอบเองจาก
 * Popover + <input> + รายการ ซึ่งส่วนที่พลาดง่ายคือ "ตรรกะ" ไม่ใช่ markup:
 *   - ปุ่มลูกศร/Enter/Escape ต้องเดินรายการได้จริง ไม่ใช่แค่โฟกัสช่องพิมพ์
 *   - ต้องเลื่อนไปหาตัวที่ไฮไลต์ ไม่งั้นกดลูกศรลงแล้วรายการไม่ขยับตาม
 *   - เลื่อนใกล้ก้นรายการต้องโหลดหน้าถัดไป (cursor paging) โดยไม่ยิงซ้ำ
 *   - พิมพ์ต้อง debounce ก่อนยิง API
 *
 * hook นี้คืนเฉพาะ "สถานะ + handler" ไม่มี JSX — หน้าเพจประกอบ Radix เองตามที่ต้องการ
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { debounce } from 'lodash';

/** เหลือระยะเท่าไรถึงก้นรายการจึงเริ่มโหลดหน้าถัดไป — ต้องโหลดก่อนผู้ใช้ชนก้น */
const SCROLL_THRESHOLD_PX = 60;
const DEFAULT_DEBOUNCE_MS = 300;

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** ข้อความที่ใช้ค้นเพิ่มเติม (เช่น SKU) — ถ้าไม่ส่งจะค้นจาก label */
  searchText?: string;
}

export interface UseComboboxOptions {
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string | undefined) => void;
  /** กรองเองในเครื่อง — ปิดเมื่อ backend กรองให้แล้ว (dropdown-search) */
  localFilter?: boolean;
  /** ยิงเมื่อคำค้นเปลี่ยน (debounce แล้ว) — ใช้กับ endpoint ที่ค้นฝั่ง server */
  onSearch?: (search: string) => void;
  debounceMs?: number;
  /** โหลดหน้าถัดไปเมื่อเลื่อนใกล้ก้นรายการ */
  onFetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function useCombobox({
  options,
  value,
  onChange,
  localFilter = true,
  onSearch,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  onFetchNextPage,
  hasNextPage = false,
  isFetchingNextPage = false,
  onOpenChange,
}: UseComboboxOptions) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // latest-ref: ผู้เรียกมักส่ง onSearch เป็น lambda ใหม่ทุก render — ถ้าใส่ใน deps
  // debounce จะถูกสร้างใหม่ตลอดจนไม่ได้ debounce จริง
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  });

  const debouncedSearch = useMemo(
    () => debounce((v: string) => onSearchRef.current?.(v), debounceMs),
    [debounceMs],
  );
  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  const filtered = useMemo(() => {
    if (!localFilter || !search.trim()) return options;
    const q = search.trim().toLowerCase();
    return options.filter((o) => `${o.searchText ?? ''} ${o.label}`.toLowerCase().includes(q));
  }, [options, localFilter, search]);

  const selected = useMemo(() => options.find((o) => o.value === value), [options, value]);

  /**
   * ทางเข้า-ออกทางเดียวของสถานะเปิด/ปิด — การเลือก option ก็ต้องผ่านตัวนี้
   * ไม่งั้นการปิดจากการเลือกจะไม่ยิง onOpenChange ผู้เรียกที่ใช้ค่านี้ไป gate query
   * (`enabled: open`) จะค้างคิดว่ายังเปิดอยู่ตลอด
   */
  const changeOpen = useCallback(
    (o: boolean) => {
      if (!o) {
        // ล้างคำค้นตอนปิด และบอกผู้เรียกด้วย — ไม่งั้นเปิดใหม่จะเห็นช่องว่าง
        // แต่รายการยังกรองด้วยคำเดิมค้างอยู่
        setSearch('');
        debouncedSearch.cancel();
        onSearchRef.current?.('');
      }
      setActiveIndex(0);
      setOpen(o);
      onOpenChange?.(o);
    },
    [debouncedSearch, onOpenChange],
  );

  const pick = useCallback(
    (v: string) => {
      onChange?.(v);
      changeOpen(false);
    },
    [onChange, changeOpen],
  );

  const clear = useCallback(() => onChange?.(undefined), [onChange]);

  const onSearchChange = useCallback(
    (v: string) => {
      setSearch(v);
      setActiveIndex(0);
      debouncedSearch(v);
    },
    [debouncedSearch],
  );

  /** เลื่อนรายการให้ตัวที่ไฮไลต์อยู่ในสายตา — คำนวณเองแทน scrollIntoView เพื่อไม่เลื่อนทั้งหน้า */
  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    if (!list || !el) return;
    const top = el.offsetTop;
    const bottom = top + el.offsetHeight;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = bottom - list.clientHeight;
    }
  }, [activeIndex, open]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        changeOpen(false);
        return;
      }
      if (!filtered.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const opt = filtered[activeIndex] ?? filtered[0];
        if (opt && !opt.disabled) pick(opt.value);
      }
    },
    [filtered, activeIndex, pick, changeOpen],
  );

  /** โหลดหน้าถัดไปเมื่อเลื่อนใกล้ก้นรายการ — ไม่ยิงซ้ำระหว่างที่หน้าเดิมยังโหลดไม่เสร็จ */
  const onListScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!onFetchNextPage || isFetchingNextPage || !hasNextPage) return;
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD_PX) onFetchNextPage();
    },
    [onFetchNextPage, isFetchingNextPage, hasNextPage],
  );

  return {
    open,
    setOpen: changeOpen,
    search,
    onSearchChange,
    filtered,
    selected,
    activeIndex,
    setActiveIndex,
    listRef,
    onKeyDown,
    onListScroll,
    pick,
    clear,
  };
}
