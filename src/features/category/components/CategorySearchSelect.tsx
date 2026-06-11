import { useState, useMemo } from 'react';
import { InfiniteSearchSelect, highlightText } from '@design-system';
import type { InfiniteSearchSelectProps } from '@design-system';
import { useCategoryDropdown } from '../react-query';

type Props = Omit<InfiniteSearchSelectProps, 'options' | 'isLoading' | 'isFetchingNextPage' | 'hasNextPage' | 'onFetchNextPage' | 'onSearch'>;

export function CategorySearchSelect(props: Props) {
  const [search, setSearch] = useState('');
  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useCategoryDropdown(search || undefined);

  const options = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.data.map((c) => ({ value: c.id, label: c.name }))),
    [data],
  );

  return (
    <InfiniteSearchSelect
      options={options}
      isLoading={isFetching && !isFetchingNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={!!hasNextPage}
      onFetchNextPage={fetchNextPage}
      onSearch={setSearch}
      notFoundText="ไม่พบหมวดหมู่"
      placeholder="ค้นหาหมวดหมู่..."
      optionRender={(opt) => highlightText(opt.label as string, search)}
      {...props}
    />
  );
}
