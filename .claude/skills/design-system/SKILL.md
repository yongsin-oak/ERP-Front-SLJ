# Skill: Design System — Atlassian-guided Tokens & Styling

> Tailwind v4 tokens, styling rules, and Storybook workflow.
> Sub-skills: [components](./components/SKILL.md) · [icons](./icons/SKILL.md) · [feedback](./feedback/SKILL.md) · [content](./content/SKILL.md)
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

### Implementation boundary (strict)

- ใช้ **Tailwind CSS v4 เท่านั้น** สำหรับ styling: semantic utilities, variants, responsive prefixes และ `cn()`
- ห้ามใช้ Emotion, styled-components, CSS-in-JS, `css` prop, `styled()` หรือ runtime style generation
- ห้ามติดตั้ง `@emotion/*`, `@atlaskit/*` หรือคัดลอกตัวอย่าง Emotion จาก Atlassian
- ใช้ `atlassian.design` เป็นแหล่งอ้างอิงด้าน semantics, accessibility และ behavior แล้ว implement ด้วย Tailwind + Radix + DS wrappers ของโปรเจกต์
- Inline `style` ใช้ได้เฉพาะ runtime data ที่ Tailwind ระบุล่วงหน้าไม่ได้ ห้ามใช้แทน utility class

| Layer | Where | Role |
| --- | --- | --- |
| **Tokens** | `src/index.css` (3 tiers) | สีทั้งหมด, เงา, radius, motion, focus ring — source of truth เดียว |
| **Primitives** | `src/components/ui/*` | shadcn-style own-the-code, Radix-based (dialog, popover, checkbox, select, tabs, tooltip, sonner…) |
| **ERP wrappers** | `src/design-system/components/*` | API ระดับแอป (ส่วนใหญ่คง antd-compatible surface) — export ผ่าน `@design-system` |
| **Toasts** | Sonner ผ่าน `notify.*` (`src/shared/utils/notify.tsx`) | อย่าเรียก `toast` ตรง |
| **Forms** | react-hook-form + zod ผ่าน DS `Form` (antd-compatible surface: `Form.useForm`/`Form.Item`/rules) | |
| **Table** | DS `Table` (antd-like API + `@tanstack/react-virtual` เมื่อส่ง `virtual` + `scroll.y`) | |

- `cn()` จาก `src/lib/utils.ts` (clsx + tailwind-merge) — ใช้ประกอบ className เสมอ
- Font: Bai Jamjuree ผ่าน `--font-sans`
- Icons: `AppIcons` เท่านั้น — ดู [icons/SKILL.md](./icons/SKILL.md)

---

## Design principles — Atlassian Design System adapted for SLJ

