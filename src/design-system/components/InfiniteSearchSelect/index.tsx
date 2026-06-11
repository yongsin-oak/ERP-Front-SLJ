import { useMemo } from 'react';
import { Select, Spin } from 'antd';
import type { SelectProps } from 'antd';
import { debounce } from 'lodash';
import { colors } from '../../tokens';

const SCROLL_THRESHOLD_PX = 60;

export interface InfiniteSearchOption {
  value: string;
  label: string;
}

export interface InfiniteSearchSelectProps
  extends Omit<SelectProps<string>, 'options' | 'filterOption' | 'onSearch' | 'loading'> {
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
  const debouncedSearch = useMemo(
    () => debounce((v: string) => onSearch(v), debounceMs),
    [onSearch, debounceMs],
  );

  const handlePopupScroll = (e: React.UIEvent<HTMLElement>) => {
    if (isFetchingNextPage || !hasNextPage) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD_PX) {
      onFetchNextPage();
    }
  };

  return (
    <Select<string>
      showSearch={{
        onSearch: debouncedSearch,
        filterOption: false,
      }}
      options={options}
      loading={isLoading && !isFetchingNextPage}
      notFoundContent={
        isLoading ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <Spin size="small" />
          </div>
        ) : (
          notFoundText
        )
      }
      onPopupScroll={handlePopupScroll}
      popupRender={(menu) => (
        <>
          {menu}
          {isFetchingNextPage && (
            <div
              style={{
                textAlign: 'center',
                padding: '8px 0',
                borderTop: `1px solid ${colors.neutral[200]}`,
              }}
            >
              <Spin size="small" />
            </div>
          )}
        </>
      )}
      style={{ width: '100%' }}
      {...rest}
    />
  );
}
