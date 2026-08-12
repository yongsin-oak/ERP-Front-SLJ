# Supabase Design System — แผนโละ & แบ่งงาน (Claude ↔ Codex)

> สถานะ: **Phase 0 ✅ merged · เลน A (Claude) ✅ เสร็จ · เลน B (Codex) ⬜ เริ่มได้เลย**
> เป้าหมาย: เปลี่ยนหน้าตาทั้งแอปให้เป็นภาษา Supabase โดย **ไม่แก้ API / props / call site ใดๆ**
> ขอบเขต: `src/index.css` + `src/components/ui/*` (18) + `src/design-system/components/*` (50) + app chrome

---

## 0. Decisions (ล็อกแล้ว — ห้ามเปลี่ยนระหว่างทาง)

| เรื่อง | ค่า | ผลต่อการทำงาน |
| --- | --- | --- |
| **Brand** | คงแดง SLJ `#e0282e` | Supabase ให้ทุกอย่างยกเว้นสีแบรนด์ — neutral/surface/border/geometry เป็น Supabase ล้วน |
| **Theme** | Light เป็นหลัก + Dark เท่าเทียม | `.dark` ต้องมี token ครบทุกตัวที่ `:root` มี — ห้ามเหลือ `oklch()` เดิมที่ไม่ตรงชุด |
| **Scope** | โละถึง DS component ทุกตัว (50) | ทุกไฟล์ต้องถูกอ่านและ restyle จริง ไม่ใช่แค่รอ token ไหลลงมา |
| **API** | **แช่แข็ง** | ห้ามเพิ่ม/ลบ/เปลี่ยนชื่อ prop, ห้ามเปลี่ยน default ที่มีผลต่อ behavior, ห้ามแตะ logic |
| **Deps** | ห้ามเพิ่มไลบรารีใหม่ | ทุกอย่างทำได้ด้วย Tailwind v4 + Radix ที่มีอยู่ |

---

## 1. อะไรทำให้ "ดูเป็น Supabase" (7 ข้อ — ทั้งสองเลนต้องยึดเหมือนกัน)

ถ้าไม่ครบ 7 ข้อนี้ ต่อให้เปลี่ยนสีก็ยังไม่ใช่ Supabase

1. **Neutral เป็นเทาแท้ ไม่อมน้ำเงิน** — ของเดิมเป็น Stripe cool-gray (`#f6f9fc`, `#1a1f36` = navy ink) ต้องกลายเป็นเทากลาง (`#fcfcfc`, `#171717`) นี่คือความต่างที่ตาเห็นชัดที่สุด
2. **ความลึกมาจาก "เส้น + ชั้นพื้นผิว" ไม่ใช่เงา** — card/panel/table = `border` + `bg-surface-100` เงาเกือบเป็นศูนย์ เงาจริงมีเฉพาะ overlay (dialog/dropdown/popover)
3. **Radius 6px** — `--radius: 6px` ทุกอย่างคม ไม่มนแบบ 8–12px เดิม (ยกเว้น pill: badge/tag/avatar)
4. **Geometry เตี้ยและแน่น** — ปุ่ม/อินพุตสูง 26/30/34/38px, `text-sm` เป็น base, `text-xs` สำหรับ meta, padding แนวตั้งน้อย
5. **Focus ring เป็นเทา ไม่ใช่สีแบรนด์** — Supabase ใช้ `outline` เทา 2px offset 1px ไม่ใช่ glow สีแบรนด์ (ของเดิมเป็น `ring-ring/20` สีแดง) — **ยกเว้น** destructive ที่ใช้ ring แดง
6. **ปุ่ม default ไม่ใช่สีแบรนด์** — ปุ่มพื้นฐานเป็น neutral surface + border, สีแบรนด์สงวนไว้ให้ primary action เดียวต่อหน้าจอ
7. **Mono font สำหรับข้อมูลเชิงรหัส** — SKU / order code / id / ตัวเลขในตาราง ใช้ `--font-mono` (Supabase ใช้ mono หนักมากกับข้อมูล) — ผูกกับ `CodeCell` / `QuantityCell` / `MoneyCell`

---

## 2. Phase 0 — Token Contract (Claude ทำคนเดียว · เป็น blocker ของทุกอย่าง)

