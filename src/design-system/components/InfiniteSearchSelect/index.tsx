import { useEffect, useMemo, useRef } from 'react';
import { debounce } from 'lodash';
import { Select } from '../Select';
import type { SelectProps } from '../Select';
import { Spinner } from '@/components/ui/spinner';

const SCROLL_THRESHOLD_PX = 60;

export interface InfiniteSearchOption {
  value: string;
  label: string;
}

export interface InfiniteSearchSelectProps
  extends Omit<SelectProps, 'options' | 'loading' | 'showSearch' | 'onPopupScroll' | 'dropdownFooter' | 'notFoundContent'> {
  options: InfiniteSearchOption[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onFetchNextPage: () => void;
  onSearch: (value: string) => void;
  debounceMs?: number;
  notFoundText?: string;
}

export function InfiniteSearchSelect({
  options,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onFetchNextPage,
  onSearch,
  debounceMs = 300,
  notFoundText = 'ไม่พบข้อมูล',
  ...rest
}: InfiniteSearchSelectProps) {
  // latest-ref: ผู้เรียกมักส่ง onSearch เป็น lambda ใหม่ทุก render — ถ้าใส่ใน deps
  // debounce จะถูกสร้างใหม่ตลอดจนไม่ได้ debounce จริง
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  });
  const debouncedSearch = useMemo(
    () => debounce((v: string) => onSearchRef.current(v), debounceMs),
    [debounceMs],
  );
  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  const handlePopupScroll = (e: React.UIEvent<HTMLElement>) => {
    if (isFetchingNextPage || !hasNextPage) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD_PX) {
      onFetchNextPage();
    }
  };

  return (
    <Select
      showSearch={{ onSearch: debouncedSearch, filterOption: false }}
      options={options}
      loading={isLoading && !isFetchingNextPage}
      notFoundContent={
        isLoading ? (
          <div className="py-2 text-center">
            <Spinner size="sm" className="mx-auto" />
          </div>
        ) : (
          notFoundText
        )
      }
      onPopupScroll={handlePopupScroll}
      dropdownFooter={
        isFetchingNextPage ? (
          <div className="border-t border-divider py-2 text-center">
            <Spinner size="sm" className="mx-auto" />
          </div>
        ) : null
      }
      {...rest}
    />
  );
}
