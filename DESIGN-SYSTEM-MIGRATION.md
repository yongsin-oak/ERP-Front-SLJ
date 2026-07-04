# Design System Migration — Ant Design → Tailwind + Radix (Stripe-style)

> **สถานะ:** ✅ เสร็จสมบูรณ์ — antd + emotion ถูกลบออกจากโปรเจกต์ทั้งหมด · `tsc -b` + `vite build` ผ่าน
> **Branch:** `re-structure`
> **เริ่ม:** 2026-06-24
> **กลยุทธ์ที่ตกลง:** Clean rebuild (API ใหม่หมด) · Toasts = **Sonner** · เดินงานแบบ **Foundation ก่อน แล้วรีวิว**

ไฟล์นี้เป็น **แผน + checklist ความคืบหน้า** — หยุดเมื่อไหร่ก็กลับมาดูข้อที่ยังไม่ติ๊กได้เลย
ติ๊ก `[x]` เมื่อทำเสร็จ + ผ่าน `tsc -b` แล้ว

---

## 🎯 เป้าหมาย

1. **ลบ `antd` ออกจากโปรเจกต์ให้หมด** (ปัจจุบัน 81 ไฟล์ import antd)
2. **ลบ `@emotion/styled` / `@emotion/react`** (12 ไฟล์) — ใช้ Tailwind แทน
3. สร้าง design-system ใหม่บน **Tailwind v4 + Radix UI** สไตล์ **Stripe** — สะอาด อ่านง่าย ใช้ง่าย UX ดี ทันสมัย
4. **Global token ครบ + semantic ครอบคลุม** (3-tier: primitive → semantic → tailwind theme)
5. API ของแต่ละ component ออกแบบใหม่แบบ idiomatic (ไม่ผูกกับรูปแบบ antd)

---

## 🧱 หลักการ / ภาษาออกแบบใหม่ (New API conventions)

> ตกลงครั้งเดียว ใช้ทั้งระบบ — กันความไม่สม่ำเสมอ

- **Named exports** ทุกตัว, ไม่มี default export
- **Primitive ดิบ** อยู่ที่ `src/components/ui/*` (shadcn-style, own-the-code, Radix-based)
- **Wrapper ระดับ ERP** อยู่ที่ `src/design-system/components/*` export ผ่าน `@design-system`
- **Form fields** ใช้รูปแบบ `Field` (label + control + hint/error) — สไตล์ Stripe:
  ```tsx
  <TextField label="ชื่อสินค้า" hint="ตามที่ลูกค้าเห็น" error={errors.name?.message} {...register('name')} />
  ```
- **Form ทั้งฟอร์ม** = `react-hook-form` + `zod` (มีใน stack แล้ว) — เลิกใช้ `Form.useForm`/`Form.Item` ของ antd
- **Table** = `@tanstack/react-table` + `@tanstack/react-virtual` — API แบบ `columns`/`data` ใหม่
- **Overlays** (Modal, Drawer, Tooltip, Popover, Select, Dropdown) = **Radix UI** primitives
- **Toasts** = **Sonner** — เรียกผ่าน `notify.*` (API เดิมใน `notify.tsx`) เพื่อไม่ต้องแก้ผู้เรียก
- **ห้าม**: `#hex`/`px` literal ใน component, `Flex`/`Row`/`Col`/`Space` ของ antd → ใช้ Tailwind utility หรือ primitive `Stack`/`Grid`
- **สี/ระยะ/เงา/มอชั่น** → ใช้ semantic token (Tier 3) เท่านั้น
- ทุก component ที่ migrate ต้องมี **`<Component>.stories.tsx`** + ผ่าน `tsc -b`

---

## 📐 Token Plan (Tier 1 → 2 → 3 ใน `src/index.css`)

- [x] **Tier 1 primitive** — neutral scale เต็ม 0–900 (Stripe cool-gray), brand แดง, functional hues, ink, scrim, shadow ingredients
- [x] **Tier 2 semantic** — canvas/surfaces, text hierarchy, borders(+strong), status, interaction states, **shadow ladder (xs→overlay)**, **motion/easing tokens**, primary-subtle
- [x] **Tier 3 `@theme inline`** — map → Tailwind utilities: `bg-canvas`, `bg-scrim`, `shadow-{xs..overlay}`, `ease-{out,in-out,spring}`, `border-strong`, radius
- [ ] เลิกพึ่ง `tokens/colors.ts` + `tokens/spacing.ts` (ของเดิมป้อน antd/emotion) — ย้าย consumer มาใช้ Tailwind token แล้วลบทิ้งใน Phase 6

---

## ✅ Checklist ราย Phase

สถานะ: `[ ]` ยังไม่ทำ · `[~]` กำลังทำ · `[x]` เสร็จ+ผ่าน build

