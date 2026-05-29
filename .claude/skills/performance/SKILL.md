# Skill: Performance Optimization

> Performance rules for this codebase. Priority order: correctness → fast paint → minimal bundle → smooth interaction.
> This is a CSR SPA — no SSR/SEO concerns.

---

## Trigger

Use this skill when:
- Adding a new page or route
- Rendering a list of items
- Writing memoization or callbacks
- Importing a new library
- Working with images or assets

---

## 1. Code Splitting (Critical)

Every page MUST be lazy-loaded. Direct imports in the router kill TTI.

```tsx
// routes/index.tsx — ✅ required pattern
import { lazy, Suspense } from 'react';
import { Spinner } from '@design-system';

const OrderPage = lazy(() =>
  import('@features/order/pages/OrderPage').then(m => ({ default: m.OrderPage }))
);

// in router config
{
  path: 'order',
  element: (
    <Suspense fallback={<Spinner fullPage />}>
      <OrderPage />
    </Suspense>
  ),
}

// ❌ never — loads all pages up-front
import { OrderPage } from '@features/order';
{ path: 'order', element: <OrderPage /> }
```

Named exports require `.then(m => ({ default: m.Name }))` — don't skip this.

---

## 2. Table Virtualization

Use `virtual` prop when the table has or could have >100 rows.
Without it, Ant Design renders all DOM nodes — large tables freeze the page.

```tsx
// ✅ virtualized
<Table
  dataSource={orders}
  columns={columns}
  rowKey="id"
  virtual
  scroll={{ y: 500 }}     // fixed height required for virtual scroll
/>

// ❌ for large datasets
<Table dataSource={orders} columns={columns} rowKey="id" />
```

For lists >200 items that are NOT tables, use `@tanstack/react-virtual`:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

const parentRef = useRef<HTMLDivElement>(null);
const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 48,   // average item height
  overscan: 5,
});

return (
  <div ref={parentRef} style={{ height: 600, overflow: 'auto' }}>
    <div style={{ height: virtualizer.getTotalSize() }}>
      {virtualizer.getVirtualItems().map((vi) => (
        <div key={vi.key} style={{ position: 'absolute', top: vi.start, width: '100%' }}>
          <ItemRow item={items[vi.index]} />
        </div>
      ))}
    </div>
  </div>
);
```

---

## 3. Memoization — Only When It Pays

**Default: do NOT memoize.** Add only when profiling or clearly expensive.

```tsx
// ✅ memo justified — expensive sort on large array
const sorted = useMemo(
  () => orderBy(products, ['stock', 'name'], ['asc', 'asc']),
  [products]
);

// ✅ useCallback justified — passed as prop to child that is memo'd, or dep of another effect
const handleRowClick = useCallback((record: Order) => {
  setSelected(record);
}, []);

// ❌ pointless memo — primitive filter on tiny array
const activeOrders = useMemo(() => orders.filter(o => o.active), [orders]);

// ❌ pointless useCallback — not passed as prop, not in deps
const handleOpen = useCallback(() => setOpen(true), []);
```

Rule: if removing `useMemo`/`useCallback` would make the code clearer and you don't see a real perf problem, remove it.

---

## 4. React Query — Anti-Flicker

Always add `placeholderData` on paginated/filtered queries:

```ts
useQuery({
  queryKey: orderKeys.list(params),
  queryFn: () => orderService.list(params).then(r => r.data),
  placeholderData: (prev) => prev,   // keeps old data while fetching new page
})
```

Without this, the table shows empty + spinner every time filters/page changes.

Stale time for slow-changing master data (products, categories):

```ts
useQuery({
  queryKey: categoryKeys.all,
  queryFn: () => categoryService.list().then(r => r.data),
  staleTime: 5 * 60 * 1000,   // 5 min — avoids refetch on every focus
})
```

---

## 5. Image Optimization

Always specify dimensions and lazy-load:

```tsx
// ✅
<img src={productImage} alt={product.name} width={64} height={64} loading="lazy" />

// ❌ — causes layout shift and loads everything
<img src={productImage} alt="" />
```

For avatar/thumbnail grids — use fixed container with `object-fit`:

```tsx
const Thumb = styled.img`
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: ${radius.md};
`;

<Thumb src={url} alt="" width={64} height={64} loading="lazy" />
```

---

## 6. Bundle — Dependency Rules

Vite config already splits: `vendor` / `antd` / `charts` / `utils` chunks.

Before adding any new library:
1. Check if the feature already exists in the stack (see CLAUDE.md stack table)
2. Estimate bundle size: prefer `bundlephobia.com`
3. If >50 KB gzipped — use dynamic import or tree-shake carefully

```ts
// ✅ dynamic import for heavy optional lib
const { saveAs } = await import('file-saver');

// ❌ top-level import of heavy lib used in one feature
import { complexLib } from 'heavy-library';
```

Banned: `moment`, `lodash` (use `lodash-es` or individual functions), `jquery`, `axios` (use `@lib` req instance).

---

## 7. Re-render Prevention

### Zustand selectors

```ts
// ✅ only re-renders when orders change
const orders = useOrderStore((s) => s.orders);

// ❌ re-renders on every store change
const { orders, isLoading, filters } = useOrderStore();
```

### Stable references for event handlers

```tsx
// If a callback is passed to a child component wrapped in React.memo,
// wrap it in useCallback so the child doesn't re-render unnecessarily.
const handleDelete = useCallback((id: string) => {
  deleteOrder.mutate(id);
}, [deleteOrder]);
```

### Avoid object/array literals in JSX props

```tsx
// ❌ new object on every render — breaks React.memo children
<Component style={{ display: 'flex' }} options={['a', 'b']} />

// ✅ stable references
const STYLE = { display: 'flex' } as const;
const OPTIONS = ['a', 'b'] as const;
<Component style={STYLE} options={OPTIONS} />
```

---

## Performance Checklist

- [ ] New page is lazy-loaded in `routes/index.tsx`
- [ ] Table with variable row count has `virtual` + `scroll={{ y: N }}`
- [ ] List >200 items uses `@tanstack/react-virtual`
- [ ] Paginated/filtered queries have `placeholderData: (prev) => prev`
- [ ] Images have `width`, `height`, `loading="lazy"`
- [ ] New library assessed for size before adding
- [ ] `useMemo`/`useCallback` only where justified
- [ ] Zustand selectors used — not full store destructure
