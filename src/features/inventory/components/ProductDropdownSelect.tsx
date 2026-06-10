import { useState, useMemo } from "react";
import { Select, Spin } from "antd";
import type { SelectProps } from "antd";
import { debounce } from "lodash";
import { colors } from "@design-system";
import { useProductDropdown } from "../react-query";
import type { ProductDropdown } from "../types";

const SCROLL_THRESHOLD_PX = 60;
const SEARCH_DEBOUNCE_MS = 300;

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

  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useProductDropdown({ search: search || undefined });

  const options = useMemo(
    () =>
      (data?.pages ?? []).flatMap((page) =>
        page.data.map((product) => ({
          value: product.barcode,
          label: (
            <span>
              {product.name}
              <span
                style={{
                  color: colors.text.tertiary,
                  marginLeft: 6,
                  fontSize: 12,
                }}
              >
                {product.barcode}
              </span>
            </span>
          ),
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
        onSearch: debouncedSetSearch,
        filterOption: false
      }}
      value={value}
      onChange={onChange}
      onSelect={handleSelect}
      options={options}
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
