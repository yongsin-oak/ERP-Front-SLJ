# Skill: Design System — Components

> All `@design-system` wrapper components and ERP composite patterns.
> Back to parent: [design-system](../SKILL.md) · [icons](../icons/SKILL.md)

---

## Trigger

Use this skill when picking a UI component or implementing a page/table/modal/form pattern.

---

## Available Components

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
<Table dataSource={orders} columns={columns} rowKey="id" virtual scroll={{ y: 500 }} />
```

### Modal

```tsx
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
<Spinner />           // inline
<Spinner fullPage />  // centered full-page overlay
```

### PageHeader

```tsx
<PageHeader
  title="Orders"
  extra={<Button variant="primary">New Order</Button>}
/>
```

---

## ERP Composite Components

These remove boilerplate common across all feature pages. Always prefer them over writing the pattern from scratch.

### DeleteConfirmButton

Wraps `Popconfirm` + `Button danger-ghost`. Default: icon-only trash button.

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

Show when `selectedKeys.length > 0`:

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

Edit + Delete icon buttons for table row `render`:

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

```tsx
import { FormModal, Form } from '@design-system';

const [form] = Form.useForm<ProductFormValues>();

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

Handles loading / error / empty states on every page:

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
  { title: 'Code',    dataIndex: 'sku',       render: (v: string) => <CodeCell>{v}</CodeCell> },
  { title: 'Price',   dataIndex: 'price',     render: (v: number) => <MoneyCell value={v} /> },
  { title: 'Stock',   dataIndex: 'stock',     render: (v: number) => <QuantityCell value={v} lowThreshold={10} criticalThreshold={3} /> },
  { title: 'Updated', dataIndex: 'updatedAt', render: (v: string) => <DateCell value={v} /> },
];
```

`QuantityCell` automatically colors: green (ok) → orange (low) → red (critical).

### SummaryCard

Stats bar above filters on list pages. Wraps `Card size="small" + Statistic` — never write them inline.

```tsx
import { SummaryCard, colors } from '@design-system';
import { Flex } from 'antd';

<Flex gap={12} style={{ marginBottom: 16 }}>
  <SummaryCard title="ทั้งหมด"        value={total}    suffix="รายการ" color={colors.brand.primary}    style={{ flex: 1 }} />
  <SummaryCard title="มูลค่ารับเข้า"  value={income}   prefix="฿" formatter={(v) => Number(v).toLocaleString()} color={colors.semantic.success} style={{ flex: 1 }} />
  <SummaryCard title="มูลค่าของเสีย"  value={damage}   prefix="฿" formatter={(v) => Number(v).toLocaleString()} color={colors.semantic.error}   style={{ flex: 1 }} />
</Flex>
```

| Prop | Type | Notes |
|---|---|---|
| `title` | `string` | Card label |
| `value` | `number \| string` | Stat value |
| `suffix` | `string?` | Unit after value (e.g. "รายการ") |
| `prefix` | `ReactNode?` | Before value (e.g. "฿") |
| `color` | `string?` | Value text color — use `colors.*` token |
| `formatter` | `StatisticProps['formatter']?` | Custom value renderer (e.g. toLocaleString) |
| `style` | `CSSProperties?` | Pass `{{ flex: 1 }}` for equal-width flex layout |

> **Rule**: `DashboardPage` has its own richer `StatCard` (with icon, hoverable, larger font) defined locally — that will be promoted to design-system during the dashboard audit.
