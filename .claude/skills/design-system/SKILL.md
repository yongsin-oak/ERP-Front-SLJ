# Skill: Design System

> Everything about tokens, components, and styling rules for this codebase.
> The design system lives at `src/design-system/` — import from `@design-system`.

---

## Trigger

Use this skill when:
- Styling any component (color, spacing, layout, typography)
- Picking a UI component (button, table, modal, etc.)
- Tempted to write a raw `#hex` value or `px` literal

---

## Token Reference

Import tokens from `@design-system/tokens` (or the barrel `@design-system`).

### Colors — `colors`

```ts
import { colors } from '@design-system/tokens';
```

| Group | Keys | Usage |
|---|---|---|
| `colors.brand` | `primary` `hover` `active` `light` `border` | Brand red — primary actions |
| `colors.neutral` | `0` `50` `100` `200` `300` `400` `500` `600` `700` `800` `900` | Gray scale |
| `colors.semantic` | `successBg/Border/success/successText` (×4 per state: success/warning/error/info) | UX feedback — form validation, alerts, badges |
| `colors.status` | `pending` `processing` `completed` `cancelled` `onHold` — each has `.color` `.bg` `.border` | Workflow/order status tags |
| `colors.text` | `primary` `secondary` `tertiary` `disabled` `inverse` `link` `linkHover` | Text hierarchy + links |
| `colors.border` | `default` `strong` `focus` | Borders, dividers, focus rings |
| `colors.bg` | `base` `layout` `hover` `active` `selected` `disabled` `mask` `skeleton` | All background states |

#### Semantic — 4 tiers per state

Each semantic state (success/warning/error/info) has 4 keys:

| Suffix | Use case |
|---|---|
| `*Bg` | Tag fill, alert background, highlighted row |
| `*Border` | Outlined tag, form validation ring |
| (none) | Icon, badge dot, filled button background |
| `*Text` | Readable colored text on white — WCAG AA darker variant |

```ts
// ✅ form field error
color: ${colors.semantic.errorText};       // dark red — readable on white
border: 1px solid ${colors.semantic.errorBorder};
background: ${colors.semantic.errorBg};

// ✅ success badge
background: ${colors.semantic.successBg};
border: 1px solid ${colors.semantic.successBorder};
color: ${colors.semantic.successText};
```

#### Status — workflow states

```ts
// ✅ dynamic status tag
const s = colors.status[order.status];  // pending | processing | completed | cancelled | onHold
// s.color → text/icon color
// s.bg    → background fill
// s.border → border stroke

<Tag style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
  {ORDER_STATUS_LABEL[order.status]}
</Tag>
```

#### Background utilities

```ts
colors.bg.selected   // selected table row, active nav item  (#fff1f0 — brand tint)
colors.bg.disabled   // disabled input/button background
colors.bg.mask       // modal/drawer dark overlay
colors.bg.skeleton   // skeleton loading placeholder color
```

```ts
// ✅
color: ${colors.text.primary};
background: ${colors.bg.layout};
border: 1px solid ${colors.border.default};

// ❌ never
color: 'rgba(0,0,0,0.88)';
background: '#f5f5f5';
```

### Spacing — `spacing`

```ts
import { spacing } from '@design-system/tokens';
// values: 0='0px' 1='4px' 2='8px' 3='12px' 4='16px' 5='20px' 6='24px' 8='32px' 10='40px' 12='48px' 16='64px'
```

```ts
// ✅
padding: ${spacing[4]};          // 16px
gap: ${spacing[2]};              // 8px
margin: ${spacing[6]} 0;        // 24px 0

// ❌ never
padding: '16px';
gap: 8;
```

### Border Radius — `radius`

```ts
import { radius } from '@design-system/tokens';
// sm='4px'  md='6px'  lg='8px'  xl='12px'  full='9999px'

border-radius: ${radius.md};
```

### Shadow — `shadow`

```ts
import { shadow } from '@design-system/tokens';
// sm  md  lg  xl

box-shadow: ${shadow.md};
```

---

## Available Components

Import from `@design-system`:

