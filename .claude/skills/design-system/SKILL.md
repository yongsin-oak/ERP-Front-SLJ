# Skill: Design System — Tokens & Styling

> Tokens, Emotion rules, and structural guidelines.
> Sub-skills: [components](./components/SKILL.md) · [icons](./icons/SKILL.md)
> The design system lives at `src/design-system/` — import from `@design-system`.

---

## 🚧 UI Migration: Ant Design → shadcn/ui + Tailwind (in progress)

The UI layer is being migrated off Ant Design to **shadcn/ui (Radix + Tailwind v4)** for full control + smaller bundle. Strategy = **strangler**: rewrite each `@design-system` wrapper's *internals* to Tailwind/shadcn while **keeping the same prop API**, so consumers never change.

- **Tailwind v4** via `@tailwindcss/vite`; styles in `src/index.css`. shadcn primitives in `src/components/ui/` (own-the-code), `cn()` in `src/lib/utils.ts`, alias `@/* → src/*`.
- **Token architecture — 3 tiers in `src/index.css`** (this is the source for Tailwind components):
  1. **Tier 1 — primitive/global** (`:root`): raw scales `--neutral-*`, `--brand-*`, `--red/green/gold/blue-*`, `--ink-*`. Never use directly in components.
  2. **Tier 2 — semantic** (`:root` + `.dark`): meaning-based vars referencing Tier 1 — shadcn core (`--primary → var(--brand-500)`, `--background`, `--border`…) **plus app states** `--success/-bg/-border/-text`, `--warning*`, `--error*`, `--info*`.
  3. **Tier 3 — `@theme inline`**: maps semantic → Tailwind utilities, so `bg-primary`, `hover:bg-primary-hover`, `active:bg-primary-active`, `text-success`, `bg-success-bg`, `border-divider`, `bg-control-off`, `bg-data-volcano-bg` etc. exist.

  **Rules (strict):**
  - **No hardcoded colors in components** — no `#hex`, no `bg-black/25`, no `text-white`. Use a semantic token (`text-primary-foreground` for white-on-brand, `bg-control-off` for an off track, etc.).
  - **Components consume semantic (Tier 3) only** — never reference Tier 1 primitives directly (no `bg-[var(--neutral-300)]`). If a need isn't covered, **add a semantic token** (and a primitive if the hue is new) rather than reaching for a primitive.
  - **Every primitive must be referenced** by ≥1 semantic (no orphan globals). Conversely keep semantics comprehensive so primitives never leak into components.
  - **Declare all interaction states as tokens**: `--primary-hover/-active`, `--destructive-hover/-active`, `--accent` (hover surface) / `--accent-active` (pressed), `--disabled` / `--disabled-bg`, `--control-off`, `--divider`.
  - Dynamic class maps must use **literal strings** (e.g. `success: 'bg-success-bg border-success-border text-success-text'`) so Tailwind's scanner emits them. Tailwind only emits *used* utilities — a declared-but-unused token (e.g. `border-divider`) won't appear in the build until a component uses it; that's expected.
  - Categorical/data-viz colors (antd preset palette: `Tag color="blue|volcano|…"`) are tokenized too as `--data-<hue>-{bg,border,text}` and consumed via literal classes — **not** inline hex.
  - ⚠️ CSS can't import `.ts` — Tier 1 hex **mirrors `colors.ts`** (still feeding antd); change both until antd is gone.
- **Font**: Bai Jamjuree kept via `--font-sans` (not the preset's Inter).
- **Icons**: shadcn configured with `iconLibrary: tabler` (matches `@tabler/icons-react`).
- **Migrated so far**: `Button`, `Tag`/`StatusTag`, `Badge`, `Switch`, `Alert`, `Card` (Tailwind, no antd, API-compatible). `Button` accepts antd-style `variant`/`size`/`loading`/`icon`/`block`/`htmlType`.
- **Still antd** (hard pieces, do with care): `Input` (+Search/Password/TextArea), `Select`, `Table` (→ TanStack Table + react-virtual), `DatePicker`, `Modal`/`Drawer`, notifications. Emotion is removed per-component as migrated; goal is to drop both antd + Emotion.
- **Storybook** (`bun run storybook` / `build-storybook`): stories co-located as `<Component>.stories.tsx`. Add a story when migrating a component. Tailwind CSS + Bai Jamjuree are loaded via `.storybook/preview.tsx` + `preview-head.html`.

When migrating a component: keep the exported prop names, run `tsc -b` (catches consumer breakage), add/update its `.stories.tsx`, then `bun run build`.

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