ใช้ [Atlassian foundations](https://atlassian.design/foundations) เป็นหลักอ้างอิงทุกหัวข้อ แล้ว map เข้าสู่ brand และ token contract ของ SLJ โดยไม่ copy package หรือ implementation ของ Atlassian:

1. เลือก token ตามความหมาย ไม่ใช่ค่าสีที่ดูคล้าย ([design tokens](https://atlassian.design/foundations/tokens/design-tokens/))
2. ใช้ semantic state และตรวจ WCAG AA ([color](https://atlassian.design/foundations/color))
3. ใช้ spacing scale และจัดกลุ่มตามความสัมพันธ์ ([spacing](https://atlassian.design/foundations/grid-beta/applying-grid))
4. รักษา heading hierarchy; 12px ใช้เฉพาะ meta/fine print ([typography](https://atlassian.design/foundations/typography/applying-typography))
5. ประกอบ layout ด้วย `Grid`, `Stack`, `Inline` ([layout primitives](https://atlassian.design/foundations/spacing/primitives/))
6. ใช้ surface, border และ overlay สื่อระดับความลึก; เงาสงวนให้ floating layer
7. ทุก control ต้องมี hover, pressed, focus, disabled, invalid และ loading ที่สม่ำเสมอ

ค่าภาพเฉพาะ SLJ ยังคงใช้ neutral gray, brand red, geometry contract ด้านล่าง และ mono สำหรับรหัส/ตัวเลข

---

## Token Architecture — 3 tiers ใน `src/index.css`

1. **Tier 1 — primitive** (`:root` + `.dark`): raw scales `--gray-0…900` (เทาแท้ hue 0 · dark override กลับด้านทั้งสเกล), `--brand-*` (แดง #e0282e), `--red/green/gold/blue-*` + data hues, `--white/--black`, `--scrim`, `--overlay-hover/-active`. **ห้ามใช้ตรงใน component**
   - dark mode ของ hue ทุกตัวคำนวณด้วย `color-mix(in oklab, …)` จาก `-500` — เพิ่ม hue ใหม่ต้องมี `-500` ด้วย
2. **Tier 2 — semantic** (`:root` + `.dark`): surfaces (`--canvas`, `--background`, `--surface-100/200/300`, `--overlay`, `--control`), foreground 4 ระดับ (`--foreground`, `-light`, `-lighter`, `-muted`), borders 5 ระดับ (`--border-muted`, `--border`, `--border-strong`, `--border-stronger`, `--border-control`), interaction (`--accent`, `--accent-overlay`, `--primary-hover/-active`, `--disabled*`), สถานะ `--success/-bg/-border/-text` (×warning/error/info)
3. **Tier 3 — `@theme inline`**: map semantic → Tailwind utilities

### Rules (strict)

- **No hardcoded colors** — ห้าม `#hex`, `rgba()` ใน `shadow-[…]`, `bg-black/25`, `text-white` ใน component → ใช้ semantic token
- **Components consume Tier 3 only** — ห้าม `bg-[var(--gray-300)]`; ถ้า token ไม่พอ ให้**เพิ่ม semantic token ใหม่** ไม่ใช่ดึง primitive
- **Focus: อย่าใส่ ring สีแบรนด์ และอย่าใส่ `outline-none` บน control ที่โฟกัสได้** — `index.css` มี `:focus-visible { outline: 2px solid var(--ring); outline-offset: 1px }` เป็น global แล้ว ปล่อยให้มันทำงานเอง
  ใส่ `outline-none` เฉพาะ "พื้นผิว" ที่ไม่ควรมีขอบโฟกัส (dialog/popover/select content)
- **Dynamic class maps ต้องเป็น literal strings** เพื่อให้ Tailwind scanner เห็น — ห้ามประกอบ class ด้วย template string
- **ใช้รูป canonical ของ Tailwind เสมอ** — `h-8.5` ไม่ใช่ `h-[34px]`, `duration-(--duration-fast)` ไม่ใช่ `duration-[var(--duration-fast)]`, `data-disabled:` ไม่ใช่ `data-[disabled]:` (linter จะเตือน `suggestCanonicalClasses`)
- **ห้าม `font-bold`** — หนักสุดที่ `font-medium` (semibold เฉพาะ heading ระดับหน้า)
- Spacing/size ใช้ Tailwind scale — ห้าม inline `style={{ padding: 16 }}`
- ทุกหัวข้อใหม่ต้องตรวจ foundation/component ที่เกี่ยวข้องบน `atlassian.design` ก่อน แล้วนำมาใช้ผ่าน semantic Tailwind token ของโปรเจกต์

### Geometry contract (ทุก component ต้องใช้ค่าเดียวกัน)

```
radius     rounded-sm 4 · rounded-md 6 (control) · rounded-lg 8 (แผง/dialog) · rounded-xl 12 · rounded-full (pill)
control h  xs h-6.5(26) · sm h-7.5(30) · md h-8.5(34, default) · lg h-9.5(38)
control px xs px-2 · sm px-2.5 · md px-3 · lg px-3.5
icon       xs size-3 · sm/md size-3.5 · lg size-4      ← default คือ 14px ไม่ใช่ 16px
font       base text-sm · meta text-xs · heading text-base font-medium
transition transition-colors duration-(--duration-fast)
```

**ข้อยกเว้นเดียวของ control h — CTA หลักบนหน้าที่ Operator/Warehouse ใช้ทุกกะ**
UX bar บังคับ touch target ≥ 44px (`project-context` §5.5) ซึ่งชนกับ lg = 38px ตรงๆ
กรณีนี้ให้ `size="large"` แล้วทับด้วย `className="h-11"` **เฉพาะปุ่ม submit เต็มความกว้าง**
ของหน้า standalone (เช่น `LoginPage`) — ห้ามลามไปปุ่มใน app chrome/ตาราง/โมดัล
input/select ยังคง `size="large"` ตามสัญญาเดิม ไม่ต้องขยาย

### Common utilities cheat sheet

```
พื้นหน้าเพจ        bg-canvas             แผง/การ์ด/input   bg-background · bg-control
ชั้นซ้อนในแผง      bg-surface-100/200/300  overlay ลอย       bg-overlay
ตัวหนังสือ 4 ระดับ  text-foreground → -light → -lighter → -muted
เส้น 5 ระดับ       border-border-muted → border-border → -strong → -stronger · input ใช้ border-control
hover พื้นทึบ      hover:bg-surface-200   hover ทับพื้นมีสี  hover:bg-accent-overlay
เงา                แผง/ตาราง = ไม่มี · dropdown/dialog/toast = shadow-overlay
สถานะ              text-success-text bg-success-bg border-success-border (×warning/error/info)
ข้อมูลเชิงรหัส/ตัวเลข  font-mono tabular-nums
```

---

## Legacy TS tokens — ลบแล้ว

`src/design-system/tokens/` (colors.ts + spacing.ts ยุค antd/Emotion) ถูกลบทิ้งพร้อม barrel export ตอนโละเป็น Supabase — ใช้ Tailwind semantic utilities เท่านั้น

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
- Convention: `title: 'Design System/<หมวด>/<Name>'`, `tags: ['autodocs']`, `satisfies Meta<typeof X>`, เนื้อหาตัวอย่างเป็นภาษาไทยตามโดเมน ERP, ไอคอนผ่าน `AppIcons`
- **หมวดใน Storybook — เพิ่ม component ใหม่ต้องเลือกหมวดให้ตรง ห้ามตั้งหมวดใหม่เองโดยไม่อัปเดตตารางนี้**

  | หมวด | ใส่อะไร | ตัวอย่าง |
  | --- | --- | --- |
  | `Actions` | สิ่งที่ผู้ใช้ "กดแล้วเกิดอะไรขึ้น" | Button · ActionCell · ActionMenu · DeleteConfirmButton · BulkSelectionBar |
  | `Inputs` | ทุกอย่างที่รับค่าจากผู้ใช้ รวม Form/Field/FilterBar | Input · Select · DatePicker · Checkbox · Switch · Segmented · InlineEdit |
  | `Display` | แสดงข้อมูลอย่างเดียว ไม่รับ input | Table · TableCell · Tag · Badge · Card · StatsCard · Typography |
  | `Feedback` | บอกสถานะ/ผลลัพธ์/ความว่างเปล่า | Alert · Banner · Spinner · Tooltip · Empty |
  | `Overlay` | ลอยทับหน้าและกินโฟกัส | Modal · FormModal · Drawer · ConfirmDrawer |
  | `Layout` | จัดวางล้วน ไม่มีความหมายเชิงข้อมูล | Grid · Stack · Divider · PageHeader · PageShell · Tabs |
  | `Data Import` | flow นำเข้าไฟล์ Excel/CSV | DropZoneSheet · SheetImportModal · SheetColumnMapper · SheetTable |

  เส้นแบ่งที่มักตัดสินผิด: `Tooltip` = Feedback (ไม่ใช่ Overlay เพราะไม่กินโฟกัส) · `Empty` = Feedback (ไม่ใช่ Display เพราะสื่อ "ไม่มีข้อมูล") · `Divider` = Layout (ไม่ใช่ Display)
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
