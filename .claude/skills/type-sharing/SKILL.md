# Skill: Type Declaration & Sharing

> One type, one home. Never define the same shape twice — find it, import it, reuse it.

---

## Trigger

Use this skill when:
- Adding a new interface or type alias anywhere in the codebase
- A type is needed in more than one file
- A service, hook, or component receives a prop that looks like an existing type
- Tempted to re-declare an interface that might already exist

---

## Decision Tree — Where Does This Type Live?

```
Is this type used by only one feature?
├── YES → features/<feature>/types/index.ts
│
└── NO — used by 2+ features, or it's a generic API shape?
    ├── Generic API envelope (Paginated, ApiData, Pagination) → src/lib/apiTypes.ts
    ├── Global UI type (StatusType, SizeType) → src/design-system/types.ts
    └── Shared domain type (role, platform, currency) → src/lib/types.ts
```

---

## Rule 1 — Single Source of Truth per Type

A type must be declared **exactly once**. If two files need the same shape, one imports from the other — not both declare it.

```ts
// ❌ duplicated in service AND hook
// features/shop/services/index.ts
interface ShopListParams { page: number; limit: number; platform?: Platform }

// features/shop/hooks/queryKeys.ts
interface ShopListParams { page: number; limit: number; platform?: Platform }

// ✅ one definition, one import
// features/shop/hooks/queryKeys.ts  ← canonical home
export interface ShopListParams { page: number; limit: number; platform?: Platform }

// features/shop/services/index.ts
import type { ShopListParams } from '../hooks/queryKeys';
```

> **Canonical home for list params:** `hooks/queryKeys.ts` in the same feature. Services always import from there — not the other way around.

---

## Rule 2 — Feature Types Belong in `types/index.ts`

Every domain interface, type union, and enum-replacement constant for a feature lives in `features/<feature>/types/index.ts` and is exported from the feature barrel.

```ts
// features/order/types/index.ts
export interface Order { ... }
export type OrderStatus = 'pending' | 'approved' | 'cancelled';
export const ORDER_STATUS = { ... } as const;

// features/order/index.ts
export type { Order, OrderStatus } from './types';
export { ORDER_STATUS } from './types';
```

Never scatter types across service files, component files, or hook files. Those files **import** types; they do not **own** them.

---

## Rule 3 — Cross-Feature Types Use the Feature Barrel

When Feature B needs a type from Feature A, import via the feature barrel — never via an internal path.

```ts
// ✅ cross-feature import via barrel
import type { Product } from '@features/inventory';
import type { Employee } from '@features/employee';

// ❌ reaching into internals
import type { Product } from '@features/inventory/types';
import type { Employee } from '../../employee/types/index';
```

If the type is not yet exported from the barrel (`features/<feature>/index.ts`), add it there first.

---

## Rule 4 — Shared Param Interfaces (List / Filter Params)

Query-param interfaces that a service *and* a hook both need follow this pattern:

| File | Role |
|---|---|
| `hooks/queryKeys.ts` | **Declares** the params interface (canonical) |
| `services/index.ts` | **Imports** it from `../hooks/queryKeys` |
| `hooks/queries.ts` | **Imports** it from `./queryKeys` |

```ts
// hooks/queryKeys.ts
export interface EmployeeParams {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
}

// services/index.ts
import type { EmployeeParams } from '../hooks/queryKeys';
export const employeeService = {
  getAll: (params: EmployeeParams) => req.get<Paginated<Employee>>(BASE, { params }),
};

// hooks/queries.ts
import type { EmployeeParams } from './queryKeys';
export function useEmployees(params: EmployeeParams) { ... }
```

---

## Rule 5 — Generic API Types Live in `@lib/apiTypes`

Shapes that wrap every endpoint response are defined once in `src/lib/apiTypes.ts` and imported everywhere via `@lib`.

```ts
// src/lib/apiTypes.ts
export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}
export interface ApiData<T> { data: T }
export interface Pagination {
  page: number; limit: number; total: number;
  totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean;
}

// usage in any service
import type { Paginated, ApiData } from '@lib/apiTypes';

getAll: (params: ProductParams) => req.get<Paginated<Product>>(BASE, { params }),
getOne: (id: string)           => req.get<ApiData<Product>>(`${BASE}/${id}`),
```

Never define local `PaginatedResponse`, `ListResponse`, or `ApiResponse` wrappers — use `Paginated<T>` and `ApiData<T>`.

---

## Rule 6 — Lite / Projection Types Stay in the Owning Feature

When an endpoint returns a reduced shape (dropdown-search, autocomplete, summary), declare the lite type **alongside the full type** in the same `types/index.ts` — not in the hook or component.

```ts
// features/inventory/types/index.ts
export interface Product { barcode: string; name: string; sellPrice: PriceSet; costPrice: PriceSet; ... }

/** Lite shape returned by GET /product/dropdown-search */
export interface ProductDropdown {
  barcode: string;
  name: string;
  remaining: number;
  sellPrice?: PriceSet;
}
```

```ts
// features/order/components/OrderItemsEditor.tsx
import type { ProductDropdown } from '@features/inventory';
```

---

## Rule 7 — DTO Types (Create / Update Payloads)

Request body types (DTOs) follow the same rule — one definition in `types/index.ts`, imported by the service and any form that uses them.

```ts
// features/order/types/index.ts
export interface CreateOrderDto {
  shopId: string;
  employeeId: string;
  items: OrderItemDto[];
}

// features/order/services/index.ts
import type { CreateOrderDto } from '../types';
create: (body: CreateOrderDto) => req.post<ApiData<Order>>(BASE, body),

// features/order/components/OrderFormModal.tsx
import type { CreateOrderDto } from '@features/order';
```

