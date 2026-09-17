# Skill: Design System — Atlassian-guided Tokens & Styling

> Tailwind v4 tokens, styling rules, and Storybook workflow.
> Sub-skills: [components](./components/SKILL.md) · [icons](./icons/SKILL.md) · [feedback](./feedback/SKILL.md) · [content](./content/SKILL.md)
> **ไม่มีโฟลเดอร์ design-system แล้ว** — โทเคนอยู่ที่ `src/index.css`, class vocabulary อยู่ที่ `src/lib/styles.ts`, UI ประกอบจาก `radix-ui` ตรงในหน้าเพจ

---

## Trigger

Use this skill when:

- Styling any component (color, spacing, layout, typography)
- Tempted to write a raw `#hex` value or `px` literal
- เพิ่ม/แก้ class vocabulary ใน `src/lib/styles.ts`
- ประกอบ UI ใหม่จาก Radix primitives

---

## Architecture (migration จาก antd เสร็จแล้ว — 2026-07)

antd + Emotion ถูกถอดออกทั้งหมด (ประวัติ/เหตุผลอยู่ใน [`DESIGN-SYSTEM-MIGRATION.md`](../../../DESIGN-SYSTEM-MIGRATION.md)).

### Implementation boundary (strict)

- ใช้ **Tailwind CSS v4 เท่านั้น** สำหรับ styling: semantic utilities, variants, responsive prefixes และ `cn()`
- ห้ามใช้ Emotion, styled-components, CSS-in-JS, `css` prop, `styled()` หรือ runtime style generation
- ห้ามติดตั้ง `@emotion/*`, `@atlaskit/*` หรือคัดลอกตัวอย่าง Emotion จาก Atlassian
- ใช้ `atlassian.design` เป็นแหล่งอ้างอิงด้าน semantics, accessibility และ behavior แล้ว implement ด้วย Tailwind + Radix
- Inline `style` ใช้ได้เฉพาะ runtime data ที่ Tailwind ระบุล่วงหน้าไม่ได้ ห้ามใช้แทน utility class

| Layer | Where | Role |
| --- | --- | --- |
| **Tokens** | `src/index.css` (3 tiers) | สีทั้งหมด, เงา, radius, motion, focus ring — source of truth เดียว |
| **Class vocabulary** | `src/lib/styles.ts` | หน้าตาของ control ทุกตัว (`btn()`, `INPUT`, `TABLE_TH`, `DIALOG_*`, `dataPill()`) |
| **สูตรขอบ field** | `src/lib/fieldStyles.ts` | rest → hover → focus → open → invalid → disabled ชุดเดียวกันทุกช่องกรอก |
| **Primitives** | `radix-ui` | import ตรงในหน้าเพจ ไม่มีชั้น wrapper |
| **Toasts** | Sonner ผ่าน `notify.*` (`src/shared/utils/notify.tsx`) | อย่าเรียก `toast` ตรง |
| **Forms** | react-hook-form (+ zod เมื่อ schema ซับซ้อน) — `register`/`Controller` ตรงๆ | |
| **Table** | `<table>` เขียนเองในหน้าเพจ + `@tanstack/react-virtual` เมื่อแถวเกิน ~100 | |

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

## ของที่ลบทิ้งไปแล้ว — อย่าสร้างกลับมา

| ลบเมื่อ | อะไร | ใช้อะไรแทน |
| --- | --- | --- |
| ตอนโละ antd | `src/design-system/tokens/` (colors.ts + spacing.ts ยุค Emotion) | Tailwind semantic utilities จาก `index.css` |
| ตอนย้ายมา Radix | `src/design-system/` ทั้งโฟลเดอร์ (50 component) | ประกอบ Radix ตรงในหน้าเพจ + `src/lib/styles.ts` |
| ตอนย้ายมา Radix | `src/components/ui/` (19 shadcn wrapper) | `import { … } from 'radix-ui'` ตรงๆ |

> โค้ดเก่าที่ยัง `import … from '@design-system'` = ยังไม่ได้ย้าย — alias นี้ถูกถอดจาก vite/tsconfig แล้ว จะ build ไม่ผ่าน

---

## Responsive

ใช้ Tailwind breakpoints ตรงๆ (`sm: md: lg: xl:`) — ไม่มี primitive `Grid`/`Stack` แล้ว เขียน flex/grid ในหน้าเพจ:

```tsx
{/* การ์ดสรุป — มือถือ 1 คอลัมน์ ไต่ขึ้นตามจอ */}
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">…</div>

{/* แถวของ control */}
<div className="flex flex-wrap items-center gap-2">…</div>

{/* คอลัมน์ */}
<div className="flex flex-col gap-4">…</div>
```

**ต้องเขียน class เต็มเสมอ** — Tailwind สแกนหาสตริงตรงๆ `grid-cols-${n}` ที่ประกอบด้วย template string จะไม่ถูก emit

---

## Storybook

Storybook ยังติดตั้งอยู่ (`bun run storybook`, port 6006) แต่ **ไม่มี story เหลืออยู่แล้ว** —
story ทั้ง 51 ไฟล์ถูกลบไปพร้อมโฟลเดอร์ `src/design-system/` ตอนย้ายมาใช้ Radix

ถ้าจะเขียน story ใหม่ ให้เขียนคู่กับ component ของ feature ที่เป็นเจ้าของ
(`src/features/<feature>/components/<Name>.stories.tsx`) — ไม่ต้องตั้งหมวดกลางแบบเดิม
Tailwind CSS + font โหลดผ่าน `.storybook/preview.tsx` + `preview-head.html` ตามเดิม

---

## เพิ่มของใหม่เข้า class vocabulary

1. เปิด `src/lib/styles.ts` แล้วหาว่ามีชื่อที่ใช้แทนกันได้อยู่แล้วไหม (อย่าตั้งซ้ำ)
2. ตั้งชื่อเป็น **ค่าคงที่ตัวพิมพ์ใหญ่** (`TABLE_TH`) หรือ **ฟังก์ชันเมื่อมี variant** (`btn(variant, size)`)
3. ใช้ semantic token เท่านั้น — ห้าม `#hex` / `px` ดิบ
4. control ที่รับโฟกัสต้องมี `focus-visible` และ **ห้ามใส่ `outline-none`** (เฉพาะพื้นผิว overlay เท่านั้นที่ใส่ได้)
5. ถ้าเป็น **ตรรกะ** ไม่ใช่หน้าตา → ไปที่ `src/lib/<useXxx>.ts` เป็น hook ที่ไม่มี JSX
   และ**ห้ามคืน ref object ออกจาก hook** (ดูเหตุผลใน [components/SKILL.md](./components/SKILL.md))
6. `tsc -b` + `eslint src` ผ่าน
7. อัปเดต [components/SKILL.md](./components/SKILL.md) ถ้าเป็น pattern ใหม่
