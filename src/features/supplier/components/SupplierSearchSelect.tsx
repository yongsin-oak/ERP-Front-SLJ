import { useCallback, useMemo, useState } from 'react';
import { InfiniteSearchSelect, highlightText } from '@design-system';
import type { InfiniteSearchSelectProps } from '@design-system';
import { useSupplierDropdown } from '../react-query';

type Props = Omit<
  InfiniteSearchSelectProps,
  'options' | 'isLoading' | 'isFetchingNextPage' | 'hasNextPage' | 'onFetchNextPage' | 'onSearch'
>;

export function SupplierSearchSelect({ onOpenChange, ...props }: Props) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  // ยิงเมื่อเปิด หรือมีค่าอยู่แล้ว (ต้องแปลง id เป็นชื่อ) — ดูเหตุผลเต็มใน BrandSearchSelect
  const enabled = open || (props.value != null && props.value !== '');

  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useSupplierDropdown(search || undefined, { enabled });

  const options = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.data.map((s) => ({ value: s.id, label: s.name }))),
    [data],
  );

  const handleOpenChange = useCallback(
    (o: boolean) => {
      setOpen(o);
      onOpenChange?.(o);
    },
    [onOpenChange],
  );

  return (
    <InfiniteSearchSelect
      options={options}
      isLoading={isFetching && !isFetchingNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={!!hasNextPage}
      onFetchNextPage={fetchNextPage}
      onSearch={setSearch}
      notFoundText="ไม่พบซัพพลายเออร์"
      placeholder="ค้นหาซัพพลายเออร์..."
      optionRender={(opt) => highlightText(opt.label as string, search)}
      {...props}
      onOpenChange={handleOpenChange}
    />
  );
}