**ห้าม Codex เริ่มก่อน Phase 0 merge** เพราะ token คือสัญญาที่ทั้งสองเลนใช้ร่วมกัน

### 2.1 กติกาไม่ให้พัง

- **ชื่อ Tier 3 เดิมทุกตัวต้องอยู่ครบ** (`bg-canvas`, `text-muted-foreground`, `border-divider`, `shadow-md`, `bg-data-*` …) เปลี่ยนแค่ *ค่า* ที่มันชี้ไป → โค้ด 300+ จุดไม่พัง compile
- **เพิ่ม** token ตระกูล Supabase เข้ามาใหม่ (ไม่ลบของเก่า): `surface-100/200/300`, `foreground-light/lighter/muted`, `border-muted/strong/stronger`, `control`, `overlay`
- `src/design-system/tokens/{colors,spacing}.ts` — ยืนยันแล้วว่า **ไม่มี consumer เหลือ** → ลบทิ้งใน Phase 0

### 2.2 Tier 1 — neutral scale ใหม่ (เทาแท้)

| token | light | dark | ใช้เป็น |
| --- | --- | --- | --- |
| `--gray-0` | `#ffffff` | `#121212` | canvas ชั้นลึกสุด |
| `--gray-25` | `#fcfcfc` | `#171717` | canvas |
| `--gray-50` | `#f8f9fa` | `#1c1c1c` | surface-100 (card/panel) |
| `--gray-100` | `#f2f3f5` | `#232323` | surface-200 (hover/muted fill) |
| `--gray-150` | `#ededed` | `#282828` | surface-300 / divider |
| `--gray-200` | `#e6e8eb` | `#2e2e2e` | **border default** |
| `--gray-300` | `#dfe1e3` | `#3e3e3e` | border control / strong |
| `--gray-400` | `#c9cdd0` | `#4d4d4d` | border stronger / ring |
| `--gray-500` | `#8f9296` | `#707070` | foreground-muted (placeholder) |
| `--gray-600` | `#6f7377` | `#8f8f8f` | foreground-lighter |
| `--gray-700` | `#55585c` | `#b4b4b4` | foreground-light (secondary text) |
| `--gray-900` | `#171717` | `#ededed` | foreground default |

- Brand คงเดิม: `--brand-500 #e0282e` / `600 #c1252a` / `700 #a71f23` / `50 #fff1f0`
- Functional hue (red/green/gold/blue) และ data palette **คงชุดเดิม** แต่ปรับ 50/200 ให้เข้ากับพื้นเทาใหม่ในโหมด dark
- ตัด `--shadow-key: 50 50 93` (เงาอมน้ำเงินของ Stripe) → เงาเป็นดำล้วน alpha ต่ำ

### 2.3 Tier 2 — semantic ที่เปลี่ยนความหมาย

| token | เดิม | ใหม่ |
| --- | --- | --- |
| `--canvas` | `#f6f9fc` | `--gray-25` |
| `--background` / `--card` / `--popover` | `#fff` | `--gray-0` / `--surface-100` / `--gray-0` |
| `--ring` | `--brand-500` (แดง) | `--gray-400` (**เทา** — ข้อ 5) |
| `--radius` | `0.5rem` (8px) | `6px` |
| `--shadow-xs/sm` | เงาอมน้ำเงิน | `none` / เกือบ none |
| `--shadow-md` | 2px/5px | dropdown-grade |
| `--shadow-lg/xl/overlay` | 12–48px | `0 8px 24px rgb(0 0 0 / .12)` (dark: `/.45`) |
| `--font-mono` | *(ไม่มี)* | **เพิ่ม** — `'JetBrains Mono', ui-monospace, monospace` (ใช้ font stack ระบบ ไม่โหลดเพิ่ม) |

### 2.4 Geometry contract — ตัวเลขกลาง ทั้งสองเลนต้องใช้ค่าเดียวกัน

**ใช้ class ตามนี้เป๊ะ ห้ามเขียนรูปอื่น** (ค่าเหล่านี้ลงตัวกับ Tailwind scale พอดี — ห้ามใช้ `h-[34px]`
เพราะ linter ของโปรเจกต์จะเตือน `suggestCanonicalClasses`)