### Phase 0 — Foundation (turn นี้)
- [x] เขียนไฟล์แผนนี้
- [x] ยกเครื่อง **token layer** ใน `src/index.css` → Stripe-grade
- [x] ติดตั้ง **sonner**@2.0.7 + สร้าง `<Toaster/>` styled (`components/ui/sonner.tsx`) + mount ที่ `App.tsx`
- [x] เขียน `src/shared/utils/notify.tsx` ใหม่บน sonner (คง API `notify.success/warning/error/loading/resolve/dismiss`)
- [x] Hero primitive: base `Input`+`Textarea` (refine Stripe) + **`Field`/`TextField`/`TextareaField`** (label/hint/error/prefix/suffix) + Storybook story `Field.stories.tsx`
- [x] ผ่าน `tsc -b --force` (exit 0) + `vite build` (exit 0)
- [ ] **รีวิวกับผู้ใช้** — เคาะ look & API ก่อนเดินต่อ ⏸️ ← **อยู่ตรงนี้**

### Phase 1 — Core primitives (ราก UI)
**Layout helpers (ทำก่อน เพราะ feature เรียกเยอะ)**
- [ ] `Stack` / `Inline` (แทน antd `Flex`/`Space`)
- [ ] `Grid` / responsive cols (แทน antd `Row`/`Col` + `COL_PROPS`)

**Form controls**
- [x] `Input` + `Textarea` + `InputPassword` + `InputSearch` — prefix/suffix/allowClear/addon + InputRef imperative (.focus/.select)
- [x] `InputNumber` — formatter/parser/precision/min-max/addon · onChange(number|null)
- [x] `Select` (Popover combobox) — single + showSearch(obj)/allowClear/loading/grouped (no multiple — unused)
- [x] `Checkbox` (Radix) — single + Group, onChange(e.target.checked)
- [x] `Radio` / `RadioGroup` (Radix) — minimal (unused in app) + Group/Button
- [x] `Switch` (เสร็จแล้ว — Tailwind)
- [x] `DatePicker` + `DateRangePicker` + `DateRangePresets` — **dayjs calendar เอง (ไม่เพิ่ม dep, เลี่ยง date-fns)** + Popover, single/range/presets
- [x] Smart inputs: `PriceInput`, `QuantityInput`, `ScanInput`, `InlineEdit` (InlineEdit ปลด emotion)

**Display / feedback**
- [x] `Button` (เสร็จแล้ว) — ทบทวน style ให้เข้า Stripe
- [x] `Tag` / `StatusTag` (เสร็จแล้ว)
- [x] `Badge` (เสร็จแล้ว)
- [x] `Alert` (เสร็จแล้ว)
- [x] `Card` (เสร็จแล้ว)
- [x] `Typography` (`Text` / `Title` / `PageTitle`) — span/heading + token classes, copyable/code/ellipsis
- [x] `Divider` — horizontal/vertical/with-text, dashed
- [x] `Spinner` / skeleton — ui Spinner + skeleton primitive
- [x] `Empty` — IconInbox + description/action
- [x] `Tooltip` (Radix) — antd `title`/`placement` API preserved
- [x] `Tabs` (Radix) — antd `items`/`activeKey`/`onChange` API preserved

**Overlays**
- [x] `Modal` (Radix Dialog) — open/onCancel/onOk/footer/width/okButtonProps/styles/maskClosable
- [x] `Drawer` (Radix Dialog — side) — placement/styles(body+header)/closable/extra/footer
- [x] `ConfirmDrawer` — ปลด emotion, step indicator + Drawer footer slot
- [x] `Toaster` / `notify` (sonner — Phase 0)

### Phase 2 — Form system
- [x] `Form` (**RHF engine + antd-compatible surface**: useForm/Form.Item/useWatch/validateFields/resetFields/setFieldsValue/setFields/rules/valuePropName/noStyle/shouldUpdate) — feature เปลี่ยน import บรรทัดเดียว
- [x] `FormModal` (Modal + RHF FormInstance, generic)
- [ ] Smart inputs: `PriceInput`, `QuantityInput`, `InlineEdit`, `ScanInput`, `DateRangePresets`
- [ ] `SearchableSelect`, `InfiniteSearchSelect`, `ProductDropdownSelect`

### Phase 3 — Table system
- [ ] `Table` (TanStack Table + react-virtual) — sort/paginate/rowSelection/searchable column
- [ ] `ActionCell` (edit + delete)
- [ ] `BulkSelectionBar`
- [ ] Cell helpers: `DateCell` / `MoneyCell` / `CodeCell` / `QuantityCell`
- [ ] `SheetTable` (virtual preview)

