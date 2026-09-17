---
name: design-system-components
description: ประกอบ UI จาก Radix primitives ตรงๆ + class vocabulary ใน src/lib/styles.ts — สูตรของตาราง โมดัล เมนู ฟอร์ม และช่องเลือกที่ค้นได้
---

# Skill: ประกอบ UI จาก Radix

> **ไม่มีชั้น wrapper** — โปรเจกต์นี้ไม่มี `src/design-system` และไม่มี `src/components/ui`
> หน้าเพจ import จาก `radix-ui` เอง แล้วดึง class จาก `src/lib/styles.ts`
> ถ้าเจอโค้ดที่ import `@design-system` แปลว่าเป็นโค้ดเก่าที่ยังไม่ได้ย้าย

---

## 3 ไฟล์ที่ต้องรู้ก่อนเขียน UI

| ไฟล์ | เก็บอะไร | ตัวอย่าง |
| --- | --- | --- |
| `src/lib/styles.ts` | **class string ที่ตั้งชื่อแล้ว** — หน้าตาทั้งหมดของระบบ | `btn('primary')`, `INPUT`, `TABLE_TH`, `DIALOG_CONTENT`, `dataPill('red')` |
| `src/lib/icons.tsx` | `AppIcons` — ไอคอน Tabler ตั้งชื่อตามหน้าที่ | `<AppIcons.delete />` |
| `src/lib/format.ts` | ฟังก์ชันจัดรูปแบบค่า (คืน string ไม่ใช่ JSX) | `formatDate()`, `formatMoney()` |

เสริม: `src/lib/useCombobox.ts` (ตรรกะช่องเลือกที่ค้นได้), `src/lib/fieldStyles.ts` (สูตรขอบ field ทุก state)

### กฎเหล็ก

- **ห้ามพิมพ์ชุด class ของ control ซ้ำในหน้าเพจ** — ถ้ายังไม่มีชื่อใน `styles.ts` ให้ไปเพิ่มที่นั่น
  แล้วค่อยเรียกใช้ การแก้สี/ความสูงของปุ่มต้องแก้ที่จุดเดียวเสมอ
- **class เฉพาะตำแหน่ง (`mb-4`, `w-40`, `flex-1`) เขียนในหน้าเพจได้** — ใช้ `cn()` ต่อกับ constant
- **ห้าม `#hex` / `px` ตรงๆ** — ใช้โทเคนจาก `index.css` (ยกเว้นค่าที่มาจากข้อมูล เช่น `PlatformHex`)

---

## Radix มีอะไร / ไม่มีอะไร

### มีให้ใช้ (`import { X } from 'radix-ui'`)

`Dialog` `AlertDialog` `DropdownMenu` `Popover` `Select` `Checkbox` `RadioGroup` `Switch`
`Tabs` `Tooltip` `ToggleGroup` `Separator` `Label` `ScrollArea` `Accordion` `Collapsible`
`HoverCard` `Progress` `Slider` `Avatar` `Slot`

### **ไม่มี** — ต้องเขียน HTML + Tailwind เอง

| ต้องการ | ทำยังไง |
| --- | --- |
| ตาราง | `<table>` + `TABLE_WRAP` `TABLE` `TABLE_TH` `TABLE_TD` `TABLE_TR` |
| ช่องกรอก | `<input className={INPUT}>` / `<textarea className={TEXTAREA}>` |
| การ์ด | `<div className={CARD_SM}>` |
| ตัวเลือกวันที่ | `<input type="date">` (ได้ปฏิทินพื้นเมืองบนมือถือฟรี + พิมพ์ได้) |
| ช่วงวันที่ | `<input type="date">` สองช่อง + ปุ่มลัด (`btn('ghost','xs')`) |
| combobox ที่ค้นได้ | `Popover` + `<input>` + รายการ + `useCombobox` |
| แถบแบ่งหน้า | เขียนเองด้วย `PAGER` + `PAGE_SIZE_SELECT` |
| toast | `sonner` (ตั้งค่าไว้แล้วใน `App.tsx`) — เรียกผ่าน `notify` จาก `@shared` |

> ⚠️ Radix **Select ค้นหาไม่ได้** — ตัวเลือกน้อย (< ~15) ใช้ `Select` ได้เลย (มี typeahead ในตัว)
> ตัวเลือกเยอะหรือมาจาก `dropdown-search` ต้องใช้ `Popover` + `useCombobox`

---

## สูตรที่ใช้ซ้ำบ่อย

### ปุ่ม

