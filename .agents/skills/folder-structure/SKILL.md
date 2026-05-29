# Skill: Feature Folder Structure

> Authoritative reference for how every feature module must be organized in this codebase.

---

## Trigger

Use this skill when:
- Creating a new feature
- Adding a page, hook, service, or type to an existing feature
- Unsure where a file belongs

---

## Canonical Feature Layout

```
src/features/<feature>/
├── index.ts              # public barrel — ONLY export what other features need
├── pages/
│   └── FeaturePage.tsx   # route-level component (lazy-loaded in router)
├── components/
│   └── FeatureFormModal.tsx
├── hooks/
│   ├── queryKeys.ts      # key factory — never hardcode in useQuery
│   ├── queries.ts        # useQuery hooks (reads only)
│   ├── mutations.ts      # useMutation hooks (writes only)
│   └── index.ts          # barrel for hooks
├── services/
│   └── index.ts          # axios calls only — no state, no hooks
└── types/
    └── index.ts          # interfaces, type aliases, constants, label maps
```

### When a feature grows large — split services/hooks into files

```
hooks/
├── queryKeys.ts
├── useFeatureList.ts     # one hook per concern
├── useFeatureDetail.ts
├── useCreateFeature.ts
├── useUpdateFeature.ts
└── index.ts

services/
├── featureService.ts     # CRUD
├── featureReportService.ts
└── index.ts
```

---

## File Naming Rules

| Artifact | Convention | Example |
|---|---|---|
| Page component | `PascalCase.tsx` | `OrderPage.tsx` |
| Feature component | `PascalCase.tsx` | `OrderFormModal.tsx` |
| Hook file | `camelCase.ts` or `index.ts` | `useOrders.ts` |
| Service file | `camelCase.ts` or `index.ts` | `orderService.ts` |
| Type / constant file | `index.ts` | `types/index.ts` |
| Barrel | always `index.ts` | `features/order/index.ts` |
| Styled component | same `.tsx` file as component | — |

---

## Barrel Rules

### Feature barrel (`features/<feature>/index.ts`)
Export ONLY what external features/routes need. Do NOT export internal implementation.

```ts
// features/order/index.ts
export { OrderPage } from './pages/OrderPage';
export { useOrders, useCreateOrder, useUpdateOrder, useDeleteOrder } from './hooks';
export { orderKeys } from './hooks';
export type { OrderParams } from './hooks';
export { orderService } from './services';
export type { Order, OrderStatus, OrderStatusLabel } from './types';
```

### Hooks barrel (`features/<feature>/hooks/index.ts`)
```ts
export { useOrders, useOrderDetail } from './queries';
export { useCreateOrder, useUpdateOrder, useDeleteOrder } from './mutations';
export { orderKeys } from './queryKeys';
export type { OrderParams } from './queryKeys';
```

---

## Path Aliases — Always Use These

```ts
// ✅ cross-feature import
import { useAuth } from '@features/auth';
import { Button, Table } from '@design-system';
import { req } from '@lib';

// ❌ relative paths across features
import { useAuth } from '../../auth/hooks';
```

| Alias | Maps to |
|---|---|
| `@features` | `src/features` |
| `@design-system` | `src/design-system` |
| `@lib` | `src/lib` |
| `@layouts` | `src/layouts` |
| `@routes` | `src/routes` |
| `@assets` | `src/assets` |
| `@dev` | `src/dev` (dev-only, tree-shaken) |

---

## Shared vs Feature-Local

| Put it in `src/` when... | Put it in `features/<x>/` when... |
|---|---|
| Used by ≥2 features | Used by only this feature |
| Pure utility (date, string, number) | Domain-specific logic |
| Generic UI component (Button, Table) | Domain-specific UI (OrderStatusTag) |

Shared location:
```
src/
├── design-system/components/   # generic UI primitives
├── lib/                        # axios, theme, sheet utilities
└── layouts/                    # app shell
```

---

## Route Registration

Every page must be lazy-loaded in `src/routes/index.tsx`:

```tsx
const OrderPage = lazy(() =>
  import('@features/order/pages/OrderPage').then(m => ({ default: m.OrderPage }))
);

{ path: 'order', element: <Suspense fallback={<Spinner fullPage />}><OrderPage /></Suspense> }
```

Never import page components directly (non-lazy) in the router.

---

## Checklist: New Feature

- [ ] Create `features/<name>/` with all 5 sub-folders
- [ ] `index.ts` barrel exports public API only
- [ ] `hooks/index.ts` barrel exports hooks + keys
- [ ] `types/index.ts` has all interfaces + constants
- [ ] `services/index.ts` uses `req` from `@lib` — no raw `axios`
- [ ] Page registered as lazy route in `routes/index.tsx`
- [ ] Cross-feature imports use `@features/` alias
