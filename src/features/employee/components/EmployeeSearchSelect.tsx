import { useState, useMemo } from 'react';
import { InfiniteSearchSelect, highlightText } from '@design-system';
import type { InfiniteSearchSelectProps } from '@design-system';
import { useEmployeeDropdown } from '../react-query';

type Props = Omit<InfiniteSearchSelectProps, 'options' | 'isLoading' | 'isFetchingNextPage' | 'hasNextPage' | 'onFetchNextPage' | 'onSearch'>;

export function EmployeeSearchSelect(props: Props) {
  const [search, setSearch] = useState('');
  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useEmployeeDropdown(search || undefined);

  const options = useMemo(
    () =>
      (data?.pages ?? []).flatMap((p) =>
        p.data.map((e) => ({
          value: e.id,
          label: `${e.firstName} ${e.lastName} (${e.nickname})`,
        })),
      ),
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
      notFoundText="ไม่พบพนักงาน"
      placeholder="ค้นหาพนักงาน..."
      optionRender={(opt) => highlightText(opt.label as string, search)}
      {...props}
    />
  );
}
