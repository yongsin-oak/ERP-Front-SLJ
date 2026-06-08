# Skill: Animation & UX Design

> Motion that communicates intent · UX principles from lawsofux.com · Designed for every user
> Goal: zero cognitive load — even users with minimal computer experience must feel confident.

---

## Trigger

Use this skill when:
- Adding transitions, hover effects, or enter/exit animations
- Designing a new page, modal, form, or component layout
- Choosing how to display feedback (loading, success, error)
- A non-obvious UX decision needs to be made
- Flagging that the current UI may confuse users

---

## Part 1 — Easing Functions

### The Rule: Easing Reflects Physics

Every element in real life accelerates and decelerates. The easing you pick should match what the element is **doing**.

| Easing | Curve | When to Use | When NOT to Use |
|---|---|---|---|
| `ease-out` | Fast → Slow | **Entering** (modal open, dropdown show, slide in) | Exiting, spinning |
| `ease-in` | Slow → Fast | **Exiting** (modal close, toast dismiss, slide out) | Entering (feels sluggish) |
| `ease-in-out` | Slow → Fast → Slow | **Moving** between positions (drag, reorder, progress step) | Short <150ms — too subtle to notice |
| `linear` | Constant | **Continuous/looping** (spinner, skeleton shimmer, progress bar fill) | Enter/exit — feels robotic |
| `ease` *(CSS default)* | Slight ease-in-out | Avoid — not intentional, replace with one of the above | — |

### Duration Guidelines

Respect **Doherty Threshold** (< 400ms keeps users in flow):

| Interaction | Duration | Notes |
|---|---|---|
| Hover, focus ring | `100ms` | Too short to ease — use `linear` or `ease-out` |
| Dropdown, tooltip | `150ms ease-out` | Open fast, close with `ease-in` |
| Modal, drawer open | `220ms ease-out` | |
| Modal, drawer close | `180ms ease-in` | Close slightly faster — feels snappy |
| Accordion expand | `200ms ease-in-out` | Height + opacity together |
| Page/route transition | `250ms ease-out` | Fade or slide in |
| Skeleton shimmer | `1400ms linear` | Infinite loop |
| Spinner | `800ms linear` | Infinite loop |

> Never animate beyond 400ms for interactive UI. Users wait for the animation to finish — any longer feels broken.

### What to Animate — GPU-Accelerated Only

Animate only these CSS properties — they do NOT trigger layout reflow:

```ts
// Safe to animate
opacity
transform   // translate, scale, rotate
filter      // blur, brightness

// NEVER animate — triggers layout
width, height
margin, padding
top, left (use transform: translate instead)
max-height (only acceptable workaround for accordion — keep <300ms)
```

### Emotion Keyframe Patterns

```tsx
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { colors } from '@design-system/tokens';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fadeOut = keyframes`
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(8px); }
`;

const shimmer = keyframes`
  from { background-position: -200% 0; }
  to   { background-position:  200% 0; }
`;

const pop = keyframes`
  0%   { transform: scale(1); }
  50%  { transform: scale(1.08); }
  100% { transform: scale(1); }
`;

// Usage
const Card = styled.div`
  animation: ${fadeIn} 220ms ease-out;
