# Skill: Folder Structure

> Authoritative reference for how the codebase is organized — top-level src/ and feature internals.

---

## Trigger

Use this skill when:
- Creating a new feature or adding files to an existing one
- Unsure where a file belongs
- Adding a shared utility, hook, or config value

---

## Top-Level `src/` Layout

```
src/
├── app/                   # Bootstrap — wires everything together
│   ├── App.tsx            # Root component (default export)
│   ├── providers/         # QueryProvider, ThemeProvider
│   └── router/            # createBrowserRouter, PrivateRoute, RoleGuard
│
├── config/                # Runtime configuration (env, feature flags, api settings)
│   ├── env.ts             # ENV vars + IS_DEV flag
│   ├── app.config.ts      # APP_CONFIG (name, version)
│   ├── api.config.ts      # API_CONFIG (baseURL, timeout)
│   ├── auth.config.ts     # AUTH_CONFIG (bypass, session config)
│   ├── featureFlags.config.ts
│   └── index.ts           # barrel
│
├── design-system/         # UI foundation
│   ├── antd/
│   │   ├── tokens.ts      # Ant Design global token overrides
│   │   ├── components.ts  # Ant Design per-component overrides
│   │   └── theme.ts       # lightAntdTheme = { token, components }
│   ├── tokens/            # Our design tokens (colors, spacing, shadow, radius)
│   ├── components/        # Generic UI components (Button, Table, FormModal…)
│   └── index.ts           # public barrel
│
├── shared/                # Reusable code used by ≥2 features
│   ├── api/
│   │   ├── axiosInstance.ts   # req — axios instance + refresh interceptor
│   │   ├── queryClient.ts     # React Query client + global error handling
│   │   ├── error.ts           # getErrorMessage, handleError, showError
│   │   └── index.ts
│   ├── hooks/             # Shared React hooks (useDebounce, useLocalStorage, useDraftState…)
│   ├── utils/
│   │   └── sheet/         # useSheet — xlsx export/import utility
│   ├── constants/         # STALE_TIME, GC_TIME, REFETCH_INTERVAL, PAGINATION, UPLOAD
│   ├── types/             # Shared API types: Paginated, ApiData, PageParams, UpdateDto
│   └── index.ts           # barrel — everything importable via @shared
│
├── features/              # Business domain modules
├── layouts/               # AppLayout (nav shell, route outlet)
├── dev/                   # DevTools panel (dev-only, tree-shaken in prod)
├── main.tsx               # entry point
└── index.css              # global reset
```

### Layer responsibilities (one-sentence rule each)

| Layer | Rule |
|---|---|
| `app/` | Boots React, wires providers + router — no business logic |
| `config/` | Reads env vars and exposes typed constants — never imports from features |
| `design-system/` | Generic UI components + tokens — no feature awareness |
| `shared/` | Reusable utilities — no feature awareness, no Zustand |
| `features/` | All business logic — the only layer that can import from every other layer |
| `layouts/` | App shell (nav, sidebar) — imports from design-system + features/auth |

---

## Path Aliases

```ts
@app           → src/app
@config        → src/config          (and @config/* → src/config/*)
@design-system → src/design-system   (and @design-system/* → src/design-system/*)
@shared        → src/shared          (and @shared/* → src/shared/*)
@features      → src/features        (and @features/* → src/features/*)
@layouts       → src/layouts
@assets        → src/assets
@dev           → src/dev             (dev-only)
```

**Cross-feature imports always use the top-level barrel:**
```ts
// ✅
import { useEmployees } from '@features/employee';
import { req } from '@shared';
import { IS_DEV } from '@config/env';

// ❌ deep subfolder imports across features or shared
import { useEmployees } from '@features/employee/react-query';
import { req } from '@shared/api/axiosInstance';
```

---

## Feature Anatomy