```tsx
<button type="button" className={btn('primary')} onClick={…}>
  <AppIcons.add />
  เพิ่มแบรนด์
</button>

// icon อย่างเดียว — ต้องมี aria-label เสมอ
<button type="button" aria-label="ลบแถวนี้" className={btnIcon('dangerGhost', 'sm')}>
  <AppIcons.delete />
</button>
```

`btn(variant, size)` — variant: `primary` `secondary` `tonal` `ghost` `danger` `dangerGhost` `link` · size: `xs` `sm` `md` `lg`

### ฟอร์มในโมดัล (Dialog + react-hook-form)

```tsx
<Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
  <Dialog.Portal>
    <Dialog.Overlay className={DIALOG_OVERLAY} />
    <Dialog.Content className={DIALOG_CONTENT} aria-describedby={undefined}>
      <Dialog.Title className={DIALOG_TITLE}>เพิ่มแบรนด์</Dialog.Title>
      <Dialog.Close asChild>
        <button type="button" aria-label="ปิด" className={DIALOG_CLOSE_X}><AppIcons.close /></button>
      </Dialog.Close>

      <form noValidate className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className={FIELD_ROW}>
          <label htmlFor="brand-name" className={LABEL}>ชื่อแบรนด์</label>
          <input id="brand-name" className={INPUT} aria-invalid={!!errors.name}
                 {...register('name', { required: 'กรุณากรอกชื่อแบรนด์' })} />
          {errors.name && <span className={FIELD_ERROR}>{errors.name.message}</span>}
        </div>

        <div className={DIALOG_FOOTER}>
          <button type="button" className={btn('ghost')} onClick={onClose}>ยกเลิก</button>
          <button type="submit" className={btn('primary')} disabled={loading}>
            {loading && <AppIcons.loading spin />}
            บันทึก
          </button>
        </div>
      </form>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

**สิ่งที่พลาดบ่อย**

- `aria-describedby={undefined}` — ถ้าไม่มี `Dialog.Description` Radix จะเตือนใน console
- ต้อง `reset()` ค่าเดิม **ทุกครั้งที่เปิด** ไม่ใช่แค่ตอน mount — Radix ไม่ unmount เนื้อหาระหว่างสลับ `open`
  ไม่งั้นกดแก้ไขรายการที่สองจะเห็นค่าของรายการแรกค้างอยู่
- state ที่เป็นผลของ "การกด" (เช่น ซ่อน/แสดงรหัสผ่าน) รีเซ็ตใน `onOpenChange` ไม่ใช่ใน effect

### เมนู action ท้ายแถว

```tsx
<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild>
    <button type="button" aria-label="ตัวเลือกของแถวนี้" className={btnIcon('ghost', 'sm')}>
      <AppIcons.more />
    </button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Portal>
    <DropdownMenu.Content align="end" sideOffset={4} className={MENU_CONTENT}>
      <DropdownMenu.Item className={MENU_ITEM} onSelect={() => openEdit(r)}>แก้ไข</DropdownMenu.Item>
      <DropdownMenu.Separator className={MENU_SEPARATOR} />
      <DropdownMenu.Item
        className={MENU_ITEM_DANGER}
        onSelect={(e) => {
          e.preventDefault();      // กัน Radix ปิดเมนูแล้วเปิดกล่องยืนยันชนกัน (focus trap)
          setPendingDelete(r);
        }}
      >
        ลบ
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>
```

**ลำดับในเมนู**: action เพิ่มเติม → แก้ไข → เส้นคั่น → ลบ (แดง ท้ายสุดเสมอ)

### ยืนยันก่อนลบ

```tsx
<AlertDialog.Root open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
  <AlertDialog.Portal>
    <AlertDialog.Overlay className={DIALOG_OVERLAY} />
    <AlertDialog.Content className={cn(DIALOG_CONTENT, 'max-w-sm')}>
      <AlertDialog.Title className={DIALOG_TITLE}>ลบแบรนด์นี้?</AlertDialog.Title>
      <AlertDialog.Description className={DIALOG_DESC}>
        สินค้าที่ผูกอยู่กับแบรนด์นี้จะไม่มีแบรนด์
      </AlertDialog.Description>
      <div className={DIALOG_FOOTER}>
        <AlertDialog.Cancel asChild>
          <button type="button" className={btn()}>ยกเลิก</button>
        </AlertDialog.Cancel>
        <button type="button" className={btn('danger')} onClick={…}>ลบ</button>
      </div>
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>
```

ใช้ `AlertDialog` ไม่ใช่ `Dialog` — มันดัก Escape/คลิกนอกไม่ให้ปิดโดยไม่ตั้งใจ และประกาศ role ให้ screen reader ถูกต้อง

### ตาราง

ดูหน้าอ้างอิงเต็มที่ [`src/features/brand/pages/BrandPage.tsx`](../../../../src/features/brand/pages/BrandPage.tsx) — มีครบทั้ง
เลือกหลายแถว · เรียง · แบ่งหน้า · เมนู action · ยืนยันลบ · การ์ดสรุป

```tsx
<div className={TABLE_WRAP}>
  <table className={TABLE}>
    <thead>
      <tr>
        <th className={cn(TABLE_TH, 'w-10')}>{/* checkbox เลือกทั้งหน้า */}</th>
        <th className={TABLE_TH}>
          <button type="button" className={TH_SORT} onClick={() => toggleSort('name')}>
            ชื่อแบรนด์{sortIcon('name')}
          </button>
        </th>
      </tr>
    </thead>
    <tbody>
      {isLoading ? <tr><td colSpan={N} className={TABLE_EMPTY}>…</td></tr>
      : rows.length === 0 ? <tr><td colSpan={N} className={TABLE_EMPTY}>ข้อความว่าง + CTA</td></tr>
      : rows.map((r) => <tr key={r.id} data-selected={checked} className={TABLE_TR}>…</tr>)}
    </tbody>
  </table>
