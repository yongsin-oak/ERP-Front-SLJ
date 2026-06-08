# Skill: UX Persistence

> Persist user input, filters, and wizard progress so users never lose work.

---

## Trigger

Use this skill when:
- A page has a search/filter bar that should survive navigation
- A form is long enough that users might close the tab mid-fill
- A multi-step wizard should remember which step the user was on
- A component needs local browser storage (cookie, localStorage, sessionStorage)

---

## Guiding Principle

**Never let the user re-type what they already entered.**

Internal ERP operators work fast. If a page refresh resets a 10-field form or a date-range filter, it causes real friction. Persist UI state cheaply and clear it intelligently.

---

## Storage Decision Table

| What to persist | Storage | Hook | Why |
|---|---|---|---|
| Form draft (multi-field, long) | `localStorage` | `useDraftState` | Survives tab close; cleared after 24h TTL |
| Search / filter params | `sessionStorage` | `useSearchState` | Clears on tab close — fresh every session |
| Wizard step | `sessionStorage` | `useStepState` | Only meaningful for current session |
| Auth token / preference | `cookie` | `useCookie` | Sent with requests; controlled expiry |
| Lightweight flag | `localStorage` | `useLocalStorage` | e.g. "user dismissed this banner" |

All hooks are in `@lib` — import directly:
```ts
import { useDraftState, useSearchState, useStepState } from '@lib';
```

---

## Hook API Reference

### `useDraftState<T>(key, initialValue)`

Form draft with **24h TTL auto-clear**. Never shows stale data from yesterday.

```ts
const { draft, save, clear, hasDraft } = useDraftState('order-entry', defaultValues);

// Save on every field change (debounce recommended)
<Form onValuesChange={(_, all) => save(all)} initialValues={draft}>

// Show "restore draft?" banner
{hasDraft && <Alert message="มีข้อมูลค้างอยู่" action={<Button onClick={clear}>ล้าง</Button>} />}

// Clear after successful submit
mutation.mutate(values, { onSuccess: () => { clear(); } });
```

**Key convention**: `'<feature>-<page>'` — e.g. `'order-entry'`, `'stock-receive'`

---

### `useSearchState<T>(key, initialValue)`

Filter/search state with **sessionStorage** (cleared on tab close).

```ts
const [filters, setFilters, clearFilters] = useSearchState('order-list', defaultFilters);

<FilterBar items={FILTER_ITEMS} values={filters} onChange={setFilters} onClear={clearFilters} />
```

**Key convention**: `'<feature>-list'` — e.g. `'order-list'`, `'inventory-list'`

---

### `useStepState(key, totalSteps)`

Multi-step wizard progress in **sessionStorage**.

```ts
const { step, next, back, reset, isFirst, isLast } = useStepState('import-wizard', 3);

<Steps current={step} items={[...]} />
<Button onClick={back} disabled={isFirst}>ย้อนกลับ</Button>
<Button onClick={next} disabled={isLast}>ถัดไป</Button>
```

**Reset on success**: always call `reset()` after successful completion so the next run starts from step 0.

---

### `useLocalStorage<T>(key, initialValue)`

General localStorage with JSON serialization.

```ts
const [collapsed, setCollapsed, _] = useLocalStorage('sidebar-collapsed', false);
```

---

### `useDebounce<T>(value, delay?)`

Delay a value (default 300ms) — pair with `useSearchState` for search inputs.

```ts
const [query, setQuery] = useState('');
const debouncedQuery = useDebounce(query, 400);

useEffect(() => {
  if (debouncedQuery) fetchResults(debouncedQuery);
}, [debouncedQuery]);
```

---

## Recommended Patterns

### Long form with draft restore banner

```tsx
function OrderEntryPage() {
  const [form] = Form.useForm();
  const { draft, save, clear, hasDraft } = useDraftState('order-entry', defaultValues);
  const createOrder = useCreateOrder();

  useEffect(() => { form.setFieldsValue(draft); }, []);

  return (
    <>
      {hasDraft && (
        <Alert
          type="info"
          message="มีข้อมูลที่กรอกค้างอยู่"
          action={<Button size="small" onClick={() => { clear(); form.resetFields(); }}>ล้างและเริ่มใหม่</Button>}
          style={{ marginBottom: 16 }}
        />
      )}
      <Form form={form} onValuesChange={(_, all) => save(all)} onFinish={values => {
        createOrder.mutate(values, { onSuccess: () => { clear(); form.resetFields(); } });
      }}>
        ...
      </Form>
    </>
  );
}
```

### Table page with persistent filters

```tsx
function OrderListPage() {
  const [filters, setFilters, clearFilters] = useSearchState('order-list', defaultFilters);
  const { data } = useOrders(filters);

  return (
    <>
      <FilterBar items={ORDER_FILTERS} values={filters} onChange={setFilters} onClear={clearFilters} />
      <Table dataSource={data?.items} ... />
    </>
  );
}
```

### Sheet import wizard with step persistence

```tsx
function ImportWizardPage() {
  const { step, next, back, reset } = useStepState('sheet-import', 3);
  const [sheetData, setSheetData] = useState<SheetData | null>(null);

  return (
    <ConfirmDrawer
      step={step}
      formContent={<DropZoneSheet onParsed={d => { setSheetData(d); next(); }} />}
      summary={sheetData && <SheetColumnMapper sheetData={sheetData} dbFields={DB_FIELDS} />}
      onConfirm={() => { importMutation.mutate(); reset(); }}
    />
  );
}
```

---

## Storage Key Naming Convention

| Pattern | Example |
|---|---|
| `'<feature>-entry'` | `'order-entry'` |
| `'<feature>-list'` | `'inventory-list'` |
| `'<feature>-import'` | `'stock-import'` |
| `'<feature>-<step>'` | `'stock-receive-wizard'` |

Always use stable, human-readable keys. Changing a key abandons any data stored under the old key.

---

## Auto-Clear Strategy

| Hook | Auto-clear trigger | Manual clear |
|---|---|---|
| `useDraftState` | 24h TTL on next read | `clear()` after submit |
| `useSearchState` | Tab close (sessionStorage) | `clearFilters()` on "ล้างตัวกรอง" |
| `useStepState` | Tab close (sessionStorage) | `reset()` after success |

**Never let storage grow unbounded.** If you add a new `useDraftState` key, verify the old key is either reused or cleared at feature completion.
