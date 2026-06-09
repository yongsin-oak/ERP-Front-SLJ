# ERP-Front-SLJ

> Performance-first · Responsive · Type-safe · Minimal
>
> **API Reference**: Read `.claude/API.md` before editing any service or types file.

---

## Agent Behavior

### Before Starting Any Task

0. **Load project context.** Read `.claude/skills/project-context/SKILL.md` before any task. It defines the business, roles, UX bar, and backend error contract.
1. **Read first, ask second.** Grep the codebase, read relevant files, and check `.claude/API.md` before asking any question. Only ask if the answer is genuinely not in the code.
2. **Never guess.** If a type, endpoint shape, prop, or file location is unclear — read the source. Do not invent shapes or assume behavior.
3. **Plan before touching files.** For changes affecting ≥3 files or with non-obvious side effects, state the plan first:
   - Which files will change and why
   - What breaks or needs updating downstream
   - Any risk or irreversible action — confirm before proceeding

### While Working

- Flag breaking changes immediately — do not silently work around them.
- Before adding a new dependency, state its name, bundle size, and why the existing stack cannot cover it.
- Do not refactor, rename, or clean up code outside the task scope.
- Do not add error handling or validation for scenarios that cannot happen.

### Proactive Warnings — Warn Before Writing, Not After

If you detect any of the following at any point (planning, reviewing, or implementing), stop and warn the user immediately with a `> ⚠️ Warning:` block before proceeding.

#### Runtime errors / correctness risks

- Accessing a property that may be `undefined` or `null` without a guard
- Calling a hook conditionally or inside a callback (violates Rules of Hooks)
- Missing `key` prop on list-rendered elements
- Mutating state or props directly instead of returning new values
- `useEffect` with a missing or incorrect dependency array
- Async function passed directly to `useEffect` (use inner async or IIFE)
- Type cast with `as` that may hide a real type mismatch

#### Code bloat / maintainability risks

- Duplicating logic or JSX that already exists elsewhere in the codebase
- Defining the same constant or type in more than one file
- A component or function growing beyond ~150 lines without splitting
- Business logic placed inside JSX render or a page component
- Copy-pasting a block instead of extracting a reusable component or hook

#### Performance risks

- Importing a page directly in the router instead of using `lazy()`
- Rendering a list of >100 rows without `virtual` + `scroll={{ y: N }}`
- Adding `useMemo` / `useCallback` with no measurable benefit (pointless overhead)
- Forgetting `placeholderData: (prev) => prev` on a paginated/filtered query
- Adding a new library >50 KB gzipped without assessing alternatives
- Object or array literal in JSX props that breaks memoization of child components
- Destructuring the entire Zustand store instead of using selectors

#### Warning format

```text
> ⚠️ Warning: <one-line summary of the risk>
> **Why:** <what will break or degrade>
> **Fix:** <the correct approach>
```

### After Completing Any Task

Always end with a summary:

| Section | Content |
| --- | --- |
| **Changed** | File paths and line ranges modified |
| **Impact** | What else is affected (components, routes, queries, types) |
| **Review** | What the user should manually verify or test |
| **Caution** | Edge cases, known limitations, or follow-up work |

---

## Stack

| Layer | Library | Version |
| --- | --- | --- |
| UI Framework | React | 19 |
| Build | Vite | 7 |
| Package Manager | **bun** (primary) / npm | — |
| Language | TypeScript | 5.9 (strict) |
| UI Components | Ant Design | 6 |
| Icons (UI chrome) | @ant-design/icons | bundled with antd |
| Icons (domain) | **@tabler/icons-react** | 3 |
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

## Path Aliases

```text
@assets        → src/assets
@design-system → src/design-system
@lib           → src/lib
@features      → src/features
@layouts       → src/layouts
@routes        → src/routes
@dev           → src/dev  (dev only)
```

---

## Core Rules

- **Named exports everywhere** — no default exports (except `App.tsx`, `main.tsx`)
- **TypeScript strict** — no `any`, no `as` casts; use `unknown` and narrow
- **No magic values** — strings, numbers, and statuses must be named constants
- **No prop drilling >2 levels** — lift to Zustand or React Query cache
- **No `new Date()` or `moment`** — use `dayjs`
- **No raw `axios`** — use `req` from `@lib`
- **No inline `#hex` or `px` literals** — use design tokens from `@design-system/tokens`
- **Domain icons via `AppIcons`** — `import { AppIcons } from '@design-system'`; `<AppIcons.product />`. Antd icons for generic UI chrome only. See `.claude/skills/design-system/SKILL.md` § Icons.
- **No hardcoded query keys** — use key factories from `hooks/queryKeys.ts`
- **No magic timing numbers** — use `STALE_TIME`, `GC_TIME`, `REFETCH_INTERVAL` from `@lib`
- **All pages lazy-loaded** — wrap in `lazy()` + `<Suspense>` in `routes/index.tsx`
- **Server state → React Query · Shared UI state → Zustand · Local UI state → useState**
- **Every mutation must have** `onError: handleError('Action name')` from `@lib`
- **Every page must handle** loading / empty (with CTA) / error states — use `PageShell` from `@design-system`
- **Every delete must confirm** — use `DeleteConfirmButton` from `@design-system`
- **Bulk selection** — use `BulkSelectionBar` from `@design-system`
- **Table edit+delete actions** — use `ActionCell` from `@design-system`
- **Create/edit modals** — use `FormModal` from `@design-system` (handles reset, footer, validateFields)
- **Table cell formatters** — use `DateCell`, `MoneyCell`, `CodeCell`, `QuantityCell` from `@design-system`

---

## Skills Reference

Detailed patterns and examples live in `.claude/skills/`.

> **Skill file limit**: Each `SKILL.md` must not exceed **400 lines**. If a skill grows beyond that, split it into a sub-folder: create `<skill>/<sub-topic>/SKILL.md` and make the root `SKILL.md` a brief index pointing to sub-skills. Update this table whenever you add or split a skill.

| Skill | Covers |
| --- | --- |
| `folder-structure` | Feature anatomy, barrel exports, file naming, import rules |
| `design-system` | Tokens (colors/spacing/radius/shadow), Emotion rules, responsive layout |
| `design-system/components` | Component catalog, ERP composite components (Table, Modal, FormModal, ActionCell…) |
| `design-system/icons` | AppIcons map, two-library split, adding new icons |
| `react-query` | queryKeys factory, useQuery, useMutation, invalidate vs setQueryData |
| `constants` | Where to define constants, naming conventions, status/label/color pattern |
| `component-patterns` | Component anatomy, page/table/modal patterns, naming, anti-patterns |
| `performance` | Lazy loading, table virtualization, memoization, bundle rules |
| `query-constants` | STALE_TIME/GC_TIME/REFETCH_INTERVAL constants, hook file structure (queryKeys/queries/mutations) |
| `type-sharing` | Where to declare types, sharing within/across features, Paginated/ApiData, anti-patterns |
| `style/animation` | Easing functions, duration rules, GPU-safe properties, keyframes, reduced motion |
| `style/ux-laws` | UX laws applied to this project (lawsofux.com), designing for all users, warning triggers |
| `project-context` | **Load every session** — SLJ Supply Center business model, roles, UX bar, backend error contract |