`;

const SkeletonBar = styled.div`
  background: linear-gradient(
    90deg,
    ${colors.neutral[100]} 25%,
    ${colors.neutral[50]}  50%,
    ${colors.neutral[100]} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1400ms linear infinite;
  border-radius: 4px;
  height: 16px;
`;
```

### Reduced Motion — Always Respect

```tsx
const AnimatedEl = styled.div`
  animation: ${fadeIn} 220ms ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;
```

Add to every component that has `animation` or `transition`.

### Transition Shorthand Reference

```ts
transition: background 100ms ease-out, box-shadow 100ms ease-out;  // hover
transition: opacity 150ms ease-out;                                  // show/hide overlay
transition: width 220ms ease-in-out;                                 // sidebar collapse
animation: ${fadeIn} 220ms ease-out;                                 // appear from bottom
```

---

## Part 2 — UX Laws (lawsofux.com) Applied to This Project

Apply these every time a screen, component, or interaction is designed.

---

### Fitts's Law — Make Important Targets Large and Reachable

> "The time to acquire a target is a function of its distance and size."

- Primary CTA (Save, Create, Confirm) → `variant="primary"` Button, full-width on mobile
- Destructive actions (Delete) → keep small and far from primary actions — never adjacent
- Table row actions → icon buttons (ghost), min 32×32px, grouped at far right
- Mobile sidebar items → min 48px height per menu item

```tsx
// Primary action dominates
<Button variant="primary" block>Save Order</Button>

// Danger is separated from confirm
<Space>
  <Button variant="ghost" onClick={onClose}>Cancel</Button>
  <Button variant="primary" onClick={onSave}>Save</Button>
</Space>
```

---

### Hick's Law — Fewer Choices = Faster Decisions

> "Decision time grows with the number and complexity of choices."

- Menu groups: already structured (Order / Inventory / Management / System) ✅
- Forms: show only relevant fields; hide advanced options in a collapsed section
- Dropdowns with >10 items: always `showSearch` on Ant Design Select
- Status filters: use a tab bar (Active / All / Archived), not a dropdown with 5+ options

```tsx
<Select showSearch filterOption={...} placeholder="Search product..." />

<Tabs items={[
  { key: 'active', label: 'Active' },
  { key: 'all',    label: 'All' },
]} />
```

---

### Jakob's Law — Follow Conventions Users Already Know

> "Users prefer your product to work the same way as all the other sites they already know."

- Confirm before delete → `DeleteConfirmButton` or `Modal.confirm`
- Table pagination → bottom-right (Ant Design default)
- Form error → below the field (Ant Design Form.Item default)
- Primary button → right side of modal footer (cancel left, confirm right)
- Search input → top-left of table toolbar

```tsx
// Conventional modal footer (cancel left, confirm right)
<Modal
  footer={
    <Space>
      <Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button variant="primary" onClick={onSave} loading={isMutating}>Save</Button>
    </Space>
  }
/>
```

---

### Miller's Law — 7 ± 2 Items in Working Memory

> "The average person can only hold 7 (±2) items in working memory."

- Table columns: max 7 visible — hide secondary columns behind expand or column picker
- Form sections: max 5–6 fields visible before the next section
- Sidebar menu items per group: max 5
- Bulk action options: max 4

---

### Cognitive Load — Minimize Mental Effort

> "The amount of mental resources needed to understand and interact with an interface."

1. **Labels + icons** — icon-only buttons require guessing. Pair every icon with text on primary actions
2. **Progressive disclosure** — show only what is needed now; hide advanced options
3. **Inline validation** — show errors as users type, not only on submit
4. **Consistent terminology** — pick one word per concept and use it everywhere
5. **Status is always visible** — current page highlighted in sidebar

```tsx
// Icon + label for primary actions
<Button variant="primary" icon={<PlusOutlined />}>New Order</Button>

// Icon only is acceptable for secondary row actions
<Button variant="ghost" icon={<EditOutlined />} size="small" />
```

---

### Doherty Threshold — Response < 400ms

> "Productivity soars when neither the user nor the system has to wait."

- Mutation: show `loading` on Button immediately
- Optimistic updates for toggle/status changes
- Skeleton loaders for initial data fetch — never blank white screens
- `placeholderData: (prev) => prev` on all paginated queries

```tsx
<Button variant="primary" loading={mutation.isPending} onClick={handleSave}>
  Save
</Button>

{isLoading ? <SkeletonTable rows={5} /> : <Table dataSource={data} ... />}
```

---

### Law of Proximity — Group Related Things Together

> "Objects near each other are perceived as belonging together."

```tsx
// Related fields in the same Row
<Row gutter={[16, 0]}>
  <Col span={12}><Form.Item name="firstName" label="First name"><Input /></Form.Item></Col>
  <Col span={12}><Form.Item name="lastName"  label="Last name" ><Input /></Form.Item></Col>
</Row>
```

---

### Law of Common Region — Containers Create Groups

> "Elements sharing a defined area are perceived as grouped."

```tsx
// Filter card + table card = visually separate sections
<Card style={{ marginBottom: spacing[4] }}>
  <FilterBar ... />
</Card>
<Card>
  <Table ... />
</Card>
```

---

### Von Restorff Effect — Make the Primary Action Stand Out

> "The item that differs from its group is most likely to be remembered."

- One `variant="primary"` button per view — never two blue buttons side by side
- Danger/error in red, success in green — never use color for decoration only
- Empty state: single CTA button must be primary and centered

---

### Peak-End Rule — First and Last Impressions Define Experience

> "People judge an experience by its peak and its end."

- **Success feedback** (end of a task): `message.success('Order saved')` — clear and immediate
- **Error messages**: specific — "Product name already exists" not "An error occurred"
- **Empty state** (first view with no data): clear call-to-action, not just "No data"

```tsx
// Specific error from backend
message.error(`Save failed — ${getErrorMessage(err)}`);

// Vague — never acceptable
message.error('An error occurred. Please try again.');
```

---

### Postel's Law — Be Flexible on Input, Strict on Output

> "Accept varied input, send conservative output."

```ts
const normalized = {
  ...values,
  name: values.name.trim(),
  phone: values.phone.replace(/[^0-9]/g, ''),
};
```

---

### Serial Position Effect — First and Last Items Are Remembered Best

> "Users best remember the first and last items in a series."

- Most important table column → first (after checkbox)
- Primary action → rightmost in action button group
- Menu: most-used items first in each group
- Form: required fields first, optional at bottom

---

### Goal-Gradient Effect — Show Progress

> "Motivation increases as users approach a goal."

- Multi-step forms: use `<Steps>` — show current step clearly
- Bulk import: show `X / Y completed` progress
- Long-running operations: show step name, not just a spinner

---

## Part 3 — Designing for All Users

These rules ensure the ERP is usable by Operator and Warehouse staff with minimal computer experience.

### 1. Always Show What Will Happen Before It Happens

```tsx
Modal.confirm({
  title: 'Confirm delete',
  content: `Delete "${record.name}"? This action cannot be undone.`,
  okText: 'Delete',
  okType: 'danger',
  cancelText: 'Cancel',
  onOk: () => deleteMutation.mutate(record.id),
});
```

### 2. Error Messages Must Say What To Do

```ts
// Actionable
'Enter at least 1 unit quantity'
'Username or password is incorrect. Please try again.'

// Never
'Validation failed'
'Error 400: Bad Request'
```

### 3. Never Leave Users on a Blank Screen

Every page must handle: loading / empty / error.

```tsx
if (isLoading)   return <Spinner fullPage />;
if (isError)     return <PageShell.Error message={getErrorMessage(error)} />;
if (!data?.length) return (
  <Empty
    description="No products in inventory"
    extra={<Button variant="primary" onClick={onAdd}>Add first product</Button>}
  />
);
```

### 4. Keyboard Navigation & Tab Order

- Tab moves through fields top→bottom, left→right
- Primary action reachable via Enter (`htmlType="submit"`)
- Modal: focus enters automatically on open, ESC closes

```tsx
<Form onFinish={handleSubmit}>
  <Form.Item name="name"><Input /></Form.Item>
  <Button htmlType="submit" variant="primary">Save</Button>
</Form>
```

### 5. Mobile Touch Targets ≥ 44px

```tsx
const MobileActionBtn = styled(Button)`
  min-height: 44px;
  min-width: 44px;
`;
```

---

## Warning Triggers

```
> Warning: Animating a layout-triggering property (width/height/margin/padding)
> Why: Forces browser to reflow every frame — causes jank on low-end devices
> Fix: Use transform (translate/scale) or opacity instead

> Warning: Animation duration exceeds 400ms on an interactive element
> Why: Violates Doherty Threshold — users wait for the animation before proceeding
> Fix: Keep interactive animations <= 300ms

> Warning: Using ease-in for an entering element (or ease-out for an exiting one)
> Why: Feels physically wrong — entering should decelerate, exiting should accelerate
> Fix: Swap the easing function

> Warning: No prefers-reduced-motion check on animated component
> Why: Some users experience motion sickness from animations
> Fix: Add @media (prefers-reduced-motion: reduce) { animation: none }

> Warning: Generic error message shown to user (e.g. "An error occurred")
> Why: Users don't know what went wrong or what to do — they abandon the task
> Fix: Use getErrorMessage(err) from @lib to extract the backend message

> Warning: Page/component has no loading, empty, or error state
> Why: Blank screen on load is confusing for non-technical users
> Fix: Add Spinner for loading, Empty with CTA for empty, error message for errors
```

---

## Quick Reference

```
ENTERING element   → ease-out
EXITING element    → ease-in
MOVING element     → ease-in-out
LOOPING animation  → linear

Micro hover        → 100ms
Show/hide UI       → 150–220ms
Page transition    → 250ms
MAX interactive    → 400ms  (Doherty Threshold)

Animate ONLY: opacity · transform · filter
NEVER animate: width · height · margin · padding

Primary button     → ONE per view (Von Restorff)
Max menu group     → 5 items (Miller's Law)
Max table columns  → 7 visible (Miller's Law)
Error messages     → specific + actionable (Peak-End Rule)
Confirm before     → any destructive action (Cognitive Load)
Always show        → loading / empty / error states (Doherty Threshold)
```