```
src/features/<feature>/
├── index.ts              # public barrel — export ONLY what other features need
├── pages/                # route-level components (lazy-loaded in router)
├── components/           # feature-local UI
├── react-query/          # ALL data-fetching logic + HTTP layer
│   ├── queryKeys.ts      # key factory
│   ├── queries.ts        # useQuery hooks
│   ├── mutations.ts      # useMutation hooks (omit if feature is read-only)
│   ├── services.ts       # axios calls via req from @shared
│   └── index.ts          # barrel — exports hooks, keys, service
├── stores/               # Zustand stores (omit if feature has no UI state)
│   └── index.ts
├── types/                # interfaces, type aliases, status constants
│   └── index.ts
└── hooks/                # custom non-data-fetching hooks (omit if none needed)
    └── index.ts
```

### Folder rules

| Folder | What goes here | Tech |
|---|---|---|
| `react-query/` | Server state — queries, mutations, HTTP calls | React Query + axios |
| `stores/` | Client UI state — modal open, selection, wizard step | Zustand |
| `hooks/` | Custom hooks not related to data fetching | `useState`, `useRef`, etc. |
| `types/` | Domain types, status enums, label/color maps | TypeScript |

**Never mix concerns:**
```ts
// ✅ react-query/queries.ts — data fetching via service
export function useBrands(params: BrandListParams) {
  return useQuery({ queryKey: brandKeys.list(params), queryFn: () => brandService.getAll(params) });
}

// ✅ react-query/services.ts — HTTP only
export const brandService = {
  getAll: (params) => req.get<Paginated<Brand>>('/brand', { params }),
};

// ✅ stores/useBrandStore.ts — UI state only
export const useBrandStore = create<BrandStore>((set) => ({
  selectedIds: [],
  toggleSelect: (id) => set(s => ({ ... })),
}));

// ❌ Zustand in react-query/ or services in stores/
```

### react-query/services.ts — import rules

```ts
// ✅ correct imports inside services.ts
import { req } from '@shared';                          // HTTP client
import type { Paginated, ApiData } from '@shared/types'; // shared response types
import type { Brand, CreateBrandDto } from '../types';   // feature-local types
import type { BrandListParams } from './queryKeys';      // params from queryKeys (same folder)

// ❌ never import from node_modules/axios directly
// ❌ never import from feature barrel (circular)
```

### Feature barrel (`index.ts`) pattern

Export ONLY what consumers outside the feature need:
```ts
// features/brand/index.ts
export { BrandPage } from './pages/BrandPage';
export { useBrands, useCreateBrand, useUpdateBrand, useDeleteBrand, useBulkDeleteBrand, brandKeys } from './react-query';
export { brandService } from './react-query';
export type { Brand, CreateBrandDto, UpdateBrandDto } from './types';
```

---

## Shared (`src/shared/`) Usage

```ts
// Most common — barrel import
import { req, handleError, STALE_TIME } from '@shared';
import type { Paginated, ApiData, PageParams } from '@shared/types';

// Subpath — only when you need something not in the barrel
import { lightAntdTheme } from '@design-system/antd/theme';
import { IS_DEV } from '@config/env';
```

| What | Import from |
|---|---|
| `req` (axios) | `@shared` |
| `queryClient` | `@shared` |
| `handleError`, `showError` | `@shared` |
| `STALE_TIME`, `GC_TIME` | `@shared` |
| `Paginated`, `ApiData`, `PageParams` | `@shared/types` |
| `useDebounce`, `useDraftState`, etc. | `@shared` |
| `useSheet` | `@shared` |

---

## Route Registration

Every page must be lazy-loaded in `src/app/router/index.tsx`:
```tsx
const BrandPage = lazy(() =>
  import('@features/brand').then((m) => ({ default: m.BrandPage }))
);

{ path: 'brand', element: <Page><Guarded roles={['SuperAdmin']}><BrandPage /></Guarded></Page> }
```

---

## Checklist: New Feature

- [ ] `features/<name>/index.ts` — barrel exports public API only
- [ ] `react-query/` — queryKeys + queries + mutations + services + index
- [ ] `react-query/services.ts` imports `req` from `@shared`, types from `../types`
- [ ] `types/index.ts` — all domain types and status constants
- [ ] `stores/` — only if feature needs Zustand UI state
- [ ] `hooks/` — only if feature needs custom non-data-fetching hooks
- [ ] Page registered as lazy route in `src/app/router/index.tsx`
- [ ] Cross-feature imports use `@features/<name>` top-level barrel only
