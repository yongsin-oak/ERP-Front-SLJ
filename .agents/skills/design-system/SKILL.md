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
| `colors.brand` | `primary`, `hover`, `active`, `light`, `border` | Brand red — primary actions |
| `colors.neutral` | `0` `50` `100` `200` `300` `400` `500` `600` `700` `800` `900` | Grays, backgrounds |
| `colors.semantic` | `success` `successBg` `warning` `warningBg` `error` `errorBg` `info` `infoBg` | Status colors |
| `colors.text` | `primary` `secondary` `tertiary` `disabled` `inverse` | Text hierarchy |
| `colors.border` | `default` `strong` | Borders / dividers |
| `colors.bg` | `base` `layout` `hover` `active` | Backgrounds |

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

## Quick Reference: Token Imports

```ts
import { colors, spacing, radius, shadow } from '@design-system/tokens';
// or
import { colors, spacing, radius, shadow, Button, Table } from '@design-system';
```
