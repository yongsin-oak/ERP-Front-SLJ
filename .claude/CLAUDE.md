# ERP-Front-SLJ — Skill Guide

> มาตรฐานการเขียนโค้ดสำหรับโปรเจกต์นี้  
> หลักการหลัก: **Performance-first · Responsive · Type-safe · Minimal**

> **API Reference**: อ่าน `.claude/API.md` ก่อนทุกครั้งที่แก้ service/types — มี endpoint paths, required params, และ response shapes ครบ

---

## Stack

| Layer | Library | Version |
|---|---|---|
| UI Framework | React | 19 |
| Build | Vite | 7 |
| Language | TypeScript | 5.9 (strict) |
| UI Components | Ant Design | 6 |
| Styling | Emotion (`@emotion/styled`) | 11 |
| State | Zustand | 5 |
| Data Fetching | @tanstack/react-query | 5 |
| Routing | React Router | 7 |
| HTTP | Axios (with auto refresh) | 1.7 |
| Forms | react-hook-form + zod | 7 / 4 |
| Virtual List | @tanstack/react-virtual | 3 |
| Drag & Drop | @dnd-kit/core + sortable | 6 / 10 |
| Charts | recharts | 3 |
| Date | Day.js | 1.11 |
| Utility | Lodash | 4 |
| Excel/CSV | xlsx (SheetJS) | 0.20 |

---

## Directory Structure

```
src/
├── App.tsx                  # root — ConfigProvider + router + DevTools
├── main.tsx                 # entry point
├── index.css                # global CSS reset only
├── dev/                     # dev-only tools (tree-shaken in production)
│   └── DevTools.tsx
├── design-system/           # shared UI primitives
│   ├── components/          # Button, Table, Modal, Form, Input, Select ...
│   ├── tokens/              # colors, spacing
│   └── index.ts             # barrel export
├── lib/
│   ├── config/req.ts        # Axios instance (baseURL, withCredentials, refresh)
│   └── theme/               # Ant Design + Emotion theme tokens
├── layouts/
│   └── AppLayout.tsx        # sidebar + header shell
├── routes/
│   ├── index.tsx            # createBrowserRouter config
│   └── PrivateRoute.tsx     # auth guard
└── features/
    └── <feature>/           # 1 folder per domain
        ├── index.ts         # barrel — export only public API
        ├── pages/           # route-level components (lazy loaded)
        ├── components/      # feature-local UI
        ├── hooks/
        │   ├── queryKeys.ts # key factory — ห้าม hardcode string ใน useQuery
        │   ├── queries.ts   # useQuery hooks (reads)
        │   ├── mutations.ts # useMutation hooks (writes)
        │   └── index.ts     # barrel export
        ├── services/        # axios calls เท่านั้น — ไม่มี state
        └── types/           # interfaces, enums, constants
```

---

## Feature Module Rules

### ทุก feature ต้องมี `index.ts` barrel
```ts
// features/order/index.ts
export { OrderPage } from './pages/OrderPage';
export { useOrders, useCreateOrder, useUpdateOrder, useDeleteOrder, orderKeys } from './hooks';
export type { OrderParams } from './hooks';
export { orderService } from './services';
export type { Order, OrderStatus } from './types';
export { OrderStatusLabel, OrderStatusColor } from './types';
```

### Import ข้าม feature ให้ใช้ alias เท่านั้น
```ts
// ✅ ถูก
import { useAuth } from '@features/auth/hooks';

// ❌ ผิด
import { useAuth } from '../../features/auth/hooks';
```

### Path aliases
```
@assets        → src/assets
@design-system → src/design-system
@layouts       → src/layouts
@lib           → src/lib
@features      → src/features
@routes        → src/routes
@dev           → src/dev  (dev only)
```

---

## Component Pattern

### Functional components เท่านั้น — ไม่มี class
```tsx
// ✅ ถูก
export function OrderPage() {
  return <div>...</div>;
}

// ❌ ผิด — ไม่ใช้ default export ในหน้า/components ทั่วไป
export default function OrderPage() { ... }
```

