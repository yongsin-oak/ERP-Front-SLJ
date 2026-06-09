# Skill: Design System — Tokens & Styling

> Tokens, Emotion rules, and structural guidelines.
> Sub-skills: [components](./components/SKILL.md) · [icons](./icons/SKILL.md)
> The design system lives at `src/design-system/` — import from `@design-system`.

---

## Trigger

Use this skill when:

- Styling any component (color, spacing, layout, typography)
- Tempted to write a raw `#hex` value or `px` literal
- Picking between a `@design-system` wrapper and raw Ant Design
- Adding a new design-system component

---

## Token Reference

Import tokens from `@design-system/tokens` (or the barrel `@design-system`).

### Colors — `colors`

```ts
import { colors } from '@design-system/tokens';
```

| Group | Keys | Usage |
| --- | --- | --- |
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
| --- | --- |
| `*Bg` | Tag fill, alert background, highlighted row |
| `*Border` | Outlined tag, form validation ring |
| (none) | Icon, badge dot, filled button background |
| `*Text` | Readable colored text on white — WCAG AA darker variant |

```ts
// ✅ form field error
color: ${colors.semantic.errorText};
border: 1px solid ${colors.semantic.errorBorder};
background: ${colors.semantic.errorBg};

// ✅ success badge
background: ${colors.semantic.successBg};
border: 1px solid ${colors.semantic.successBorder};
color: ${colors.semantic.successText};
```

#### Status — workflow states

```ts
const s = colors.status[order.status];
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

// ✅
padding: ${spacing[4]};   // 16px
gap: ${spacing[2]};       // 8px
margin: ${spacing[6]} 0; // 24px 0

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
const Panel = styled.div`
  width: 100%;
  @media (min-width: 768px) { width: 50%; }
  @media (min-width: 1200px) { width: 33.333%; }
`;
```

---

## When to Use Ant Design Directly

Use a `@design-system` wrapper for components listed in [components/SKILL.md](./components/SKILL.md).
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
import { colors, spacing, radius, shadow, Button, Table, AppIcons } from '@design-system';
```