```ts
import {
  Button, Input, InputPassword, InputSearch, TextArea,
  Select, Table, Modal, Card, Badge, Tag, Form,
  Text, Title, PageTitle,
  Spinner, Empty, PageHeader,
} from '@design-system';
```

### Button

```tsx
import { Button } from '@design-system';
// variant: 'primary' | 'secondary' | 'danger' | 'danger-ghost' | 'ghost' | 'link'

<Button variant="primary" onClick={handleSave}>Save</Button>
<Button variant="danger-ghost" onClick={handleDelete}>Delete</Button>
<Button variant="ghost" icon={<EditOutlined />} />
```

### Table

```tsx
import { Table } from '@design-system';
import type { ColumnType } from '@design-system';

const columns: ColumnType<Order>[] = [
  { title: 'ID', dataIndex: 'id', searchable: true },   // adds search dropdown
  { title: 'Status', dataIndex: 'status', sorter: true },
];

// virtual for >100 rows
<Table
  dataSource={orders}
  columns={columns}
  rowKey="id"
  virtual
  scroll={{ y: 500 }}
/>
```

### Modal

```tsx
import { Modal } from '@design-system';
// default width=560, destroyOnHidden=true

<Modal title="Edit Order" open={open} onCancel={onClose} onOk={handleSave}>
  ...
</Modal>
```

### Tag (Status)

```tsx
import { Tag } from '@design-system';
import type { StatusType } from '@design-system';
// StatusType: 'success' | 'warning' | 'error' | 'info' | 'default'

<Tag status="success">Active</Tag>
<Tag status="error">Cancelled</Tag>
```

### Typography

```tsx
import { Text, Title, PageTitle, TEXT_SIZE } from '@design-system';
// TEXT_SIZE: 'xs' | 'sm' | 'md' | 'lg' | 'xl'

<PageTitle>Order Management</PageTitle>
<Title level={2}>Section</Title>
<Text size="sm" type="secondary">Helper text</Text>
```

### Spinner

```tsx
import { Spinner } from '@design-system';

<Spinner />                      // inline
<Spinner fullPage />             // centered full-page overlay
```

### PageHeader

```tsx
import { PageHeader } from '@design-system';

<PageHeader
  title="Orders"
  extra={<Button variant="primary">New Order</Button>}
/>
```

---

## Emotion Styled Components

Always use design tokens — never literals:

```tsx
import styled from '@emotion/styled';
import { colors, spacing, radius, shadow } from '@design-system/tokens';

// ✅
const PageWrapper = styled.div`
  padding: ${spacing[6]};
  background: ${colors.bg.layout};
  display: flex;
  flex-direction: column;
  gap: ${spacing[4]};
`;

const FilterCard = styled.div`
  background: ${colors.bg.base};
  border-radius: ${radius.lg};
  padding: ${spacing[4]};
  box-shadow: ${shadow.sm};
`;

// ❌
const Bad = styled.div`
  padding: 24px;
  background: #f5f5f5;
  border-radius: 8px;
`;
```

---

## Responsive Layout

Use Ant Design Grid for responsive columns:

```tsx
import { Row, Col } from 'antd';

<Row gutter={[16, 16]}>
  <Col xs={24} sm={12} lg={8}><StatCard /></Col>
  <Col xs={24} sm={12} lg={8}><StatCard /></Col>
</Row>
```

Use Emotion breakpoints for component-level responsive:

```tsx
import styled from '@emotion/styled';

const Panel = styled.div`
  width: 100%;
  @media (min-width: 768px) { width: 50%; }
  @media (min-width: 1200px) { width: 33.333%; }
`;
```

---

## When to Use Ant Design Directly

Use a `@design-system` wrapper for components listed above.
Use Ant Design directly for components NOT wrapped:
- `Dropdown`, `Tooltip`, `Popover`, `Tabs`, `Steps`, `Upload`
- `DatePicker`, `TimePicker`, `Checkbox`, `Radio`, `Switch`
- `Collapse`, `Tree`, `Transfer`

Import Ant Design components from `antd` — do NOT create wrappers for one-off uses.

---

## Adding a New Design-System Component

Only wrap an Ant Design component if:
1. It needs default props applied project-wide (e.g. `Modal` always `destroyOnHidden`)
2. It needs a custom variant API (e.g. `Button` with `variant` prop)
3. It will be reused in ≥3 features

