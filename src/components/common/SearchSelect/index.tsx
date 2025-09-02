/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, Ref } from "react";
import { Select, Spin, SelectProps } from "antd";

export interface SearchSelectOption<T = unknown> {
  label: string;
  value: string | number;
  data?: T;
}
export interface SearchSelectProps<T = unknown>
  extends Omit<
    SelectProps,
    "options" | "loading" | "onSearch" | "onPopupScroll"
  > {
  // Required API related props
  onLoadData: (
    page: number,
    limit: number,
    reset?: boolean
  ) => Promise<
    | {
        data: T[];
        total: number;
      }
    | undefined
  >;

  // Required data transformation props
  mapDataToOptions: (data: T[]) => SearchSelectOption<T>[];

  // Pagination props
  pageSize?: number;
  enablePagination?: boolean;

  // Search props
  enableSearch?: boolean;
  searchDelay?: number;

  // Loading props
  loadingText?: React.ReactNode;
  emptyText?: React.ReactNode;

  // Auto load on mount
  autoLoad?: boolean;

  // Initial options (สำหรับป้องกันการกระพริบ)
  initialOptions?: SearchSelectOption<T>[];

  ref?: Ref<any>;
}

const SearchSelect = <T extends Record<string, any>>({
  onLoadData,
  mapDataToOptions,
  pageSize = 10,
  enablePagination = true,
  enableSearch = true,
  searchDelay = 300,
  loadingText = <Spin size="small" />,
  emptyText = "ไม่พบข้อมูล",
  autoLoad = true,
  initialOptions = [],
  ref,
  ...selectProps
}: SearchSelectProps<T>) => {
  const [options, setOptions] =
    useState<SearchSelectOption<T>[]>(initialOptions);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load data function
  const loadData = async (page: number, reset: boolean = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await onLoadData(page, pageSize, reset);
      const newOptions = mapDataToOptions(response?.data || []);

      if (reset) {
        setOptions(newOptions);
      } else {
        setOptions((prev) => [...prev, ...newOptions]);
      }

      const totalPages = Math.ceil((response?.total || 0) / pageSize);
      console.log(totalPages);
      setHasMore(page < totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (!autoLoad) return;

    const loadInitialData = async () => {
      setLoading(true);
      try {
        const response = await onLoadData(1, pageSize);
        const newOptions = mapDataToOptions(response?.data || []);
        setOptions(newOptions);

        const totalPages = Math.ceil((response?.total || 0) / pageSize);
        setHasMore(1 < totalPages);
        setCurrentPage(1);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [onLoadData, mapDataToOptions, pageSize, autoLoad]);

  // Handle search with debounce
  const handleSearch = (value: string) => {
    if (!enableSearch) return;

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      if (value.trim()) {
        setCurrentPage(1);
        loadData(1, true);
      } else {
        // Reset to initial data when search is cleared
        setCurrentPage(1);
        loadData(1, true);
      }
    }, searchDelay);
  };

  // Handle scroll for pagination
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!enablePagination) return;

    const { target } = e;
    if (target instanceof HTMLDivElement) {
      const { scrollTop, scrollHeight, clientHeight } = target;
      if (scrollTop + clientHeight === scrollHeight && hasMore && !loading) {
        loadData(currentPage + 1);
      }
    }
  };

  // Filter function for client-side filtering
  const filterOption = enableSearch
    ? (input: string, option?: SearchSelectOption) => {
        if (!option) return false;
        return (
          option.label.toLowerCase().includes(input.toLowerCase()) ||
          option.value.toString().toLowerCase().includes(input.toLowerCase())
        );
      }
    : false;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Select
      ref={ref}
      showSearch={enableSearch}
      loading={loading}
      options={options}
      onSearch={handleSearch}
      onPopupScroll={enablePagination ? handleScroll : undefined}
      filterOption={filterOption}
      notFoundContent={loading ? loadingText : emptyText}
      popupRender={(menu) => (
        <div>
          {menu}
          {loading && hasMore && (
            <div
              style={{
                padding: "8px",
                textAlign: "center",
                borderTop: "1px solid #f0f0f0",
              }}
            >
              <Spin size="small" />
            </div>
          )}
        </div>
      )}
      {...selectProps}
    />
  );
};

export default SearchSelect;
