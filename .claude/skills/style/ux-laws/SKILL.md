# Skill: Style — UX Laws

> UX laws from lawsofux.com applied to this project · Designing for all users.
> Back to parent: [style](../SKILL.md) · See also: [animation](../animation/SKILL.md)

---

## Trigger

Use this skill when:

- Designing a new page, modal, form, or component layout
- Choosing how to display feedback (loading, success, error)
- A non-obvious UX decision needs to be made
- Flagging that the current UI may confuse users

---

## UX Laws Applied to This Project

Apply these every time a screen, component, or interaction is designed.

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

### Miller's Law — 7 ± 2 Items in Working Memory

> "The average person can only hold 7 (±2) items in working memory."

- Table columns: max 7 visible — hide secondary columns behind expand or column picker
- Form sections: max 5–6 fields visible before the next section
- Sidebar menu items per group: max 5
- Bulk action options: max 4

### Cognitive Load — Minimize Mental Effort

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

### Law of Proximity — Group Related Things Together

> "Objects near each other are perceived as belonging together."

```tsx
<Row gutter={[16, 0]}>
  <Col span={12}><Form.Item name="firstName" label="First name"><Input /></Form.Item></Col>
  <Col span={12}><Form.Item name="lastName"  label="Last name" ><Input /></Form.Item></Col>
</Row>
```

### Law of Common Region — Containers Create Groups

```tsx
<Card style={{ marginBottom: spacing[4] }}>
  <FilterBar ... />
</Card>
<Card>
  <Table ... />
</Card>
```

### Von Restorff Effect — Make the Primary Action Stand Out

- One `variant="primary"` button per view — never two blue buttons side by side
- Danger/error in red, success in green — never use color for decoration only
- Empty state: single CTA button must be primary and centered

### Peak-End Rule — First and Last Impressions Define Experience

```tsx
// Specific error from backend
message.error(`Save failed — ${getErrorMessage(err)}`);

// Vague — never acceptable
message.error('An error occurred. Please try again.');
```

### Postel's Law — Be Flexible on Input, Strict on Output

```ts
const normalized = {
  ...values,
  name: values.name.trim(),
  phone: values.phone.replace(/[^0-9]/g, ''),
};
```

### Serial Position Effect — First and Last Items Are Remembered Best

- Most important table column → first (after checkbox)
- Primary action → rightmost in action button group
- Menu: most-used items first in each group
- Form: required fields first, optional at bottom

### Goal-Gradient Effect — Show Progress

- Multi-step forms: use `<Steps>` — show current step clearly
- Bulk import: show `X / Y completed` progress
- Long-running operations: show step name, not just a spinner

---

## Designing for All Users

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
if (isLoading)     return <Spinner fullPage />;
if (isError)       return <PageShell.Error message={getErrorMessage(error)} />;
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
Primary button     → ONE per view (Von Restorff)
Max menu group     → 5 items (Miller's Law)
Max table columns  → 7 visible (Miller's Law)
Error messages     → specific + actionable (Peak-End Rule)
Confirm before     → any destructive action (Cognitive Load)
Always show        → loading / empty / error states (Doherty Threshold)
```
