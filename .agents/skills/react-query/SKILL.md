# Skill: React Query Patterns

> How to implement data fetching in this codebase using @tanstack/react-query v5.
> Files live at `features/<feature>/hooks/`.

---

## Trigger

Use this skill when:
- Implementing any server data fetch
- Adding a create/update/delete operation
- Wiring a list with filters/pagination
- Deciding where to put state (server vs UI vs global)

---

## State Decision Tree

```
Is the data fetched from the server?
  YES → React Query (useQuery / useMutation)
  NO → Is it shared across multiple components?
        YES → Zustand store
        NO  → useState in the component
```

Never mix: don't put server data in Zustand, don't use useEffect to fetch.

---

## File Layout (per feature)

```
hooks/
├── queryKeys.ts    ← key factory (single source of truth)
├── queries.ts      ← useQuery hooks (reads)
├── mutations.ts    ← useMutation hooks (writes)
└── index.ts        ← barrel export
```

---

## 1. queryKeys.ts — Key Factory

The most important file. All cache keys derive from here. Never hardcode `['orders']` directly in `useQuery` or `invalidateQueries`.

```ts
// features/order/hooks/queryKeys.ts
export interface OrderParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: OrderParams) => [...orderKeys.lists(), params] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
};
```

Rule: `all` → `lists()` → `list(params)` forms a hierarchy.
Invalidating `lists()` also busts all `list(params)` caches.

---

## 2. queries.ts — Read Hooks

```ts
// features/order/hooks/queries.ts
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services';
import { orderKeys, type OrderParams } from './queryKeys';

export function useOrders(params: OrderParams = {}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => orderService.list(params).then((r) => r.data),
    placeholderData: (prev) => prev,   // no flicker on page/filter change
  });
}

export function useOrderDetail(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => orderService.getById(id).then((r) => r.data),
    enabled: !!id,                     // skip fetch when id is empty
  });
}
```

Key rules:
- `placeholderData: (prev) => prev` — prevents table blinking when changing filters/page
- `enabled: !!id` — gates fetch on required param existence
- Never call `useQuery` with a hardcoded string key

---

## 3. mutations.ts — Write Hooks

```ts
// features/order/hooks/mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { orderService } from '../services';
import { orderKeys } from './queryKeys';
import type { CreateOrderDto, UpdateOrderDto } from '../types';

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderDto) =>
      orderService.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.lists() });
      message.success('Created successfully');
    },
    onError: () => message.error('Failed to create'),
  });
}

export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderDto }) =>
      orderService.update(id, data).then((r) => r.data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: orderKeys.lists() });
      qc.setQueryData(orderKeys.detail(updated.id), updated);  // instant update
      message.success('Updated successfully');
    },
    onError: () => message.error('Failed to update'),
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => orderService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.lists() });
      message.success('Deleted successfully');
    },
    onError: () => message.error('Failed to delete'),
  });
}
```

---

## 4. hooks/index.ts — Barrel

```ts
export { useOrders, useOrderDetail } from './queries';
export { useCreateOrder, useUpdateOrder, useDeleteOrder } from './mutations';
export { orderKeys } from './queryKeys';
export type { OrderParams } from './queryKeys';
```

---

## 5. Usage in Pages

```tsx
// features/order/pages/OrderPage.tsx
import { useState } from 'react';
import { useOrders, useCreateOrder, useDeleteOrder } from '../hooks';

export function OrderPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>();

  const { data, isLoading } = useOrders({ page, limit: 20, status });
  const createOrder = useCreateOrder();
  const deleteOrder = useDeleteOrder();

  const handleCreate = async (values: CreateOrderDto) => {
    await createOrder.mutateAsync(values);  // onSuccess → auto-invalidate
    closeModal();
  };

  const handleDelete = (id: string) => {
    deleteOrder.mutate(id);
  };

  return (
    <Table
      dataSource={data?.items}
      loading={isLoading}
      pagination={{ current: page, onChange: setPage, total: data?.total }}
    />
  );
}
```

Never use `useEffect` to trigger a fetch. Changing `params` → changes `queryKey` → auto-refetch.

---

## invalidateQueries vs setQueryData

| Scenario | Method |
|---|---|
| Create or delete (list changes) | `invalidateQueries({ queryKey: keys.lists() })` |
| Update with full response body | `setQueryData(keys.detail(id), updated)` + invalidate list |
| Force refresh (manual trigger) | `refetch()` from `useQuery` return |

```ts
// update — both list and detail updated optimally
onSuccess: (updated) => {
  qc.invalidateQueries({ queryKey: orderKeys.lists() });
  qc.setQueryData(orderKeys.detail(updated.id), updated);
}
```

---

## Pagination Pattern

```ts
// queryKeys include page so different pages are cached independently
queryKey: orderKeys.list({ page, limit, status })

// API response shape (matches backend)
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
```

```tsx
// AntD Table pagination
<Table
  dataSource={data?.items}
  pagination={{
    current: page,
    pageSize: limit,
    total: data?.total,
    showSizeChanger: false,
    onChange: setPage,
  }}
/>
```

---

## Common Mistakes

```ts
// ❌ hardcoded key
useQuery({ queryKey: ['orders'], queryFn: ... })

// ❌ useEffect to fetch
useEffect(() => { fetch(params) }, [params])

// ❌ server data in Zustand
const useOrderStore = create(() => ({ orders: [], fetch: async () => {...} }))

// ❌ not using placeholderData (causes flicker)
useQuery({ queryKey: orderKeys.list(params), queryFn: ... })
// ✅
useQuery({ ..., placeholderData: (prev) => prev })
```
