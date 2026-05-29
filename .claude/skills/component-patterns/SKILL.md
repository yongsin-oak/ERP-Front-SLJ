# Skill: Component Patterns

> Rules for creating, naming, and reusing components without duplication.

---

## Trigger

Use this skill when:
- Creating any new React component
- Noticing the same JSX pattern duplicated in 2+ places
- Unsure whether to create a new component or extend an existing one
- Naming a file, function, or prop

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
import styled from '@emotion/styled';
import { spacing } from '@design-system/tokens';
import { PageHeader, Button } from '@design-system';
import { useOrders, useDeleteOrder } from '../hooks';
import { OrderTable } from '../components/OrderTable';
import { OrderFormModal } from '../components/OrderFormModal';

export function OrderPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useOrders();
  const deleteOrder = useDeleteOrder();

  return (
    <Wrapper>
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
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: ${spacing[6]};
  display: flex;
  flex-direction: column;
  gap: ${spacing[4]};
`;
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
```