### Props typing — inline interface เสมอ
```tsx
interface Props {
  orderId: string;
  onClose: () => void;
}

export function OrderDetailModal({ orderId, onClose }: Props) { ... }
```

### ไม่ใช้ `React.FC` — เขียน return type ตรงๆ แทน
```tsx
// ✅
function Badge({ count }: { count: number }) { ... }

// ❌
const Badge: React.FC<{ count: number }> = ({ count }) => { ... }
```

---

## State Management (Zustand)

### 1 store ต่อ 1 feature — วางไว้ใน `hooks/index.ts`
```ts
import { create } from 'zustand';

interface OrderStore {
  orders: Order[];
  isLoading: boolean;
  fetchOrders: () => Promise<void>;
}

export const useOrder = create<OrderStore>((set) => ({
  orders: [],
  isLoading: false,
  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const res = await orderService.list();
      set({ orders: res.data });
    } finally {
      set({ isLoading: false });
    }
  },
}));
```

### ใช้ selector เพื่อป้องกัน re-render ที่ไม่จำเป็น
```ts
// ✅ re-render เฉพาะเมื่อ orders เปลี่ยน
const orders = useOrder((s) => s.orders);

// ❌ re-render ทุกครั้งที่ store เปลี่ยน
const { orders, isLoading } = useOrder();
```

---

## HTTP / Services

### ทุก service call ต้องผ่าน `req` (Axios instance จาก `@lib`)
```ts
// features/order/services/index.ts
import { req } from '@lib';
import type { Order } from '../types';

export const orderService = {
  list: () => req.get<Order[]>('/orders'),
  create: (payload: CreateOrderDto) => req.post<Order>('/orders', payload),
  update: (id: string, payload: UpdateOrderDto) => req.patch<Order>(`/orders/${id}`, payload),
  remove: (id: string) => req.delete(`/orders/${id}`),
};
```

### Error handling — จัดการใน store ไม่ใช่ใน component
```ts
// ✅ store รับผิดชอบ error
fetchOrders: async () => {
  try { ... } catch (err) {
    set({ error: getErrorMessage(err) });
  }
}

// ❌ ไม่ try/catch ใน component
```

---

## Styling

### ใช้ Emotion `styled` สำหรับ layout/wrapper
```tsx
import styled from '@emotion/styled';

const PageWrapper = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
```

### ใช้ design tokens เสมอ — ไม่ hardcode สี/spacing
```ts
// ✅
import { colors, spacing } from '@design-system/tokens';
color: ${colors.primary[600]};
padding: ${spacing[4]};

// ❌
color: '#1677ff';
padding: '16px';
```

### Responsive — ใช้ Ant Design Grid หรือ CSS breakpoint ผ่าน Emotion
```tsx
// Ant Design Grid
<Row gutter={[16, 16]}>
  <Col xs={24} sm={12} lg={8}>...</Col>
</Row>

// Emotion breakpoint
const Card = styled.div`
  width: 100%;
  @media (min-width: 768px) { width: 50%; }
  @media (min-width: 1200px) { width: 33%; }
`;
```

---

## Performance Rules

### 1. Code splitting — ทุก page ต้อง lazy load
```tsx
// routes/index.tsx
import { lazy, Suspense } from 'react';
import { Spinner } from '@design-system';

const OrderPage = lazy(() => import('@features/order/pages/OrderPage').then(m => ({ default: m.OrderPage })));

{ path: 'order', element: <Suspense fallback={<Spinner fullPage />}><OrderPage /></Suspense> }
```

### 2. Memoization — ใช้เมื่อ expensive เท่านั้น
```tsx
// ✅ มี compute หนัก หรือ children เยอะ
const sortedOrders = useMemo(() => sortBy(orders, 'createdAt'), [orders]);
const handleSubmit = useCallback((values) => { ... }, [createOrder]);

// ❌ ไม่ memo ทุกอย่างโดยไม่มีเหตุผล — overhead มากกว่าประโยชน์
```

### 3. Table virtualization — ใช้ Ant Design Table `virtual` prop เมื่อ row > 100
```tsx
<Table virtual scroll={{ y: 500 }} dataSource={orders} columns={columns} />
```