```
radius        rounded-sm 4px · rounded-md 6px (control ทุกตัว) · rounded-lg 8px (แผง/dialog)
              rounded-xl 12px · rounded-full (pill: badge/tag/avatar/dot)
control h     xs h-6.5 (26px) · sm h-7.5 (30px) · md h-8.5 (34px, default) · lg h-9.5 (38px)
control px    xs px-2 · sm px-2.5 · md px-3 · lg px-3.5
icon size     xs size-3 · sm/md size-3.5 · lg size-4    (เดิม size-4 หมด — Supabase ใช้ 14px เป็นหลัก)
font          base text-sm · meta text-xs · heading text-base font-medium
              ห้ามใช้ font-bold — หนักสุดที่ font-medium (semibold เฉพาะ heading หน้า)
focus         อย่าใส่ ring สีแบรนด์ และ **อย่าใส่ `outline-none` บน control ที่โฟกัสได้**
              index.css มี `:focus-visible { outline: 2px solid var(--ring); outline-offset: 1px }`
              เป็น global แล้ว → ปล่อยให้มันทำงานเอง = ได้ outline เทาแบบ Supabase อัตโนมัติ
              ใส่ `outline-none` เฉพาะ "พื้นผิว" ที่ไม่ควรมีขอบโฟกัส (dialog/popover/select content)
              input/field เพิ่ม `focus-within:border-border-stronger` ให้เส้นเข้มขึ้นด้วย
border        control ใช้ `border-control` · แผง/การ์ดใช้ `border-border`
              เส้นแบ่งในลิสต์/ตารางใช้ `border-divider` หรือ `border-border-muted`
surface       แผง `bg-background` · ชั้นซ้อน `bg-surface-100/200/300` · overlay `bg-overlay`
              hover พื้นทึบ `hover:bg-surface-200` · hover ทับพื้นมีสี `hover:bg-accent-overlay`
เงา           แผง/การ์ด/ตาราง = **ไม่มีเงา** · dropdown/popover/dialog/toast = `shadow-overlay`
transition    transition-colors duration-(--duration-fast)   ← วงเล็บกลม ไม่ใช่ `[var(...)]`
mono          รหัส/SKU/เลขที่เอกสาร/ตัวเลขในตาราง → `font-mono tabular-nums`
```

### 2.5 Deliverable ของ Phase 0 — ✅ เสร็จแล้ว

- [x] `src/index.css` เขียนใหม่ครบ 3 tier (light + dark parity)
- [x] ลบ `src/design-system/tokens/` ทั้งโฟลเดอร์ + บรรทัด `export * from './tokens'` ใน barrel
- [x] `tsc -b` + `vite build` ผ่าน
- [x] อัปเดต `.claude/skills/design-system/SKILL.md` + `CLAUDE.md` Core Rules
- [x] **Codex เริ่มได้แล้ว**

### 2.6 สิ่งที่เพิ่มมาระหว่างทำ Phase 0 — Codex ต้องรู้

| เรื่อง | รายละเอียด |
| --- | --- |
| **Global focus** | `index.css` มี `:focus-visible { outline: 2px solid var(--ring); outline-offset: 1px }` แล้ว → **ลบ `focus-visible:ring-*` และ `outline-none` ออกจาก control ทุกตัว** ปล่อยให้ global ทำงาน (ใส่ `outline-none` เฉพาะพื้นผิว overlay) |
| **`--radius-2xl` = 6px, `--radius-4xl` = 8px** | shadcn primitives บางตัว hardcode `rounded-2xl` (badge/alert/switch) และ `min(var(--radius-4xl),24px)` (card) ไว้ — Phase 0 บีบค่า token ให้คมไปก่อนเป็น safety net **Codex ควรแก้ที่ class ให้ตรงเจตนา**: badge/tag → `rounded-full`, alert → `rounded-md`, card → `rounded-lg`, switch → `rounded-full` |
| **token ใหม่ที่ใช้ได้เลย** | `bg-surface-100/200/300` · `bg-overlay` · `bg-control` · `text-foreground-light/-lighter/-muted` · `border-border-muted/-strong/-stronger/-control/-overlay` · `bg-accent-overlay` (alpha hover) · `font-mono` |
| **`--accent` เป็นพื้นทึบแล้ว** | เดิมเป็น alpha 4% ตอนนี้เป็น `--gray-100` ทึบ ถ้าต้อง hover ทับพื้นที่มีสีอยู่แล้ว (แถวที่เลือก/สถานะ) ให้ใช้ `hover:bg-accent-overlay` แทน |
| **เงาหายไปเยอะ** | `shadow-xs` = ไม่มีเงาแล้ว (`0 0 0 0 transparent`) ตั้งใจ — อย่าไปเพิ่มเงาคืนที่ input/card ใช้ `border-control` แทน |
| **`text-muted-foreground`/`bg-muted`/`border-divider` ยังอยู่** | คงไว้กัน compile พัง แต่ **ในโค้ดใหม่ให้ใช้ชื่อใหม่**: `text-foreground-lighter` / `bg-surface-200` / `border-border-muted` |

