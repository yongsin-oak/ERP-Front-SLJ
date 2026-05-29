# Skill: Constants & Magic Values

> Rules for eliminating hardcoded strings, numbers, and magic values across the codebase.

---

## Trigger

Use this skill when:
- A string or number appears more than once in the same feature
- A value has domain meaning (status, limit, role, route path)
- Tempted to write `'pending'`, `20`, `'/orders'` inline

---

## Rule: No Magic Values

Any value that appears more than once, or has a domain meaning, must be a named constant.

```ts
// ❌ magic values
if (order.status === 'pending') { ... }
const limit = 20;
req.get('/orders/export');

// ✅ named constants
if (order.status === ORDER_STATUS.PENDING) { ... }
const limit = PAGINATION.DEFAULT_LIMIT;
req.get(ORDER_ENDPOINTS.EXPORT);
```

---

## Where to Define Constants

| Type | Location | Export from |
|---|---|---|
| Domain constants (status, type enums) | `features/<feature>/types/index.ts` | feature barrel |
| Pagination / UI defaults | `features/<feature>/types/index.ts` | local or feature barrel |
| API endpoint paths | `features/<feature>/services/index.ts` (top of file) | not exported |
| App-wide limits | `src/lib/constants.ts` | `@lib` |
| Route paths | `src/routes/paths.ts` | `@routes` |

---

## Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Value constant | `SCREAMING_SNAKE_CASE` | `ORDER_STATUS`, `MAX_FILE_SIZE` |
| Label / display map | `PascalCase + Label` suffix | `OrderStatusLabel` |
| Color / style map | `PascalCase + Color` suffix | `OrderStatusColor` |
| Route path object | `PascalCase + Paths` suffix | `OrderPaths` |
| Endpoint map | `SCREAMING_SNAKE_CASE + _ENDPOINTS` | `ORDER_ENDPOINTS` |

---

## Status Constants — Pattern

```ts
// features/order/types/index.ts

// 1. type union (no enum — use string literal union)
export type OrderStatus = 'pending' | 'approved' | 'shipped' | 'cancelled';

// 2. value constant (avoids raw strings everywhere)
export const ORDER_STATUS = {
  PENDING:   'pending',
  APPROVED:  'approved',
  SHIPPED:   'shipped',
  CANCELLED: 'cancelled',
} as const;

// 3. display label map
export const OrderStatusLabel: Record<OrderStatus, string> = {
  pending:   'Pending',
  approved:  'Approved',
  shipped:   'Shipped',
  cancelled: 'Cancelled',
};

// 4. semantic color map (use design-system StatusType)
export const OrderStatusColor: Record<OrderStatus, StatusType> = {
  pending:   'warning',
  approved:  'success',
  shipped:   'info',
  cancelled: 'error',
};
```

Usage:
```tsx
import { ORDER_STATUS, OrderStatusLabel, OrderStatusColor } from '@features/order';
import { Tag } from '@design-system';

// compare
if (order.status === ORDER_STATUS.PENDING) { ... }

// render
<Tag status={OrderStatusColor[order.status]}>{OrderStatusLabel[order.status]}</Tag>
```

---

## Pagination Constants

```ts
// features/order/types/index.ts
export const ORDER_PAGINATION = {
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT:     100,
} as const;
```

```ts
// usage in query hook
export function useOrders(params: OrderParams = {}) {
  const { page = ORDER_PAGINATION.DEFAULT_PAGE, limit = ORDER_PAGINATION.DEFAULT_LIMIT } = params;
  return useQuery({ queryKey: orderKeys.list({ page, limit }), ... });
}
```

---

## API Endpoint Constants

Keep endpoint strings close to their service — do NOT export:

```ts
// features/order/services/index.ts
const ENDPOINTS = {
  BASE:   '/orders',
  EXPORT: '/orders/export',
  BULK:   '/orders/bulk',
} as const;

export const orderService = {
  list:   (p: OrderParams)  => req.get(ENDPOINTS.BASE, { params: p }),
  create: (body: CreateOrderDto) => req.post(ENDPOINTS.BASE, body),
  export: ()                => req.get(ENDPOINTS.EXPORT, { responseType: 'blob' }),
};
```

---

## Role Constants

```ts
// already defined in auth types — import from @features/auth
import { ROLES } from '@features/auth';

// never
if (user.role === 'SuperAdmin') { ... }
// ✅
if (user.role === ROLES.SUPER_ADMIN) { ... }
```

---

## File Size / Upload Constants

```ts
// src/lib/constants.ts
export const UPLOAD = {
  MAX_IMAGE_MB:    5,
  MAX_DOCUMENT_MB: 20,
  ACCEPTED_IMAGES: '.jpg,.jpeg,.png,.webp',
  ACCEPTED_DOCS:   '.pdf,.xlsx,.csv',
} as const;
```

---

## Quick Checklist

- [ ] Any `status` comparison uses a constant (`ORDER_STATUS.X`), not a string literal
- [ ] Any pagination number uses a pagination constant
- [ ] API paths are defined once at the top of `services/index.ts`
- [ ] Label/color maps exist so components don't have `switch` statements
- [ ] `as const` on every object constant for type narrowing
