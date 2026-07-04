import { useState, useMemo, useRef, useEffect } from "react";
import { debounce } from "lodash";
import { Select, highlightText } from "@design-system";
import type { SelectProps } from "@design-system";
import { Spinner } from "@/components/ui/spinner";
import { useProductDropdown } from "../react-query";
import type { ProductDropdown } from "../types";

const SCROLL_THRESHOLD_PX = 60;
const SEARCH_DEBOUNCE_MS = 300;
const SCAN_FAST_MS = 30;
const SCAN_JUMP_CHARS = 3;

export interface ProductDropdownSelectProps extends Omit<
  SelectProps,
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
          label: `[${product.barcode}] - ${product.name}`,
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

  const handlePopupScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isFetchingNextPage || !hasNextPage) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD_PX) {
      void fetchNextPage();
    }
  };

  const handleChange = (barcode: string | undefined) => {
    onChange?.(barcode);
    if (barcode != null) {
      const product = productMap.get(barcode);
      if (product) onSelect?.(barcode, product);
    }
  };

  return (
    <Select
      showSearch={{
        onSearch: handleSearch,
        filterOption: false,
      }}
      value={value}
      onChange={handleChange}
      options={options}
      optionRender={(opt) => {
        const p = productMap.get(opt.value);
        if (!p) return opt.label;
        return (
          <div style={{ fontSize: 14, padding: "2px 0" }}>
            <span className="font-mono text-muted-foreground">
              [{highlightText(p.barcode, search)}]
            </span>{" "}
            - {highlightText(p.name, search)}
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
            <Spinner size="sm" />
          </div>
        : "ไม่พบสินค้า"
      }
      onPopupScroll={handlePopupScroll}
      dropdownFooter={
        isFetchingNextPage ? (
          <div className="border-t border-border py-2 text-center">
            <Spinner size="sm" />
          </div>
        ) : null
      }
      {...rest}
    />
  );
}
