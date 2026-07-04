import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { InfiniteSearchSelect } from './index';
import type { InfiniteSearchOption } from './index';
import { AppIcons } from '../../icons';

const PRODUCT_FAMILIES = [
  'กล่องไปรษณีย์ เบอร์',
  'ซองกันกระแทก ขนาด',
  'เทปกาวใส ม้วน',
  'ถุงไปรษณีย์พลาสติก แบบ',
  'ฟิล์มยืดพันพาเลท รุ่น',
];

const ALL_PRODUCTS: InfiniteSearchOption[] = Array.from({ length: 50 }, (_, i) => ({
  value: `SKU-${String(i + 1).padStart(3, '0')}`,
  label: `${PRODUCT_FAMILIES[i % PRODUCT_FAMILIES.length]} ${i + 1}`,
}));

const PAGE_SIZE = 10;
const FETCH_DELAY_MS = 600;

/** จำลอง useInfiniteQuery: ค้นหา + ตัดหน้า ละ 10 รายการ พร้อมหน่วงโหลด */
function usePagedProducts() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const filtered = ALL_PRODUCTS.filter((p) => p.label.includes(query.trim()));
  const options = filtered.slice(0, page * PAGE_SIZE);
  const hasNextPage = options.length < filtered.length;

  const onSearch = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const onFetchNextPage = () => {
    if (isFetchingNextPage) return;
    setIsFetchingNextPage(true);
    setTimeout(() => {
      setPage((p) => p + 1);
      setIsFetchingNextPage(false);
    }, FETCH_DELAY_MS);
  };

  return { options, isLoading: false, isFetchingNextPage, hasNextPage, onSearch, onFetchNextPage };
}

const meta = {
  title: 'Design System/InfiniteSearchSelect',
  component: InfiniteSearchSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Select แบบค้นหา + โหลดเพิ่มเมื่อเลื่อนใกล้ท้ายรายการ (infinite scroll) — ออกแบบมาต่อกับ useInfiniteQuery ตัวอย่างนี้จำลองข้อมูลสินค้า 50 รายการ ตัดหน้าละ 10',
      },
    },
  },
  args: {
    options: [],
    isLoading: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    onFetchNextPage: () => {},
    onSearch: () => {},
  },
} satisfies Meta<typeof InfiniteSearchSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

const PagedDemo = () => {
  const paged = usePagedProducts();
  const [selected, setSelected] = useState<string | undefined>(undefined);
  return (
    <div className="flex max-w-80 flex-col gap-2">
      <InfiniteSearchSelect
        {...paged}
        value={selected}
        onChange={setSelected}
        placeholder="ค้นหาสินค้า…"
        allowClear
      />
      <span className="text-sm text-muted-foreground">
        {selected ? `รหัสที่เลือก: ${selected}` : 'ยังไม่เลือกสินค้า'}
      </span>
      <span className="text-xs text-foreground-subtle">
        เลื่อนลงท้ายรายการเพื่อโหลดหน้าถัดไป (ทั้งหมด {ALL_PRODUCTS.length} รายการ หน้าละ {PAGE_SIZE})
      </span>
    </div>
  );
};

export const Default: Story = {
  render: () => <PagedDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'ตัวอย่างทำงานจริง: พิมพ์ค้นหา (debounce 300ms) แล้วเลื่อนลงท้าย dropdown เพื่อโหลดหน้าถัดไป — spinner ที่ท้ายรายการมาจาก isFetchingNextPage',
      },
    },
  },
};

export const Loading: Story = {
  args: { isLoading: true, placeholder: 'กำลังโหลดรายการสินค้า…' },
};

export const Empty: Story = {
  args: { notFoundText: 'ไม่พบสินค้าในคลัง ลองค้นหาคำอื่น', placeholder: 'ค้นหาสินค้า…' },
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: 'เลือกสินค้า' },
};

const OrderLineDemo = () => {
  const paged = usePagedProducts();
  const [items, setItems] = useState<InfiniteSearchOption[]>([]);
  const [value, setValue] = useState('');

  const handleChange = (v: string | undefined) => {
    if (!v) {
      setValue('');
      return;
    }
    const item = ALL_PRODUCTS.find((p) => p.value === v);
    if (item && !items.some((it) => it.value === item.value)) {
      setItems((prev) => [...prev, item]);
    }
    setValue('');
  };

  return (
    <div className="max-w-md rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-1 text-base font-semibold text-foreground">เพิ่มสินค้าลงออเดอร์ Shopee</h3>
      <p className="mb-4 text-[13px] text-muted-foreground">
        ออเดอร์ #SP-260704-1182 — เลือกสินค้าจากคลังเพื่อเพิ่มลงรายการ
      </p>
      <InfiniteSearchSelect
        {...paged}
        value={value}
        onChange={handleChange}
        placeholder="ค้นหาสินค้าเพื่อเพิ่มลงออเดอร์…"
      />
      <div className="mt-4 border-t border-divider pt-3">
        <div className="mb-1.5 text-xs text-muted-foreground">
          รายการในออเดอร์ ({items.length})
        </div>
        {items.length === 0 ? (
          <span className="text-sm text-foreground-subtle">ยังไม่มีสินค้าในออเดอร์</span>
        ) : (
          <ul className="flex flex-col gap-1.5 text-sm">
            {items.map((item) => (
              <li key={item.value} className="flex items-center justify-between gap-2">
                <span className="truncate">
                  <span className="mr-1.5 font-mono text-xs text-muted-foreground">
                    {item.value}
                  </span>
                  {item.label}
                </span>
                <button
                  type="button"
                  aria-label={`ลบ ${item.label}`}
                  onClick={() =>
                    setItems((prev) => prev.filter((it) => it.value !== item.value))
                  }
                  className="shrink-0 text-foreground-subtle transition-colors hover:text-error-text"
                >
                  <AppIcons.delete className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export const OrderLineExample: Story = {
  render: () => <OrderLineDemo />,
};