---

## Recommended Generic Types

Only use a generic type when it has a **self-describing name** and **saves meaningful intent** — not just a few characters. If the expansion is equally clear, write it out.

---

### Project generics (live in `@lib/apiTypes`)

| Type | Definition | When to use |
|---|---|---|
| `Paginated<T>` | `{ data: T[]; pagination: Pagination }` | Every list endpoint response |
| `ApiData<T>` | `{ data: T }` | Every single-item endpoint response |
| `PageParams` | `{ page: number; limit: number }` | Base for any list query params interface |
| `UpdateDto<T, K>` | `Partial<Omit<T, K>>` | Derive an update DTO from a create DTO |

#### `PageParams` — extend, don't repeat

```ts
// ❌ repeating page/limit in every feature
export interface EmployeeParams {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
}

// ✅ extend the shared base
import type { PageParams } from '@lib/apiTypes';

export interface EmployeeParams extends PageParams {
  search?: string;
  isActive?: boolean;
}
```

#### `UpdateDto<T, K>` — derive update DTOs from create DTOs

```ts
import type { UpdateDto } from '@lib/apiTypes';

// simple case — all fields become optional
export type UpdateBrandDto = UpdateDto<CreateBrandDto>;

// with immutable fields stripped — 'barcode' cannot be changed after creation
export type UpdateProductDto = UpdateDto<CreateProductDto, 'barcode'>;

// multiple immutable fields
export type UpdateOrderDto = UpdateDto<CreateOrderDto, 'recordBy' | 'shopId'>;
```

> ⚠️ Only use `UpdateDto` when the update shape really is "all fields optional, minus a few". If the update shape diverges significantly from the create shape, write it out explicitly.

---

### TypeScript built-ins — use these freely

These are standard TS utility types — readers always recognise them. No import needed.

| Type | Use case | Example |
|---|---|---|
| `Partial<T>` | All fields optional — for update DTOs, patch bodies | `Partial<CreateBrandDto>` |
| `Required<T>` | All fields mandatory — rarely needed | `Required<ProductDropdownSearchParams>` |
| `Pick<T, K>` | Keep only listed fields | `Pick<Product, 'barcode' \| 'name'>` |
| `Omit<T, K>` | Remove listed fields | `Omit<CreateOrderDto, 'recordBy'>` |
| `Record<K, V>` | Key-value map with known keys | `Record<OrderStatus, string>` |
| `ReturnType<F>` | Extract return type of a function | `ReturnType<typeof inventoryService.getAll>` |
| `Parameters<F>` | Extract param tuple of a function | `Parameters<typeof useOrders>[0]` |
| `NonNullable<T>` | Strip `null \| undefined` | `NonNullable<string \| null>` |

---

### When NOT to create a generic type

A generic adds cognitive load — a reader must unwrap its definition before understanding the code. Only add one when the gain outweighs that cost.

```ts
// ❌ generic that says nothing the expansion doesn't already say
type Nullable<T> = T | null;
// caller: location: Nullable<string>
// ← no clearer than: location: string | null

// ❌ generic with >2 type params — confusing at call site
type ApiResponse<T, E, M> = { data: T; error: E; meta: M };

// ❌ generic that wraps a single built-in with a new name
type MaybeArray<T> = T | T[];         // just write T | T[]
type ValueOf<T> = T[keyof T];        // use T[keyof T] directly

// ❌ generic to avoid repeating two fields — not worth it
type WithTimestamps<T> = T & { createdAt: string; updatedAt: string };
// ← just add the two fields; generics compound in hooks/components and become unreadable

// ✅ acceptable — self-describing, used 7+ times, intent is clear
type UpdateDto<T, K extends keyof T = never> = Partial<Omit<T, K>>;
```

**Rule of thumb:** if you must read the generic's definition to understand the call site, the generic isn't helping.

---

### Threshold for creating a new project generic

Before adding a new generic to `@lib/apiTypes.ts`:

| Check | Requirement |
|---|---|
| Frequency | Used ≥ 3 times across different features |
| Name test | A reader can understand the call site without reading the definition |
| Param count | ≤ 2 type parameters |
| Beats inline | The generic name expresses intent better than the expansion |

If any check fails, write the expansion inline.

---

## Anti-Patterns

```ts
// ❌ type declared inside a hook
export function useOrders() {
  interface OrderFilters { page: number; search?: string }  // ← buried, can't reuse
  ...
}

// ❌ type declared inside a component
function OrderTable({ items }: { items: { id: string; name: string }[] }) { ... }
// ← anonymous shape, can't import in tests or other components

// ❌ re-exporting a type under a new name
export type ProductItem = Product;  // ← aliasing for no reason, creates confusion

// ❌ casting to work around a missing property
const p = result as Product;  // ← hides that result may not actually be Product

// ❌ type defined in service AND hook (two sources of truth)
// services/index.ts:  interface ShopListParams { ... }
// hooks/queryKeys.ts: interface ShopListParams { ... }  ← duplicate
```

---

## Checklist Before Adding a New Type

- [ ] Search the codebase first — does this type (or something 90% identical) already exist?
- [ ] If found elsewhere, import it rather than redeclaring
- [ ] If it's new, place it in the right home (see Decision Tree)
- [ ] Export it from the barrel if other features will need it
- [ ] Remove any inline / anonymous shapes that duplicate it
- [ ] `as const` on object constants; no `enum` — use string literal unions
