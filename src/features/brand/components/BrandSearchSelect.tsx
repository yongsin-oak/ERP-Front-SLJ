import { useState, useMemo } from 'react';
import { InfiniteSearchSelect, highlightText } from '@design-system';
import type { InfiniteSearchSelectProps } from '@design-system';
import { useBrandDropdown } from '../react-query';

type Props = Omit<InfiniteSearchSelectProps, 'options' | 'isLoading' | 'isFetchingNextPage' | 'hasNextPage' | 'onFetchNextPage' | 'onSearch'>;

export function BrandSearchSelect(props: Props) {
  const [search, setSearch] = useState('');
  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useBrandDropdown(search || undefined);

  const options = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.data.map((b) => ({ value: b.id, label: b.name }))),
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
      notFoundText="ไม่พบแบรนด์"
      placeholder="ค้นหาแบรนด์..."
      optionRender={(opt) => highlightText(opt.label as string, search)}
      {...props}
    />
  );
}
