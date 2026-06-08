# Skill: Query Constants & Hook Structure

> Rules for stale time, refetch intervals, GC time, pagination, and consistent hook file layout.
> All constants live in `src/lib/constants.ts` and are re-exported from `@lib`.

---

## Trigger

Use this skill when:
- Writing any `useQuery` or `useMutation`
- Setting `staleTime`, `gcTime`, or `refetchInterval` on a query
- Creating a new feature's `hooks/` folder
- Seeing a magic number like `1000 * 60 * 5` in a hook file

---

## 1. Import Constants from `@lib`

```ts
import { STALE_TIME, GC_TIME, REFETCH_INTERVAL, PAGINATION } from '@lib';
```

Never write raw millisecond math in hooks. Use the named constants below.

---

## 2. STALE_TIME Reference

| Constant | Value | When to use |
| --- | --- | --- |
| `STALE_TIME.REALTIME` | 0ms | Dashboard panels — always refetch on mount |
| `STALE_TIME.SHORT` | 30s | **Operational data** — changes during every work shift |
| `STALE_TIME.MEDIUM` | 2min | Support data — changes occasionally during the day |
| `STALE_TIME.LONG` | 5min | Rarely-changed config data |
| `STALE_TIME.MASTER` | 10min | True reference/master data — edited a few times per month |
| `STALE_TIME.STATIC` | 30min | Near-immutable setup data — roles, terminals |

### Per-Feature Cache Classification

> This ERP processes orders and stock in real time. Most operational data must stay fresh. **Default to SHORT; only escalate with a reason.**

| Feature | Data | Correct STALE_TIME | Reason |
| --- | --- | --- | --- |
| `dashboard` | all panels | `REALTIME` + `refetchInterval` | Live ops summary |
| `order` | order list / detail | `SHORT` | Operators shoot orders constantly across terminals |
| `inventory` | stock levels | `SHORT` | Changes with every order pick and stock-in |
| `stock-entry` | entries list | `SHORT` | Purchasing adds entries throughout the day |
| `employee` | employee list | `MEDIUM` | HR changes are infrequent but possible mid-shift |
| `user` | user list | `MEDIUM` | User management done by admin |
| `supplier` | supplier list | `MEDIUM` | Updated occasionally by purchasing |
| `shop` | shop list | `MASTER` | Set up once; rarely edited |
| `brand` | brand list | `MASTER` | Reference data; changes rarely |
| `category` | category list | `MASTER` | Reference data; changes rarely |
| `role` | role list | `STATIC` | Permission setup; near-immutable |
| `terminal` | terminal list | `STATIC` | Hardware setup; near-immutable |

### What NOT to do

```ts
// ❌ LONG for orders — stale reads cause double-processing
useQuery({ ..., staleTime: STALE_TIME.LONG })  // in useOrders()

// ❌ MASTER for inventory — operator sees ghost stock already reserved
useQuery({ ..., staleTime: STALE_TIME.MASTER })  // in useInventory()

// ✅ SHORT for anything touched during a work shift
useQuery({ ..., staleTime: STALE_TIME.SHORT, placeholderData: (prev) => prev })
```

```ts
// ✅
export function useCategories(params: CategoryListParams) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoryService.getAll(params).then((r) => r.data),
    staleTime: STALE_TIME.MASTER,
    placeholderData: (prev) => prev,
  });
}

// ❌
staleTime: 1000 * 60 * 10
```

---

## 3. REFETCH_INTERVAL Reference

Only use `refetchInterval` on dashboard/live-feed queries. Do NOT add it to regular CRUD queries.

| Constant | Value | When to use |
| --- | --- | --- |
| `REFETCH_INTERVAL.REALTIME` | 30s | Recent orders live feed |
| `REFETCH_INTERVAL.SHORT` | 1min | Summary stats panel |
| `REFETCH_INTERVAL.MEDIUM` | 5min | Revenue charts |
| `REFETCH_INTERVAL.LONG` | 10min | Low-priority ambient refresh |

```ts
export function useRecentOrders(limit = 5) {
  return useQuery({
    queryKey: dashboardKeys.recentOrders(limit),
    queryFn: () => dashboardService.getRecentOrders(limit).then((r) => r.data.data),
    staleTime: STALE_TIME.REALTIME,
    refetchOnMount: 'always',
    refetchInterval: REFETCH_INTERVAL.REALTIME,
  });
}
```

---

## 4. GC_TIME Reference