### 4. Image optimization — ใช้ `loading="lazy"` และกำหนด dimensions เสมอ
```tsx
<img src={url} alt="" width={64} height={64} loading="lazy" />
```

### 5. Bundle chunks — แยก vendor/antd/utils ไว้แล้วใน vite.config.ts อย่าเพิ่ม dep ขนาดใหญ่โดยไม่ประเมิน

---

## React Query Pattern (CSR)

**Rule:** server state → React Query · UI state (modal open, selected item) → useState · global client state → Zustand

### 1. queryKeys.ts — Key Factory (หัวใจสำคัญที่สุด)
```ts
// features/order/hooks/queryKeys.ts
export interface OrderParams { page?: number; limit?: number; status?: string; }

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: OrderParams) => [...orderKeys.lists(), params] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
};
// ห้าม hardcode ['orders'] ใน useQuery/invalidateQueries โดยตรง — ใช้จากตรงนี้เสมอ
```

### 2. queries.ts — Reads
```ts
// features/order/hooks/queries.ts
export function useOrders(params: OrderParams = {}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => orderService.getAll(params).then((r) => r.data),
    placeholderData: (prev) => prev, // ไม่ flicker เมื่อเปลี่ยนหน้า
  });
}
// params เปลี่ยน → queryKey เปลี่ยน → fetch ใหม่อัตโนมัติ ไม่ต้องเรียก fetch() เอง
```

### 3. mutations.ts — Writes
```ts
// features/order/hooks/mutations.ts
export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderDto) => orderService.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.lists() }); // refetch list อัตโนมัติ
      message.success('สร้าง order สำเร็จ');
    },
    onError: () => message.error('สร้าง order ไม่สำเร็จ'),
  });
}

export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderDto }) =>
      orderService.update(id, data).then((r) => r.data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: orderKeys.lists() });
      qc.setQueryData(orderKeys.detail(updated.id), updated); // update cache ไม่ต้อง refetch
      message.success('แก้ไขสำเร็จ');
    },
  });
}
```

### 4. hooks/index.ts — Barrel
```ts
export { useOrders, useOrderDetail } from './queries';
export { useCreateOrder, useUpdateOrder, useDeleteOrder } from './mutations';
export { orderKeys } from './queryKeys';
export type { OrderParams } from './queryKeys';
```

### 5. Page — ก่อน vs หลัง
```tsx
// ❌ Before — boilerplate 40+ บรรทัด
const { orders, total, loading, fetch, create } = useOrder();
useEffect(() => { fetch(params); }, [fetch, page, status]);
const handleSubmit = async (v) => { await create(v); fetch(params); };

// ✅ After — ตรงไปตรงมา
const { data, isLoading, refetch } = useOrders({ page, limit, status });
const createOrder = useCreateOrder();                // invalidate อัตโนมัติ
await createOrder.mutateAsync(values);               // onSuccess → refetch
```

### invalidateQueries vs setQueryData
| เมื่อไหร่ | ใช้อะไร |
|---|---|
| list เปลี่ยน (create/delete) | `invalidateQueries({ queryKey: keys.lists() })` |
| รู้ข้อมูลใหม่แล้ว (update return data) | `setQueryData(keys.detail(id), updated)` + invalidate list |
| ต้อง refetch ทันที (manual) | `refetch()` จาก useQuery |

---

## Form Pattern (react-hook-form + zod)

```ts
// schema
import { z } from 'zod';
export const OrderSchema = z.object({
  customerId: z.string().min(1, 'กรุณาเลือกลูกค้า'),
  total: z.number().positive(),
});
export type OrderFormValues = z.infer<typeof OrderSchema>;
```

```tsx
// component
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OrderSchema, type OrderFormValues } from '../types';

const { register, handleSubmit, formState: { errors } } = useForm<OrderFormValues>({
  resolver: zodResolver(OrderSchema),
});
```

---

## Export / Import Pattern

ใช้ `useSheet` จาก `@lib/sheet` + `ExportButton` / `ImportModal` จาก `@design-system`