</div>
```

**สิ่งที่พลาดบ่อย**

- หัวคอลัมน์ที่กดเรียงได้ต้องเป็น `<button>` จริง ไม่ใช่ `<th onClick>` — ไม่งั้นคีย์บอร์ดกดไม่ได้
- คอลัมน์ action ใส่ `<span className="sr-only">ตัวเลือก</span>` ใน `<th>` ที่ว่าง
- ตัวเลขทุกคอลัมน์ `text-right font-mono tabular-nums` ให้หลักตรงกัน
- แถวเกิน ~100 ต้อง virtualize (`@tanstack/react-virtual` + spacer row) — ดู `ReportPage` แท็บ "ยอดขายตามสินค้า"

### ช่องเลือกที่ค้นได้

```tsx
const listRef = useRef<HTMLDivElement>(null);
const searchInputRef = useRef<HTMLInputElement>(null);
const combo = useCombobox({ listRef, options, value, onChange, localFilter: false, onSearch: setSearch });
```

- `listRef` **ผู้เรียกถือเอง** แล้วส่งเข้า hook — ห้ามให้ hook คืน ref ออกมา
  (React Compiler จะตีตราค่าที่ hook คืนทั้งก้อนว่าแตะ ref ไม่ได้ แล้วทุก `combo.x` กลายเป็น lint error)
- `localFilter: false` เมื่อ backend ค้นให้แล้ว (`dropdown-search`) — กรองซ้ำจะตัดผลของหน้าถัดไปทิ้ง
- `onOpenAutoFocus` ต้อง `preventDefault()` แล้วโฟกัสช่องค้นหาเอง
- ปุ่มล้างค่าต้องอยู่ **นอก** ปุ่ม trigger — `<button>` ซ้อน `<button>` เป็น HTML ที่ใช้ไม่ได้

มี component สำเร็จรูปต่อ entity อยู่แล้ว: `BrandSearchSelect` `CategorySearchSelect` `EmployeeSearchSelect`
`ShopSearchSelect` `SupplierSearchSelect` `ProductDropdownSelect` — **ใช้ตัวเหล่านี้ อย่าเขียนใหม่**

### สถานะของหน้า (loading / error / empty)

เขียนเป็นฟังก์ชัน `renderBody()` ในหน้าเพจ แล้วไล่ 3 กรณีตามลำดับ — ดู `OrderHistoryPage`
สถานะว่างต้องมี **CTA** เสมอ และแยกข้อความ "ไม่พบจากตัวกรอง" ออกจาก "ยังไม่มีข้อมูลเลย"

---

## Checklist ก่อนส่งงาน UI

- [ ] ไม่มี class ของ control พิมพ์ซ้ำ — ทุกอย่างมาจาก `styles.ts`
- [ ] ปุ่ม icon-only มี `aria-label`
- [ ] `Dialog.Content` มี `Dialog.Title` และ `aria-describedby={undefined}` ถ้าไม่มี Description
- [ ] โมดัลแก้ไข `reset()` ทุกครั้งที่เปิด
- [ ] ตารางมีสถานะ loading / empty (พร้อม CTA) / error
- [ ] รายการทำลายอยู่ล่างสุดของเมนูและเป็นสีแดง
- [ ] ตัวเลขใช้ `font-mono tabular-nums`