`gcTime` controls how long **inactive** (unmounted) queries stay in memory.
You rarely need to override it — the global default (`GC_TIME.MEDIUM = 10min`) is set in `queryClient.ts`.

Override only for master/static data to keep it alive across navigation:

```ts
useQuery({
  queryKey: shopKeys.all_flat(),
  queryFn: () => shopService.getAll({ page: 1, limit: 100 }).then((r) => r.data.data),
  staleTime: STALE_TIME.MASTER,
  gcTime: GC_TIME.LONG,  // keep in cache even after leaving the shop page
})
```

---

## 5. PAGINATION Defaults

```ts
import { PAGINATION } from '@lib';

// Use in hook default params
export function useBrands(
  params: BrandListParams = {
    page: PAGINATION.DEFAULT_PAGE,
    limit: PAGINATION.MAX_LIMIT,
  },
) { ... }

// Use in query hooks
const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = params;
```

---

## 6. Hook File Structure — Required for Every Feature

Every feature MUST split hooks into 4 files. No monolithic `hooks/index.ts`.

```
features/<feature>/hooks/
├── queryKeys.ts    ← typed params interface + key factory
├── queries.ts      ← useQuery hooks (reads only)
├── mutations.ts    ← useMutation hooks (writes only)
└── index.ts        ← barrel re-exports only, no logic
```

### queryKeys.ts — key factory + typed params

```ts
// features/brand/hooks/queryKeys.ts
export interface BrandListParams {
  page: number;
  limit: number;
  search?: string;
}

export const brandKeys = {
  all: ['brands'] as const,
  lists: () => [...brandKeys.all, 'list'] as const,
  list: (params: BrandListParams) => [...brandKeys.lists(), params] as const,
  detail: (id: string) => [...brandKeys.all, 'detail', id] as const,
};
```

Rules:
- `params` must be a **typed interface**, never `object`
- Key hierarchy: `all` → `lists()` → `list(params)` — invalidating `lists()` busts all `list(params)` caches
- Export both the key factory and the params interface

### queries.ts — reads

```ts
import { useQuery } from '@tanstack/react-query';
import { STALE_TIME, PAGINATION } from '@lib';
import { brandService } from '../services';
import { brandKeys } from './queryKeys';
import type { BrandListParams } from './queryKeys';

export function useBrands(
  params: BrandListParams = { page: PAGINATION.DEFAULT_PAGE, limit: PAGINATION.MAX_LIMIT },
) {
  return useQuery({
    queryKey: brandKeys.list(params),
    queryFn: () => brandService.getAll(params).then((r) => r.data),
    staleTime: STALE_TIME.MASTER,
    placeholderData: (prev) => prev,
  });
}
```

### mutations.ts — writes

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { handleError } from '@lib';
import { brandService } from '../services';
import { brandKeys } from './queryKeys';
import type { CreateBrandDto, UpdateBrandDto } from '../types';

export function useCreateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBrandDto) => brandService.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: brandKeys.all });
      message.success('Brand created');
    },
    onError: handleError('Create brand'),
  });
}
```

### index.ts — barrel only

```ts
export { useBrands } from './queries';
export { useCreateBrand, useUpdateBrand, useDeleteBrand, useBulkDeleteBrand } from './mutations';
export { brandKeys } from './queryKeys';
export type { BrandListParams } from './queryKeys';
```

No logic, no imports from `@tanstack/react-query` — just re-exports.

---

## 7. Quick Decision: Which staleTime?

```
Is this a live dashboard widget?
  YES → STALE_TIME.REALTIME + refetchInterval
  NO → Is it master/reference data (brands, categories, shops, roles)?
        YES → STALE_TIME.MASTER or STALE_TIME.STATIC
        NO → Is it a paginated list that changes regularly?
              YES → STALE_TIME.MEDIUM (default, can omit)
              NO → STALE_TIME.LONG
```

---

## 8. Common Mistakes

```ts
// ❌ magic number
staleTime: 1000 * 60 * 10

// ✅
staleTime: STALE_TIME.MASTER

// ❌ refetchInterval on a CRUD list query
export function useOrders(params: OrderParams) {
  return useQuery({ ..., refetchInterval: 30000 })  // unnecessary polling
}

// ❌ params typed as `object` — loses type safety
list: (params: object) => [...keys.lists(), params] as const

// ✅ typed interface
list: (params: OrderParams) => [...keys.lists(), params] as const

// ❌ monolithic hooks/index.ts with logic
// all queryKeys + useQuery + useMutation in one file

// ✅ split into queryKeys.ts / queries.ts / mutations.ts / index.ts
```