---

## 3. Phase 1 — แบ่งเลน (ทำขนานกัน · ไฟล์ไม่ทับกัน 100%)

หลักแบ่ง: **จับคู่ ui primitive กับ DS wrapper ที่ใช้มันไว้เลนเดียวกัน** — ไม่งั้นสองคนแก้ contract เดียวกันคนละทาง

### 🟦 เลน A — Claude ✅ **เสร็จแล้ว** (logic-heavy · portal · virtualization · form state)

เลือกเพราะไฟล์กลุ่มนี้แก้ style แล้วมีโอกาสพัง behavior (virtual scroll, RHF, portal z-index, Radix controlled state)

**ui primitives (4)**
```
dialog.tsx   popover.tsx   select.tsx   sonner.tsx
```

**DS components (22)**
```
Table(821)  Form(389)  DatePicker(345)  Select(252)  DropZoneSheet(222)
SheetImportModal(198)  Field(148)  Modal(145)  SheetColumnMapper(138)
FilterBar(134)  ConfirmDrawer(128)  InlineEdit(122)  Drawer(114)
SheetTable(113)  SearchableSelect(87)  TableCell(85)  InfiniteSearchSelect(82)
DeleteConfirmButton(80)  FormModal(72)  BulkSelectionBar(45)
ActionCell(33)  DateRangePresets(26)
```

**อื่นๆ**
```
src/shared/utils/notify.tsx        (toast → Supabase toast: border + surface, ไม่มีสีพื้นจัด)
src/layouts/AppLayout.tsx          (sidebar/topbar — ตัวชี้ขาดว่า "ดูเป็น Supabase" หรือเปล่า)
```

