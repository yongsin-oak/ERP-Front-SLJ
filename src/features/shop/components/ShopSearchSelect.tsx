import { useState, useMemo } from 'react';
import { InfiniteSearchSelect, highlightText } from '@design-system';
import type { InfiniteSearchSelectProps } from '@design-system';
import { useShopDropdown } from '../react-query';

type Props = Omit<InfiniteSearchSelectProps, 'options' | 'isLoading' | 'isFetchingNextPage' | 'hasNextPage' | 'onFetchNextPage' | 'onSearch'>;

export function ShopSearchSelect(props: Props) {
  const [search, setSearch] = useState('');
  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useShopDropdown(search || undefined);

  const options = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.data.map((s) => ({ value: s.id, label: s.name }))),
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
      notFoundText="ไม่พบร้านค้า"
      placeholder="ค้นหาร้านค้า..."
      optionRender={(opt) => highlightText(opt.label as string, search)}
      {...props}
    />
  );
}