```tsx
// กำหนด columns 1 ครั้งต่อ feature — reuse ทั้ง export และ import
const SHEET_COLUMNS: SheetColumn<Order>[] = [
  { label: 'รหัสออเดอร์', key: 'orderId' },
  { label: 'ลูกค้า', key: 'customerName' },
  { label: 'ยอดรวม', key: 'total', format: (v) => Number(v) },
  { label: 'วันที่', key: 'createdAt', format: (v) => dayjs(v as string).format('DD/MM/YYYY') },
];

// Export
<ExportButton data={orders} columns={SHEET_COLUMNS} fileName="orders" />

// Import
<ImportModal
  open={importOpen}
  onClose={() => setImportOpen(false)}
  columns={SHEET_COLUMNS}
  onImport={async (rows) => {
    await bulkCreateOrders(rows);
  }}
/>
```

Import flow: อัพโหลดไฟล์ → เลือก mapping (auto-detect ถ้า header ตรงกัน) → preview → confirm

---

## Drag & Drop Pattern (@dnd-kit)

```tsx
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItem({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return <div ref={setNodeRef} style={style} {...attributes} {...listeners}>...</div>;
}
```

---

## Virtual List Pattern (@tanstack/react-virtual)

ใช้เมื่อ list มีมากกว่า 200 items — แทน Ant Design Table pagination

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

const parentRef = useRef<HTMLDivElement>(null);
const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 48,
  overscan: 5,
});
```

---

## Dev Tools

- **React Query Inspector** — ไอคอนมุมล่างซ้าย (เฉพาะ `VITE_ENV_MODE=development`)
- **DevTools Panel** (ปุ่มสีม่วงมุมล่างขวา):
  - Toggle bypass auth
  - Switch role (8 roles)
  - Log Auth Store → console
  - Env info

---

## Auth & Roles

### Role types
```ts
type Role = 'SuperAdmin' | 'Admin' | 'Operator' | 'Warehouse' | 'Accountant' | 'HR' | 'Marketing' | 'Sales';
```

### Guard component per role — วางใน `routes/` หรือ `layouts/`
```tsx
function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const user = useAuth((s) => s.user);
  if (!user || user.role !== role) return <Navigate to="/403" replace />;
  return <>{children}</>;
}
```

### Dev bypass — เมื่อ `VITE_ENV_MODE=development`
- `getMe()` inject `DEV_USER` (SuperAdmin) ทันที — ไม่เรียก `/me`
- ใช้ DevTools panel (มุมล่างขวา) เพื่อ switch role / toggle auth

---

## TypeScript Rules

- `strict: true` เสมอ — ห้าม disable
- ไม่ใช้ `any` — ใช้ `unknown` แล้ว narrow type แทน
- Interface สำหรับ object shapes, `type` สำหรับ union/alias
- Enum ใช้ string literal union แทน (`type Status = 'active' | 'inactive'`)
- Export type ด้วย `export type { Foo }` เสมอ

---

## File Naming

| สิ่ง | Convention | ตัวอย่าง |
|---|---|---|
| Component file | PascalCase | `OrderFormModal.tsx` |
| Hook/Store file | camelCase หรือ `index.ts` | `hooks/index.ts` |
| Service file | camelCase หรือ `index.ts` | `services/index.ts` |
| Type file | `index.ts` | `types/index.ts` |
| Barrel | `index.ts` | `features/order/index.ts` |
| CSS/Emotion | ใน `.tsx` file เดียวกัน | styled component ใน file เดียวกัน |

---

## Do / Don't

| Do ✅ | Don't ❌ |
|---|---|
| Named exports ทุกที่ | Default export (ยกเว้น `App.tsx`, `main.tsx`) |
| Type-safe API response | Cast ด้วย `as` |
| Selector pattern ใน Zustand | Destructure ทั้ง store |
| Lazy load ทุก page | Import page โดยตรงใน router |
| Ant Design components first | Reinvent UI ที่มีอยู่แล้วใน Antd |
| Design tokens สำหรับ color/spacing | Hardcode `#hex` หรือ `px` ตรงๆ |
| Error ใน store | try/catch ใน component |
| `dayjs` สำหรับ date | `new Date()` หรือ `moment` |
| `lodash` สำหรับ utility | ฟัง list manipulation เอง |