**ผลจริงหลังทำ (สิ่งที่ตัดสินใจต่างจากแผน — บันทึกไว้ให้ตรวจ)**
- **ความสูงแถวตารางไม่เปลี่ยน** — `CELL_PAD`/`ROW_EST` เดิม (33/41/49px) แน่นระดับ Supabase อยู่แล้ว จึงไม่แตะ → `estimateSize` ไม่มีความเสี่ยง และ layout ทุกหน้าที่พึ่งความสูงแถวไม่ขยับ
- **`size-9` ของช่องวันที่ใน DatePicker ไม่ลด** ทั้งที่ contract บอก 34px — เพราะต้องเท่าความกว้างคอลัมน์ (`w-64 ÷ 7 ≈ 36.5px) ไม่งั้นแถบช่วงวันที่ (`rounded-none`) ขาดเป็นช่วงๆ มีคอมเมนต์กำกับไว้ในไฟล์แล้ว
- **หัวตารางเลิก uppercase + เลิก `backdrop-blur`** — Supabase ใช้ sentence-case ตัวเล็กสีจาง และพื้นทึบ (ได้ perf ตอน scroll ตารางยาวมาแถมด้วย)
- **hover แถวใช้ `bg-accent-overlay` (alpha) ไม่ใช่พื้นทึบ** — เพื่อให้แถวที่ถูกเลือก/มีสถานะยังเห็นสีตัวเองตอน hover
- **footer ของ Modal/Drawer ยกเป็น `bg-surface-100`** — dialog สองโทนแบบ Supabase
- **ลบ shadow hardcode 3 จุดใน `AppLayout`** (`rgba(224,40,46,.33)` ที่โลโก้, เงา sidebar, เงา mobile header) → sidebar ใช้ `bg-sidebar` + เส้นแทน
- `Modal`/`Drawer`/`ConfirmDrawer` ยังใช้ `--z-overlay` ค่าเดียวกันตามเดิม — ไม่แตะ z
- `Form` แตะเฉพาะ label/extra ไม่แตะ `useForm`/RHF
- lint error ที่เหลือใน `Form`/`Table`/`InfiniteSearchSelect` เป็นของเดิม (react-hooks/refs, set-state-in-effect) ยืนยันแล้วว่ามีอยู่ก่อนแก้ — ไม่ใช่ของงานนี้

### 🟩 เลน B — Codex (presentational · mechanical · ปริมาณเยอะแต่ตื้น)

**ui primitives (14)**
```
button.tsx  input.tsx  textarea.tsx  card.tsx  badge.tsx  alert.tsx
checkbox.tsx  radio-group.tsx  switch.tsx  separator.tsx  skeleton.tsx
spinner.tsx  tabs.tsx  tooltip.tsx
```

**DS components (28)**
```
Button  Input  InputNumber  PriceInput  QuantityInput  QuantityStepper  ScanInput
Checkbox  Radio  Switch  Segmented  Tabs  Tooltip
Alert  Banner  Badge  Tag  Card  StatsCard  SummaryCard  Empty  Spinner
Divider  Grid  Stack  Typography  PageHeader  PageShell
```

**เก็บกวาด hex ที่หลุด (4 จุด)**
```
src/design-system/utils/highlightText.tsx
src/design-system/components/Tag/Tag.stories.tsx
src/features/shop/components/PlatformBadge.tsx
src/dev/DevTools.tsx
```

**จุดเสี่ยงที่ Codex ต้องระวัง**
- `Button` map ไป `ui/button` ผ่าน `SIZE_MAP`/`ICON_SIZE_MAP` — ต้องแก้ **ทั้งคู่** ให้ตรง geometry §2.4 (ผู้เรียก ~96 จุดใช้ชื่อ size antd เดิม `small/middle/large` → ห้ามเปลี่ยนชื่อ)
- `Grid` ใช้ class map แบบ literal string — ห้ามประกอบ class ด้วย template string เด็ดขาด (Tailwind scanner มองไม่เห็น)
- `Input` มี `addonBefore/addonAfter` ที่คุม radius ด้วย conditional class — เปลี่ยน radius แล้วต้องไล่ให้ครบทุกกรณี
- `PriceInput`/`QuantityInput`/`ScanInput` เป็น wrapper บาง — restyle ที่ `Input` แล้วเช็กว่าไหลลงมาถูก อย่า duplicate style

### กติกาข้ามเลน

| ข้อ | กติกา |
| --- | --- |
| 1 | **ห้ามแก้ไฟล์นอกเลนตัวเอง** เจอปัญหาในไฟล์อีกเลน → จดไว้ใน §6 Handoff ไม่ใช่แก้เอง |
| 2 | `src/index.css` **แช่แข็งหลัง Phase 0** ต้องการ token ใหม่ → ขอผ่าน §6 ให้ Claude เพิ่มให้ |
| 3 | `src/design-system/index.ts` (barrel) — Claude เป็นเจ้าของคนเดียว ป้องกัน merge conflict |
| 4 | ห้ามแตะ `src/features/**` (ยกเว้น `PlatformBadge.tsx` ที่มอบให้ Codex) |
| 5 | ~~commit แยก branch~~ **ทำไม่ได้ตามที่วางไว้** — branch `re-structure` มีงานค้างยังไม่ commit อยู่ ~118 ไฟล์ก่อนเริ่มงานนี้ แตก branch ตอนนี้จะพางานค้างของคนอื่นติดไปด้วย → **ต้อง commit งานค้างก่อน** แล้วค่อยแตก branch ให้ Codex ไม่งั้นให้ Codex ทำบน working tree เดียวกันแต่ยึดกติกา "ห้ามแตะไฟล์นอกเลน" อย่างเคร่งครัด |

---

## 4. Phase 2 — Stories (หลังทั้งสองเลนเสร็จ)

50 component มี `.stories.tsx` ครบทุกตัว — ส่วนใหญ่ไม่ต้องแก้เพราะ story เรียกผ่าน props แต่ต้อง:

- [ ] ไล่เปิด Storybook ดูทีละตัว หา visual regression (Claude)
- [ ] Story ไหน hardcode สี/ขนาด → แก้ (เจ้าของเลนเดิมของ component นั้น)
- [ ] เพิ่ม story `Dark` variant ให้ component ที่พื้นผิวเปลี่ยนเยอะ: Card, Table, Modal, Alert, Tag, StatsCard

---

## 5. Phase 3 — Docs (Claude)

- [ ] `.claude/skills/design-system/SKILL.md` — token table ใหม่ + cheat sheet + กติกา focus ring เทา
- [ ] `.claude/skills/design-system/components/SKILL.md` — geometry contract §2.4
- [ ] `CLAUDE.md` — Core Rules: เพิ่ม "ห้าม `font-bold`", "focus ring เป็น neutral ไม่ใช่ brand", "mono สำหรับรหัส/ตัวเลข"
- [ ] `DESIGN-SYSTEM-MIGRATION.md` — บันทึกว่าโละจาก Stripe-flavored → Supabase เมื่อไหร่ เพราะอะไร

---

## 6. Handoff / Blocker log (แก้ระหว่างทาง)

| # | จาก | ถึง | ไฟล์ | เรื่อง | สถานะ |
| --- | --- | --- | --- | --- | --- |
| 1 | Claude | Codex | `ui/button.tsx` + `DS/Button` | ต้องแก้ **พร้อมกันทั้งคู่** — DS map `small/middle/large` (antd, ~96 call site) ไป `sm/default/lg` ของ shadcn ผ่าน `SIZE_MAP`/`ICON_SIZE_MAP` ถ้าแก้ข้างเดียวขนาดจะเพี้ยน ปรับให้เป็น `h-6.5/7.5/8.5/9.5` + `size-*` ที่คู่กัน | ⬜ |
| 2 | Claude | Codex | `ui/button.tsx` | variant `default` ตอนนี้เป็น `bg-primary` (แดง) — ตามข้อ 6 ของสเปกต้องเปลี่ยนเป็น neutral surface + border, ให้ `primary` เป็นตัวเดียวที่แดง **แต่ห้ามเปลี่ยน mapping ใน DS Button** (`primary → default`) ไม่งั้นปุ่มบันทึกทั้งแอปหายสี — ถ้าจะทำต้องสลับ `VARIANT_MAP` ให้ `primary` ชี้ variant ใหม่แทน | ⬜ |
| 3 | Claude | Codex | `ui/card.tsx` | มี `ring-1 ring-foreground/5` + `shadow-sm` + `rounded-[min(var(--radius-4xl),24px)]` — Supabase ไม่มีเงาและไม่มี ring ให้เหลือ `rounded-lg border border-border` เฉยๆ | ⬜ |
| 4 | Claude | Codex | `ui/switch.tsx` | ใช้ `bg-input/90` เป็น track ตอน off — `--input` ตอนนี้คือ **สีเส้น** ไม่ใช่สีพื้น ให้เปลี่ยนไปใช้ `bg-control-off` | ⬜ |
| 5 | Claude | Codex | `PlatformBadge.tsx`, `highlightText.tsx`, `DevTools.tsx`, `Tag.stories.tsx` | 5 hex ที่หลุด — `DevTools` มี `shadow-[0_4px_12px_rgba(114,46,209,0.4)]` ด้วย | ⬜ |

---

## 7. Definition of Done

**เลน A (Claude)** — ✅ ผ่านครบ
- [x] `tsc -b` + `vite build` ผ่าน
- [x] ไม่มี lint error ใหม่ (ที่เหลือเป็นของเดิม ยืนยันด้วยการ lint ไฟล์เวอร์ชัน HEAD เทียบ)
- [x] ไม่เหลือ hex / `shadow-[…rgba()]` ในไฟล์เลน A
- [x] ไม่เหลือ `bg-muted` / `border-divider` / `foreground-subtle` / `font-semibold` ในไฟล์เลน A
- [x] ไม่มี `bg-[var(--gray-*)]` — component กิน Tier 3 เท่านั้น
- [x] ทุกไฟล์ในเลนถูกเปิดอ่านจริง
- [ ] ⬜ **ยังไม่ได้ตรวจด้วยตา** — ต้องเปิด Storybook/แอปจริงดู light + dark

**เลน B (Codex)**
- [ ] `bun run build` ผ่าน (`tsc -b` ไม่มี error)
- [ ] `bun run lint` ไม่มี error ใหม่
- [ ] `grep -rn "#[0-9a-fA-F]\{6\}" src --include=*.tsx` เหลือ 0 นอก `index.css`
- [ ] ไม่มี `bg-[var(--gray-*)]` — component กิน Tier 3 เท่านั้น
- [ ] ทุกไฟล์ในเลนถูก**เปิดอ่านจริง** ไม่ใช่ปล่อยให้ token ไหลลงมาเฉยๆ
- [ ] เช็ก dark mode ทุก component ที่แตะ
- [ ] เคลียร์ Handoff §6 ข้อ 1–5

**รวม**
- [ ] เดินครบทุกหน้าจริง: Login → Order Entry → Order History → Inventory → Employee
- [ ] ไม่มี prop/ชื่อ export ไหนเปลี่ยน (diff ต้องไม่มี call site ใน `src/features/**` ต้องแก้ตาม — ยกเว้น `PlatformBadge`)
- [ ] Storybook build ผ่าน

---

## 8. รอบตรวจบั๊ก UI — แบ่งเป็น 2 บทบาท

หลัง restyle เสร็จ บั๊กที่เหลือไม่ใช่ "สีผิด" แต่เป็น **บั๊กเชิงเลย์เอาต์** ที่เห็นเฉพาะตอนประกอบจริง
คนที่แก้โค้ดอยู่จะ "ตาบอด" กับงานตัวเอง จึงต้องแยกคนตรวจกับคนแก้ออกจากกัน

### 🔍 บทบาท A — Bug Hunter (**ห้ามแก้โค้ด**)

หน้าที่: เดินหาของพัง แล้วเขียนลงตาราง §8.3 เท่านั้น ห้ามแตะไฟล์
เพราะถ้าให้คนเดียวกันหาและแก้ มันจะหยุดหาทันทีที่เจออันแรก

**เดินตามนี้ ไม่ใช่เดินสุ่ม** — แต่ละหัวข้อคือ failure mode ที่โครงนี้พังจริง:

| # | หมวด | วิธีตรวจ | ทำไมต้องดู |
| --- | --- | --- | --- |
| 1 | **control ยืดเต็มความกว้าง** | เปิดทุก modal/form ที่มี Switch, Segmented, QuantityStepper, Checkbox, Radio, ปุ่ม icon | `Form.Item` ห่อด้วย `flex flex-col` → `align-items: stretch` ทำให้ control ที่มีแค่ `min-w`/`inline-flex` ยืดเต็มฟอร์ม **(เจอจริงแล้ว: Switch เต็มโมดัล)** |
| 2 | **hover/focus ที่มองไม่เห็น** | ชี้เมาส์และกด Tab ทีละ control | token ใหม่มีเทาหลายเฉดใกล้กัน ถ้าจับคู่ผิดขั้น (เช่น `border-control` → hover `border-strong` ซึ่งเป็นสีเดียวกัน) จะไม่มีอะไรเกิดขึ้นเลย |
| 3 | **contrast ต่ำใน dark mode** | สลับ dark ทุกหน้า เน้น Tag/Badge/Alert/สถานะ | สีสถานะใน dark คำนวณด้วย `color-mix` ไม่ได้เลือกด้วยมือ บางเฉดอาจตกเกณฑ์ WCAG AA |
| 4 | **ข้อความจางเกินอ่าน** | label ในฟอร์ม, หัวตาราง, hint, empty state | เปลี่ยนเป็น `foreground-light/-lighter` ตามแบบ Supabase — อาจจางเกินไปสำหรับงาน ERP ที่จ้องทั้งวัน |
| 5 | **ของหายเพราะเงาหาย** | การ์ดซ้อนการ์ด, panel บน canvas, sticky header | ความลึกมาจากเส้นอย่างเดียวแล้ว ที่ไหนไม่มีเส้นจะกลืนหาย |
| 6 | **transition ไม่ทำงาน** | ดูว่า hover เปลี่ยนแบบกระตุกหรือลื่น | `duration-[--x]` เป็น syntax v3 ที่ v4 คอมไพล์ออกมาเป็น CSS พัง **(เจอแล้ว 13 จุด แก้แล้ว — ให้ตรวจว่าไม่มีใครเผลอเขียนกลับมา)** |
| 7 | **class ที่ไม่มีจริง** | `bun run build` แล้ว grep class ที่ไม่ถูก emit | การ rename ด้วย sed ทำให้เกิด class ผี เช่น `bg-muted-foreground` → `bg-surface-200-foreground` **(เจอแล้ว 1 จุดที่ Badge — จุดที่ไม่มีสีเลย)** |
| 8 | **ขนาดไม่ตรง contract** | วัดปุ่ม/อินพุตที่อยู่แถวเดียวกันว่าสูงเท่ากันไหม | ถ้ามี control ตัวไหนยังใช้ `h-8`/`h-9` เดิม จะเตี้ย/สูงกว่าเพื่อน 2px เห็นชัดเวลาอยู่ใน toolbar เดียวกัน |

**รูปแบบรายงาน** — ไม่รับ "ตรงนี้ดูแปลกๆ" ต้องมีครบ 4 ช่อง: หน้า/component · สิ่งที่เห็น · สิ่งที่ควรเป็น · ไฟล์+บรรทัดที่สงสัย

### 🔧 บทบาท B — Fixer (**แก้ตามตารางเท่านั้น**)

- หยิบจาก §8.3 ทีละแถว แก้ แล้วเปลี่ยนสถานะเป็น ✅ พร้อมใส่ commit/ไฟล์ที่แก้
- **ห้ามแก้สิ่งที่ไม่ได้อยู่ในตาราง** เจอของแปลกระหว่างทางให้เพิ่มเป็นแถวใหม่แล้วปล่อยไว้ให้ A ยืนยันก่อน
- ทุกครั้งที่แก้ ต้องถามว่า "อันนี้เป็นบั๊กเฉพาะจุด หรือเป็นบั๊กของ pattern?" ถ้าเป็น pattern ให้แก้ที่ต้นทาง (token / primitive) ไม่ใช่ไล่ปะทีละที่
- `tsc -b` + `vite build` ต้องผ่านก่อนปิดแต่ละแถว

### 8.3 ตารางบั๊ก UI

| # | หน้า/Component | อาการ | ควรเป็น | ไฟล์ | สถานะ |
| --- | --- | --- | --- | --- | --- |
| 1 | Switch ใน Form/Modal | ยืดเต็มความกว้างโมดัล | กว้างตามเนื้อหา (28/44px) | `Switch/index.tsx:49` | ✅ แก้แล้ว (`w-fit self-start`) |
| 2 | Segmented / QuantityStepper / Checkbox / Radio ใน Form | เสี่ยงอาการเดียวกับ #1 | กว้างตามเนื้อหา | 4 ไฟล์ | ✅ แก้แล้ว (`w-fit`) |
| 3 | Input / Textarea / InputNumber | hover ไม่เปลี่ยนอะไรเลย | เส้นเข้มขึ้นตอน hover | `hover:border-border-strong` → `-stronger` | ✅ แก้แล้ว |
| 4 | ทุก control ที่ใช้ `duration-[--duration-fast]` | ไม่มี transition (เปลี่ยนสีกระตุก) | ลื่น 100ms | 13 ไฟล์ | ✅ แก้แล้ว → `duration-(--duration-fast)` |
| 5 | Badge สถานะ `default` | จุดสีหายไปเลย (class ผี) | จุดเทา | `Badge/index.tsx:12` | ✅ แก้แล้ว |
| 6 | — | *(รอ Bug Hunter เติม)* | — | — | ⬜ |

---

## 9. ลำดับเวลา

```
Phase 0  Claude ─── token contract ───┐   (blocker)
                                      │
Phase 1                    ┌──────────┴──────────┐
              Claude เลน A ┤                     ├ Codex เลน B
              (26 ไฟล์)     └──────────┬──────────┘  (46 ไฟล์)
                                      │
Phase 2                    ── merge + Storybook sweep ──  Claude
Phase 3                    ── docs / skills ──            Claude
```
