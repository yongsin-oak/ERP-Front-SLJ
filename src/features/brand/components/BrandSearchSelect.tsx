import { useCallback, useMemo, useState } from 'react';
import { InfiniteSearchSelect, highlightText } from '@design-system';
import type { InfiniteSearchSelectProps } from '@design-system';
import { useBrandDropdown } from '../react-query';

type Props = Omit<InfiniteSearchSelectProps, 'options' | 'isLoading' | 'isFetchingNextPage' | 'hasNextPage' | 'onFetchNextPage' | 'onSearch'>;

export function BrandSearchSelect({ onOpenChange, ...props }: Props) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  /**
   * ยิง API เมื่อ "เปิด dropdown" หรือ "มีค่าที่เลือกไว้แล้ว" เท่านั้น
   *
   * เปิด → ต้องมีตัวเลือกให้ดู · มีค่าอยู่แล้ว → ต้องโหลดมาแปลง id เป็นชื่อให้โชว์บนปุ่ม
   * ไม่งั้นฟอร์มแก้ไขจะโชว์ placeholder แทนชื่อแบรนด์ที่เลือกไว้
   * กรณีที่เหลือ (ฟอร์มสร้างใหม่ที่ยังไม่แตะช่องนี้) = ไม่ยิงเลย
   */
  const enabled = open || (props.value != null && props.value !== '');

  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useBrandDropdown(search || undefined, { enabled });

  const options = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.data.map((b) => ({ value: b.id, label: b.name }))),
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
      notFoundText="ไม่พบแบรนด์"
      placeholder="ค้นหาแบรนด์..."
      optionRender={(opt) => highlightText(opt.label as string, search)}
      {...props}
      onOpenChange={handleOpenChange}
    />
  );
}
