import { useState, useMemo, useRef, useEffect } from "react";
import { Select, Spin } from "antd";
import type { SelectProps } from "antd";
import { debounce } from "lodash";
import { colors, highlightText } from "@design-system";
import { useProductDropdown } from "../react-query";
import type { ProductDropdown } from "../types";

const SCROLL_THRESHOLD_PX = 60;
const SEARCH_DEBOUNCE_MS = 300;
const SCAN_FAST_MS = 30;
const SCAN_JUMP_CHARS = 3;

export interface ProductDropdownSelectProps extends Omit<
  SelectProps<string>,
  "options" | "onSelect" | "filterOption" | "onSearch"
> {
  onSelect?: (barcode: string, product: ProductDropdown) => void;
}

export function ProductDropdownSelect({
  value,
  onChange,
  onSelect,
  placeholder = "ค้นหาสินค้า...",
  disabled,
  style,
  allowClear,
  size,
  ...rest
}: ProductDropdownSelectProps) {
  const [search, setSearch] = useState("");
  const isScanModeRef = useRef(false);
  const scanRef = useRef({ lastTime: 0, lastValue: "" });

  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useProductDropdown({ search: search || undefined });

  // Auto-select on exact barcode match after scan
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

  const options = useMemo(
    () =>
      (data?.pages ?? []).flatMap((page) =>
        page.data.map((product) => ({
          value: product.barcode,
          label: `${product.barcode} - ${product.name}`,
          product,
        })),
      ),
    [data],
  );

  const productMap = useMemo(() => {
    const map = new Map<string, ProductDropdown>();
    (data?.pages ?? []).forEach((page) =>
      page.data.forEach((p) => map.set(p.barcode, p)),
    );
    return map;
  }, [data]);

  const debouncedSetSearch = useMemo(
    () => debounce((v: string) => setSearch(v), SEARCH_DEBOUNCE_MS),
    [],
  );

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

  const handlePopupScroll = (e: React.UIEvent<HTMLElement>) => {
    if (isFetchingNextPage || !hasNextPage) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD_PX) {
      void fetchNextPage();
    }
  };

  const handleSelect = (barcode: string) => {
    const product = productMap.get(barcode);
    if (product) onSelect?.(barcode, product);
  };

  return (
    <Select<string>
      showSearch={{
        onSearch: handleSearch,
        filterOption: false,
      }}
      value={value}
      onChange={onChange}
      onSelect={handleSelect}
      options={options}
      optionRender={(opt) => {
        const p = (opt.data as typeof options[0]).product;
        return (
          <div style={{ lineHeight: 1.4, padding: "2px 0" }}>
            <div style={{ fontFamily: "monospace", fontSize: 12, color: colors.text.secondary }}>
              {highlightText(p.barcode, search)}
            </div>
            <div style={{ fontSize: 14 }}>{highlightText(p.name, search)}</div>
          </div>
        );
      }}
      placeholder={placeholder}
      disabled={disabled}
      style={style}
      allowClear={allowClear}
      size={size}
      loading={isFetching && !isFetchingNextPage}
      notFoundContent={
        isFetching ?
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <Spin size="small" />
          </div>
        : "ไม่พบสินค้า"
      }
      onPopupScroll={handlePopupScroll}
      popupRender={(menu) => (
        <>
          {menu}
          {isFetchingNextPage && (
            <div
              style={{
                textAlign: "center",
                padding: "8px 0",
                borderTop: `1px solid ${colors.neutral[200]}`,
              }}
            >
              <Spin size="small" />
            </div>
          )}
        </>
      )}
      {...rest}
    />
  );
}
