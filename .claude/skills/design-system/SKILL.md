# Skill: Design System — Tokens & Styling

> Tailwind v4 tokens, styling rules, and Storybook workflow.
> Sub-skills: [components](./components/SKILL.md) · [icons](./icons/SKILL.md)
> The design system lives at `src/design-system/` — import from `@design-system`.

---

## Trigger

Use this skill when:

- Styling any component (color, spacing, layout, typography)
- Tempted to write a raw `#hex` value or `px` literal
- Adding or modifying a design-system component
- Writing or updating a Storybook story

---

## Architecture (migration จาก antd เสร็จแล้ว — 2026-07)

antd + Emotion ถูกถอดออกทั้งหมด (ประวัติ/เหตุผลอยู่ใน [`DESIGN-SYSTEM-MIGRATION.md`](../../../DESIGN-SYSTEM-MIGRATION.md)).

| Layer | Where | Role |
| --- | --- | --- |
| **Tokens** | `src/index.css` (3 tiers) | สีทั้งหมด, เงา, radius, motion — source of truth เดียว |
| **Primitives** | `src/components/ui/*` | shadcn-style own-the-code, Radix-based (dialog, popover, checkbox, select, tabs, tooltip, sonner…) |
| **ERP wrappers** | `src/design-system/components/*` | API ระดับแอป (ส่วนใหญ่คง antd-compatible surface) — export ผ่าน `@design-system` |
| **Toasts** | Sonner ผ่าน `notify.*` (`src/shared/utils/notify.tsx`) | อย่าเรียก `toast` ตรง |
| **Forms** | react-hook-form + zod ผ่าน DS `Form` (antd-compatible surface: `Form.useForm`/`Form.Item`/rules) | |
| **Table** | DS `Table` (antd-like API + `@tanstack/react-virtual` เมื่อส่ง `virtual` + `scroll.y`) | |

- `cn()` จาก `src/lib/utils.ts` (clsx + tailwind-merge) — ใช้ประกอบ className เสมอ
- Font: Bai Jamjuree ผ่าน `--font-sans`
- Icons: `AppIcons` เท่านั้น — ดู [icons/SKILL.md](./icons/SKILL.md)

---

## Token Architecture — 3 tiers ใน `src/index.css`

1. **Tier 1 — primitive** (`:root`): raw scales `--neutral-*` (0–900 cool-gray), `--brand-*` (แดง #e0282e), `--red/green/gold/blue-*`, `--ink-*`. **ห้ามใช้ตรงใน component**
2. **Tier 2 — semantic** (`:root` + `.dark`): shadcn core (`--primary`, `--background`, `--border`…) + app states `--success/-bg/-border/-text`, `--warning*`, `--error*`, `--info*`, interaction states (`--primary-hover/-active`, `--accent`, `--disabled*`, `--divider`, `--control-off`), `--canvas`, `--scrim`, `--border-strong`, `--primary-subtle`
3. **Tier 3 — `@theme inline`**: map semantic → Tailwind utilities: `bg-canvas`, `bg-primary`, `hover:bg-primary-hover`, `text-success-text`, `bg-success-bg`, `border-divider`, `shadow-{xs,sm,md,lg,xl,overlay}`, `ease-{out,in-out,spring}`, `bg-data-volcano-bg` ฯลฯ

### Rules (strict)

- **No hardcoded colors** — ห้าม `#hex`, `bg-black/25`, `text-white` ใน component → ใช้ semantic token (`text-primary-foreground`, `bg-scrim`, …)
- **Components consume Tier 3 only** — ห้าม `bg-[var(--neutral-300)]`; ถ้า token ไม่พอ ให้**เพิ่ม semantic token ใหม่** ไม่ใช่ดึง primitive
- **Interaction states เป็น token หมด**: hover/active/disabled มีคู่ token แล้ว — อย่า hardcode
- **Dynamic class maps ต้องเป็น literal strings** (เช่น `success: 'bg-success-bg border-success-border text-success-text'`) เพื่อให้ Tailwind scanner เห็น — ห้ามประกอบ class ด้วย template string (`grid-cols-${n}` จะไม่ถูก emit)
- Categorical/data-viz palette ใช้ `--data-<hue>-{bg,border,text}` ผ่าน literal classes
- Spacing/size ใช้ Tailwind scale (`px-3`, `gap-2`, `size-9`) — ถือเป็น token; ห้าม inline `style={{ padding: 16 }}`

### Common utilities cheat sheet

```
พื้นหลังหน้า      bg-canvas          ตัวหนังสือหลัก/รอง  text-foreground / text-muted-foreground
พื้น card/surface  bg-card bg-popover  ตัวหนังสือจาง      text-foreground-subtle
เส้นแบ่ง           border-divider      เส้นขอบ           border-border / border-strong
hover ผิว          hover:bg-accent     แถว/ปุ่ม pressed   active:bg-accent-active
โฟกัส              focus-visible:ring-[3px] focus-visible:ring-ring/20
เงา                shadow-xs … shadow-overlay             motion  ease-out duration-150
สถานะ              text-success-text bg-success-bg border-success-border (×warning/error/info)
```

---

## Legacy TS tokens — deprecated

`src/design-system/tokens/colors.ts` + `spacing.ts` เป็นของยุค antd/Emotion — **ห้ามใช้ในโค้ดใหม่** (ยังเหลือ consumer เก่า ~10 ไฟล์ รอ migrate แล้วลบ) ใช้ Tailwind semantic utilities แทนเสมอ

---

## Responsive

ใช้ Tailwind breakpoints ตรงๆ (`sm: md: lg: xl:`) หรือ primitive `Grid`/`Stack` จาก `@design-system`:

```tsx
<Grid cols={4} gap={4}>…</Grid>   {/* cols = จำนวนคอลัมน์สูงสุด — ladder มือถือ 1 → sm 2 → lg 4 ในตัว */}
<Stack gap={4}>…</Stack>  <Inline gap={2} align="center">…</Inline>
```

(`Grid` ใช้ class map แบบ literal ภายใน — ถ้าเพิ่มค่า cols/breakpoint ใหม่ต้องเพิ่มใน map ของ component ห้าม template string)

---

## Storybook

- รัน `bun run storybook` (port 6006) · build `bun run build-storybook`
- Story อยู่คู่ component: `src/design-system/components/<Name>/<Name>.stories.tsx`
- Convention: `title: 'Design System/<Name>'`, `tags: ['autodocs']`, `satisfies Meta<typeof X>`, เนื้อหาตัวอย่างเป็นภาษาไทยตามโดเมน ERP, ไอคอนผ่าน `AppIcons`
- **ทุก component ใหม่/แก้ API ต้องมี/อัปเดต story** — reviewer ดูของจริงจาก Storybook
- Tailwind CSS + font โหลดผ่าน `.storybook/preview.tsx` + `preview-head.html`

---

## Adding a New Design-System Component

1. สร้าง `src/design-system/components/<Name>/index.tsx` — named export เท่านั้น
2. ใช้ primitive จาก `src/components/ui/*` (Radix) เป็นฐานถ้ามี
3. Semantic tokens เท่านั้น (กติกาด้านบน) + `cn()` + `focus-visible` ring + aria ครบ
4. Async action ใน overlay ให้รองรับ Promise (ดู `Modal.onOk` / `DeleteConfirmButton.onConfirm` เป็นแบบ)
5. Export จาก `src/design-system/index.ts`
6. เขียน `<Name>.stories.tsx` + `tsc -b` ผ่าน
7. อัปเดต [components/SKILL.md](./components/SKILL.md) ถ้าเป็น pattern ใหม่
