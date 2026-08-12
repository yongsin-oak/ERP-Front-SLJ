# Skill: Component Patterns

> Rules for creating, naming, and reusing components without duplication.

---

## Trigger

Use this skill when:
- Creating any new React component
- Noticing the same JSX pattern duplicated in 2+ places
- Unsure whether to create a new component or extend an existing one
- Naming a file, function, or prop

## Atlassian + Tailwind contract

- อ้าง [Atlassian components](https://atlassian.design/components) และ [layout primitives](https://atlassian.design/foundations/spacing/primitives/) ก่อนสร้าง pattern ใหม่
- ใช้ Tailwind CSS + `cn()` เท่านั้น ห้าม Emotion, CSS-in-JS, `styled()` และ legacy token imports

---

## Core Rules

1. **Named exports only** — no default exports (except `App.tsx`, `main.tsx`)
2. **Functional components only** — no class components
3. **No `React.FC`** — write the return type directly or let TypeScript infer
4. **Props via inline interface** — name it `Props` inside the file
5. **No prop drilling >2 levels** — lift to Zustand or React Query cache

---

## Component Anatomy

```tsx
// features/order/components/OrderStatusTag.tsx

import { Tag } from '@design-system';
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from '../types';
import type { OrderStatus } from '../types';

interface Props {
  status: OrderStatus;
}

export function OrderStatusTag({ status }: Props) {
  return (
    <Tag status={ORDER_STATUS_COLOR[status]}>
      {ORDER_STATUS_LABEL[status]}
    </Tag>
  );
}
```

- Interface named `Props`, not `OrderStatusTagProps`
- Named export, not default
- No `React.FC` wrapper
- Pulls constants from `types/` — no inline strings

---

## เลือก Component ตัวไหน — ตัดสินจาก "หน้าที่และพฤติกรรม" ไม่ใช่หน้าตา

> **Purpose → Behavior → Frequency → Importance → Complexity → Accessibility**
>
> ผู้ใช้กำลังจะทำอะไร → component นี้ behave ตรงกับสิ่งนั้นไหม → ใช้บ่อยแค่ไหน →
> สำคัญ/อันตรายแค่ไหน → มีตัวที่ง่ายกว่านี้ไหม → ทุกคนใช้งานได้ไหม

**ห้ามเลือก component เพราะ "หน้าตาเหมือนสิ่งที่ต้องการ"** ให้เลือกเพราะ interaction และ semantic ตรงกัน

| หลัก | ความหมาย | ในโปรเจกต์นี้ |
| --- | --- | --- |
| Purpose first | ไปหน้าอื่น = link · สั่ง action = `Button` | ปุ่มที่แค่ `navigate()` ควรเป็น link ไม่ใช่ `Button` |
| Simplest that works | มี 2 action ไม่ต้องทำ dropdown | แต่ **ท้ายแถวตารางใช้ `ActionCell` เสมอ** — ดูเหตุผลด้านล่าง |
| Established patterns | ใช้สิ่งที่ผู้ใช้คุ้น | เปิด/ปิด = `Switch` · เลือก 1 = `Radio` |
| Match behavior | `Checkbox` ≠ `Switch` | `Switch` = มีผลทันที · `Checkbox` = รอกดบันทึก |
| Consistency | use case เดียวกัน component เดียวกัน | primary action ของหน้า = `Button variant="primary"` ตัวเดียว |
| Frequency | ใช้บ่อย → เข้าถึงง่าย | ใช้ทุกวันอยู่บน toolbar · นานๆ ครั้งอยู่ในเมนู `•••` |
| Importance | สะท้อน hierarchy | primary → `primary` · รอง → `secondary` · ที่สาม → `ghost` |
| Consequences | เสี่ยง = ต้องออกแบบต่าง | destructive + `confirm` เสมอ (`ActionMenu` บังคับผ่าน `confirm`) |
| Accessibility | keyboard / focus / screen reader | ห้ามใช้ `<div onClick>` แทนปุ่ม · icon-only ต้องมี `aria-label` |
| Don't invent | มีของอยู่แล้วให้ใช้ของเดิม | อย่าทำ dropdown เอง — ใช้ `Select` / `ActionMenu` / `ui/dropdown-menu` |

### คู่ที่มักเลือกผิด

| แทน | ใช้ | เมื่อ |
| --- | --- | --- |
| `Checkbox` | `Switch` | เปลี่ยนแล้วมีผล **ทันที** (เช่น เปิด/ปิดสินค้า) ไม่ต้องกดบันทึก |
| `Switch` | `Checkbox` | เป็นค่าในฟอร์มที่จะบันทึกพร้อมกันทีหลัง / เลือกได้หลายข้อ |
| `Select` | `Radio` | ตัวเลือก ≤ 4 และอยากให้เห็นครบทุกตัวพร้อมกัน |
| `Radio` | `Select` | ตัวเลือกเยอะ หรือพื้นที่จำกัด (ในตาราง / filter bar) |
| `Modal` | หน้าเต็ม (route) | flow ยาว กรอกหลายส่วน — Modal เหมาะกับงานสั้นที่ผู้ใช้ต้องกลับมาทำงานเดิมต่อ |
| ปุ่มเรียงกันท้ายแถว | `ActionCell` | **เสมอ** — ดูเหตุผลด้านล่าง |

### ทำไมท้ายแถวตารางถึงเป็นเมนู ทั้งที่ "simplest that works" บอกว่า 2 action ไม่ต้องทำ dropdown

หลัก *Consequences* และ *Frequency* ชนะหลัก *Simplest* ในบริบทนี้:
ปุ่มลบที่โผล่อยู่ทุกแถวคือ action อันตรายที่อยู่ปลายนิ้วตลอดเวลา และตารางมีเป็นสิบแถว
เมนูทำให้ต้องตั้งใจกดสองครั้ง + ดัน destructive ไปท้ายสุดห่างจากตัวที่กดบ่อย
(กติกานี้ผูกไว้ใน `ActionCell` แล้ว ไม่ต้องตัดสินใจใหม่ทุกหน้า)

---

## When to Create a New Component

Extract a component when ANY of the following is true:

| Signal | Action |
|---|---|
| Same JSX block appears in ≥2 places | Extract shared component |
| Component file exceeds ~150 lines | Split into sub-components |
| JSX block has its own state logic | Extract + own useState inside |
| Identical table columns defined twice | Shared `COLUMNS` constant |
| Same modal opened from 2+ pages | Shared modal component |

```tsx
// ❌ same status badge copied in OrderPage and OrderDetailPage
<span style={{ color: status === 'pending' ? 'orange' : 'green' }}>{status}</span>

// ✅ extract once, reuse everywhere
import { OrderStatusTag } from '../components/OrderStatusTag';
<OrderStatusTag status={order.status} />
```

---

## Component Location Decision

```
Is it reusable across 2+ features?
  YES → src/design-system/components/<Name>/   (generic UI only)
        or discuss with team before creating
  NO  → features/<feature>/components/<Name>.tsx
```

Feature-local components stay inside the feature. Do NOT prematurely generalize.

---

## Page Component Pattern

Every page is a thin orchestration layer:

```tsx
// features/order/pages/OrderPage.tsx
import { useState } from 'react';
import { PageHeader, Button, Stack } from '@design-system';
import { useOrders, useDeleteOrder } from '../hooks';
import { OrderTable } from '../components/OrderTable';
import { OrderFormModal } from '../components/OrderFormModal';

export function OrderPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useOrders();
  const deleteOrder = useDeleteOrder();

  return (
    <Stack gap={4} className="p-6">
      <PageHeader
        title="Orders"
        extra={<Button variant="primary" onClick={() => setModalOpen(true)}>New Order</Button>}
      />
      <OrderTable
        data={data?.items ?? []}
        loading={isLoading}
        onDelete={(id) => deleteOrder.mutate(id)}
      />
      <OrderFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </Stack>
  );
}

```

Pages do NOT contain: table column definitions, inline styles, business logic, API calls.

---

## Table Component Pattern

Extract columns and table into its own component:

```tsx
// features/order/components/OrderTable.tsx
import { Table, Button } from '@design-system';
import type { ColumnType } from '@design-system';
import { OrderStatusTag } from './OrderStatusTag';
import type { Order } from '../types';

interface Props {
  data: Order[];
  loading?: boolean;
  onEdit?: (order: Order) => void;
  onDelete?: (id: string) => void;
}

const columns = (onEdit?: Props['onEdit'], onDelete?: Props['onDelete']): ColumnType<Order>[] => [
  { title: 'ID', dataIndex: 'id', searchable: true },
  { title: 'Status', dataIndex: 'status', render: (s) => <OrderStatusTag status={s} /> },
  {
    title: 'Actions', key: 'actions',
    render: (_, record) => (
      <>
        <Button variant="ghost" onClick={() => onEdit?.(record)}>Edit</Button>
        <Button variant="danger-ghost" onClick={() => onDelete?.(record.id)}>Delete</Button>
      </>
    ),
  },
];

export function OrderTable({ data, loading, onEdit, onDelete }: Props) {
  return (
    <Table
      dataSource={data}
      columns={columns(onEdit, onDelete)}
      rowKey="id"
      loading={loading}
      virtual
      scroll={{ y: 500 }}
    />
  );
}
```

Columns defined once as a function — reused in export, print, or detail views.

---

## Modal Pattern

```tsx
// features/order/components/OrderFormModal.tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, Button } from '@design-system';
import { useCreateOrder, useUpdateOrder } from '../hooks';
import { OrderSchema, type OrderFormValues } from '../types';
import type { Order } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  editTarget?: Order;   // undefined = create mode
}

export function OrderFormModal({ open, onClose, editTarget }: Props) {
  const isEdit = !!editTarget;
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<OrderFormValues>({
    resolver: zodResolver(OrderSchema),
    defaultValues: editTarget ?? {},
  });

  useEffect(() => { if (open) reset(editTarget ?? {}); }, [open, editTarget, reset]);

  const onSubmit = async (values: OrderFormValues) => {
    if (isEdit) {
      await updateOrder.mutateAsync({ id: editTarget.id, data: values });
    } else {
      await createOrder.mutateAsync(values);
    }
    onClose();
  };

  const isPending = createOrder.isPending || updateOrder.isPending;

  return (
    <Modal
      title={isEdit ? 'Edit Order' : 'New Order'}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>Cancel</Button>,
        <Button key="submit" variant="primary" loading={isPending} onClick={handleSubmit(onSubmit)}>
          {isEdit ? 'Save' : 'Create'}
        </Button>,
      ]}
    >
      {/* form fields */}
    </Modal>
  );
}
```

One modal handles both create and edit — controlled by `editTarget` prop.

---

## Naming Reference

| What | Pattern | Example |
|---|---|---|
| Page | `<Domain>Page` | `OrderPage` |
| List/table component | `<Domain>Table` | `OrderTable` |
| Form modal | `<Domain>FormModal` | `OrderFormModal` |
| Detail modal/drawer | `<Domain>DetailModal` | `OrderDetailModal` |
| Status/type badge | `<Domain>StatusTag` | `OrderStatusTag` |
| Filter bar | `<Domain>Filters` | `OrderFilters` |
| Card | `<Domain>Card` | `OrderSummaryCard` |

---

## Anti-Patterns

```tsx
// ❌ inline switch for labels — use a map constant
switch(status) {
  case 'pending': return <span style={{color:'orange'}}>Pending</span>
  ...
}

// ❌ copy-pasted columns between two pages

// ❌ business logic in JSX
{orders.filter(o => o.status !== 'cancelled').sort(...).slice(0, 5).map(...)}
// ✅ compute above return, name the variable
const recentActive = useMemo(() => ..., [orders]);

// ❌ effect that reacts to state to run an action (cascading renders — react-hooks/set-state-in-effect)
useEffect(() => {
  if (pin.length === PIN_MAX) void handleConfirm();
}, [pin]);
// ✅ trigger from the event that changed the state, pass the next value directly
function handleKey(k: string) {
  const next = pin + k;
  setPin(next);
  if (next.length === PIN_MAX) void handleConfirm(next);   // action fn takes the value as a param
}
```

`useEffect` is for syncing with **external** systems (DOM listeners, subscriptions, timers) — not for
"when state becomes X, do Y". Every entry point that can produce X calls the action itself; the action
signature accepts the fresh value (`handleConfirm(pinValue = pin)`) so it never reads stale state.