Place it in `src/design-system/components/<ComponentName>/index.tsx` and export from `src/design-system/index.ts`.

---

## ERP Composite Components

These components remove boilerplate common across all feature pages. Always prefer them over writing the pattern from scratch.

### DeleteConfirmButton

Wraps `Popconfirm` + `Button danger-ghost`. Default: icon-only trash button. Pass `children` for a custom trigger.

```tsx
import { DeleteConfirmButton } from '@design-system';

// icon-only (default)
<DeleteConfirmButton onConfirm={() => deleteMutation.mutate(id)} loading={deleteMutation.isPending} />

// custom trigger
<DeleteConfirmButton onConfirm={handleDelete} title="Remove product?" description="Stock will be lost.">
  <Button variant="danger">Remove</Button>
</DeleteConfirmButton>
```

### BulkSelectionBar

Show when `selectedKeys.length > 0` — replaces repeated inline JSX in every page.

```tsx
import { BulkSelectionBar } from '@design-system';

{selectedKeys.length > 0 && (
  <BulkSelectionBar
    count={selectedKeys.length}
    onDelete={handleBulkDelete}
    onClear={() => setSelectedKeys([])}
    isDeleting={bulkDelete.isPending}
    itemLabel="products"
  />
)}
```

### ActionCell

Edit + Delete icon buttons for table row `render`. Replaces repeated column action patterns.

```tsx
import { ActionCell } from '@design-system';

{
  title: 'Actions',
  key: 'actions',
  fixed: 'right',
  width: 80,
  render: (_: unknown, record: Product) => (
    <ActionCell
      onEdit={() => { setSelected(record); setModalOpen(true); }}
      onDelete={() => deleteMutation.mutate(record.id)}
      isDeleting={deleteMutation.isPending}
    />
  ),
}
```

### FormModal

Handles modal structure, standard footer, `form.validateFields()`, and `form.resetFields()` on close.
Parent only needs to: provide `form` instance + `setFieldsValue` in edit mode (via `useEffect`).

```tsx
import { FormModal } from '@design-system';
import { Form } from '@design-system';

const [form] = Form.useForm<ProductFormValues>();

// Edit mode: set values when modal opens
useEffect(() => {
  if (open && item) form.setFieldsValue(item);
}, [open, item, form]);

<FormModal
  open={open}
  onClose={onClose}
  title={item ? 'Edit Product' : 'New Product'}
  form={form}
  onFinish={(values) => mutation.mutate(values as ProductFormValues)}
  loading={mutation.isPending}
>
  <Form.Item name="name" label="Name" rules={[{ required: true }]}>
    <Input />
  </Form.Item>
</FormModal>
```

### PageShell

Handles loading / error / empty states on every page. Eliminates repeated if-chains.

```tsx
import { PageShell, Button } from '@design-system';

<PageShell
  isLoading={isLoading}
  isError={isError}
  errorMessage={getErrorMessage(error)}
  isEmpty={!data?.length}
  emptyDescription="No products in inventory"
  emptyAction={<Button variant="primary" onClick={onAdd}>Add first product</Button>}
>
  <Table dataSource={data} ... />
</PageShell>
```

### Table Cell Helpers

```tsx
import { DateCell, MoneyCell, CodeCell, QuantityCell } from '@design-system';

const columns = [
  { title: 'Code',     dataIndex: 'sku',         render: (v: string) => <CodeCell>{v}</CodeCell> },
  { title: 'Price',    dataIndex: 'price',        render: (v: number) => <MoneyCell value={v} /> },
  { title: 'Stock',    dataIndex: 'stock',        render: (v: number) => <QuantityCell value={v} lowThreshold={10} criticalThreshold={3} /> },
  { title: 'Updated',  dataIndex: 'updatedAt',    render: (v: string) => <DateCell value={v} /> },
];
```

`QuantityCell` automatically colors: green (ok) → orange (low) → red (critical).

---

## Quick Reference: Token Imports

```ts
import { colors, spacing, radius, shadow } from '@design-system/tokens';
// or
import { colors, spacing, radius, shadow, Button, Table } from '@design-system';
```