### Phase 4 — Composite / page-level
- [ ] `PageShell` (loading / empty / error)
- [ ] `PageHeader`
- [ ] `FilterBar`
- [ ] `StatsCard` / `SummaryCard` / `DashboardPage StatCard`
- [ ] `DeleteConfirmButton`
- [x] `ConfirmDrawer` — Drawer + step indicator (ปลด emotion)
- [x] Sheet import: `DropZoneSheet`, `SheetColumnMapper`, `SheetImportModal` (ปลด emotion + antd Steps/Alert)

### Phase 5 — Feature migration (33 ไฟล์ที่ import antd ตรงๆ) ✅
> เลิกใช้ antd โดยตรง → ใช้ `@design-system` + Tailwind · กลยุทธ์ shim ทำให้ feature เปลี่ยนน้อยมาก
- [x] inventory (6): ProductFormModal, ProductDropdownSelect, StockEntryModal, ShopPriceModal, StockHistoryTab, InventoryPage
- [x] stock-entry (5): EntryMetaBar, StockReceivePage, StockAdjustPage, StockDamagePage, StockHistoryPage
- [x] order (4): OrderItemsEditor, OrderDetailModal, OrderEntryPage, OrderHistoryPage
- [x] auth (4): ActorModal, LoginPage, ProfilePage, PinPad (+ emotion)
- [x] terminal (2), supplier (2), shop (2), employee (2), category (2), brand (2)
- [x] user (1), stock-count (2), role (1), report (1), dashboard (1)
- [x] `layouts/AppLayout.tsx` — custom sidebar nav (collapsible groups + collapsed icon mode), DS Drawer มือถือ, `notify` แทน `App.useApp()`
- [x] `app/router/RoleGuard.tsx`, `app/router/RouteError.tsx` (antd `Result` → inline) · `DevTools.tsx`

### Phase 6 — ลบ antd + emotion + cleanup ✅
- [x] เปลี่ยน `ThemeProvider.tsx` — เอา `ConfigProvider`/`App`/locale ออก (เป็น pass-through, toasts ใช้ Sonner)
- [x] ลบ `src/design-system/antd/` (theme.ts, tokens.ts, components.ts)
- [x] ลบ `tokens/col.ts` + เอา `COL_PROPS` ออกจาก barrel (`colors.ts`/`spacing.ts` ยังใช้อยู่ — ไม่พึ่ง antd, เก็บไว้)
- [x] ลบ `@emotion/styled` usage ทั้งหมด (0 ไฟล์เหลือใน src)
- [x] เอา `jsxImportSource: "@emotion/react"` ออกจาก `vite.config.ts` + antd manualChunk
- [x] `bun remove antd @emotion/react @emotion/styled` (3 packages removed)
- [x] `tsc -b` + `vite build` ผ่านสะอาด (exit 0 · build 385ms · antd chunk หายจาก bundle)
- [~] อัปเดต `CLAUDE.md` (stack table) — `.claude/skills/design-system/**` ยังควรทบทวนเพิ่ม

> **🎉 เสร็จสมบูรณ์** — `grep "from 'antd'"` ใน src = 0 · `grep "@emotion"` ใน src = 0
> เพิ่ม component ใหม่: `Stack`/`Inline`/`Grid`/`Field`/`Segmented` · DS `Form` = RHF engine + antd-compatible surface

---

## 📝 บันทึก / การตัดสินใจ (Decision log)

| วันที่ | เรื่อง | สรุป |
|---|---|---|
| 2026-06-24 | กลยุทธ์ | Clean rebuild — API ใหม่หมด (ยอม refactor 35 feature files) |
| 2026-06-24 | Toasts | Sonner (เล็ก ~5kb, Stripe-style) |
| 2026-06-24 | การเดินงาน | Foundation ก่อน → รีวิว → ค่อยเดินเฟสถัดไป |
| 2026-06-24 | Brand | คงสีแบรนด์ **แดง #e0282e** — เอา "โครงสร้าง" Stripe (เงา/ระยะ/เส้น/ตัวอักษร) ไม่ใช่สีม่วง Stripe |

---

## ⚠️ ความเสี่ยง / จุดต้องระวัง

- **Form** = จุดเสี่ยงสุด (RHF+zod ต่างจาก `Form.useForm` มาก) — กระทบ ~12 ฟอร์ม
- **Table** = API surface ใหญ่ (virtual/sort/paginate/rowSelection) — ต้องเทียบ feature เดิมให้ครบ
- ระหว่างทาง antd กับของใหม่ **อยู่ร่วมกันได้** (coexist) — ค่อยๆ ถอด ไม่ big-bang
- `colors.ts` ยัง mirror hex กับ `index.css` จนกว่าจะลบ antd — แก้ต้องแก้คู่กันจนถึง Phase 6
