# Skill: Design System — Feedback & Interaction Decisions

> เลือก component ให้ตรง **จุดประสงค์** ไม่ใช่ตามชื่อ — ทีมจะใช้ตรงกัน ไม่เอา Dialog มาแจ้ง success และไม่ยัด validation ลง Toast
> Back to parent: [design-system](../SKILL.md) · Catalog: [components](../components/SKILL.md) · Principles: [style/ux-laws](../../style/ux-laws/SKILL.md)

---

## Trigger

Use this skill when:

- ต้องแจ้งอะไรผู้ใช้ (สำเร็จ / ผิดพลาด / คำเตือน / สถานะค้าง) แล้วไม่แน่ใจว่าใช้ตัวไหน
- กำลังจะเรียก `notify.*`, ใส่ `Modal`, หรือวาง `Alert`/`Banner`
- ทำ flow ที่ลบได้ / undo ได้ / retry ได้
- Reviewer เจอ Dialog แจ้ง success, Toast โชว์ validation error, หรือ Alert แจ้งผลชั่วคราวแล้วหาย

## Atlassian reference contract

- ใช้ [Atlassian components](https://atlassian.design/components) ตรวจ intent, persistence, urgency และ interaction ของ Modal dialog, Flag, Banner, Section message, Tooltip และ form validation
- ข้อความต้องชัด กระชับ บอกผลและทางแก้; feedback สำคัญต้องไม่พึ่งสีอย่างเดียว และต้องเข้าถึงได้ด้วย keyboard/screen reader
- Implement ด้วย Tailwind CSS + Radix/Sonner wrappers ของโปรเจกต์เท่านั้น ห้าม Emotion, CSS-in-JS และ `@atlaskit/*`

---

## กฎเดียวที่ต้องจำ

> **ถ้าผู้ใช้ปิดมันทิ้งแล้วระบบไม่เสียหาย → มันไม่ควรเป็น Dialog**

Dialog ขัดจังหวะและบังคับตัดสินใจ ใช้เท่าที่จำเป็นจริง ๆ. Success / ผลลัพธ์สั้น ๆ = Toast. สถานะที่ยังค้าง = Banner. Error ของ field = Inline.

---

## Decision matrix — จุดประสงค์ → component จริงในโปรเจกต์นี้

| จุดประสงค์ | ใช้ | import | อย่าใช้เมื่อ |
| --- | --- | --- | --- |
| ต้องให้ผู้ใช้ **ตัดสินใจ** ก่อนไปต่อ (ยืนยันลบ, ออกโดยไม่เซฟ, session หมด) | `Modal` / `FormModal` | `@design-system` | แจ้ง success (→ Toast) |
| ยืนยัน **ลบ** รายการเดียว / ท้ายแถว | `DeleteConfirmButton` | `@design-system` | ลบหลายรายการพร้อม summary (→ `ConfirmDrawer`) |
| ยืนยัน **งานเสี่ยงหลายรายการ** (กรอก → ทวนยอด → ยืนยัน) | `ConfirmDrawer` | `@design-system` | ยืนยันเล็ก ๆ รายการเดียว (→ `DeleteConfirmButton`) |
| แจ้ง **ผลสั้น ๆ** ที่หายเองได้ (บันทึกแล้ว, คัดลอกแล้ว) | `notify.success/info` | `@shared` | Error ของ form (→ Inline) |
| แจ้ง **error จาก mutation** | `handleError('ชื่องาน')` ใน `onError` | `@shared` | validation ของ field (→ Inline) |
| แจ้งผล **+ ปุ่มเดียว** (Undo / Retry / ดู) | `notify.action` / `notify.undo` / `notify.retry` | `@shared` | error สำคัญที่ต้องหยุด (→ Dialog) |
| **สถานะที่ยังมีผลบนหน้า** (ออฟไลน์, draft ค้าง, สิทธิ์ใกล้หมด) | `Banner` | `@design-system` | ผลชั่วคราวที่ควรหายเอง (→ Toast) |
| **error ของ field** ในฟอร์ม | `Form.Item` rules / `Field`/`TextField` `error` | `@design-system` | error ระดับระบบ (→ Toast/Dialog) |
| อธิบายเพิ่ม "อันนี้คืออะไร" | `Tooltip` | `@design-system` | ข้อมูลสำคัญที่ห้ามพลาด (→ Banner/inline text) |
| เมนู action ย่อย / ข้อมูลเพิ่ม (⋮) | `ui/popover` primitive | `@/components/ui/popover` | ยืนยันการลบ (→ `DeleteConfirmButton`) |
| เนื้อหาเยอะเกิน Dialog (ฟิลเตอร์, ตั้งค่า, ตะกร้า) | `Drawer` | `@design-system` | ต้องบังคับตัดสินใจสั้น ๆ (→ `Modal`) |
| **ไม่มีข้อมูล** | `Empty` / `PageShell` emptyAction | `@design-system` | ระหว่างโหลด (→ Skeleton/Spinner) |
| **กำลังโหลด** — รู้ layout | `ui/skeleton` | `@/components/ui/skeleton` | ไม่รู้ว่าจะโหลดอะไร (→ `Spinner`) |
| **กำลังทำงาน** — ปลายเปิด (ปุ่ม submit) | `Spinner` / `Button loading` | `@design-system` | รู้ layout อยู่แล้ว (→ Skeleton) |

---

## แต่ละตัว: ใช้เมื่อ / อย่าใช้เมื่อ + โค้ด

### Dialog — `Modal` / `FormModal` / `DeleteConfirmButton` / `ConfirmDrawer`

เหมาะกับ: ลบ · ออกจากหน้าโดยยังไม่เซฟ · session หมดอายุ · ยืนยันจ่ายเงิน · ขอสิทธิ์
**ห้าม**: Save success, Login success, Copy success — พวกนี้ปิดทิ้งได้โดยไม่เสียหาย = Toast

```tsx
// ยืนยันลบ (inline/table) — popover ยืนยันมาในตัว, onConfirm คืน Promise → ปุ่ม loading + กันกดซ้ำ
<DeleteConfirmButton title="ลบสินค้า?" description="สต็อกจะหายด้วย"
  onConfirm={() => del.mutateAsync(id)} />
```

> ไม่มี `Modal.confirm` imperative API แล้ว (ถอด antd ไปตั้งแต่ 2026-07) — ใช้ `DeleteConfirmButton` / `ConfirmDrawer` แทน

### Toast — `notify.success / warning / error` (Sonner)

เหมาะกับ: บันทึกแล้ว · อัปเดตแล้ว · คัดลอกแล้ว · เข้าสู่ระบบสำเร็จ. หายเอง ไม่บังการทำงาน
**ห้าม**: validation error ของ form (ผู้ใช้ไม่รู้ว่าช่องไหนผิด), payment failed แบบต้องแก้ (→ Dialog)

```tsx
onSuccess: () => notify.success('บันทึกสินค้าแล้ว'),
onError: handleError('บันทึกสินค้า'),   // toast error พร้อม backend message ให้อัตโนมัติ
```

- `notify.error` **ค้างจนผู้ใช้ปิดเอง** (duration Infinity) — error ต้องไม่หายก่อนอ่าน
- งานยาว: `const id = notify.loading('กำลังนำเข้า...')` → `notify.resolve(id, 'success', 'นำเข้าเสร็จ')`

### Snackbar — `notify.action` / `notify.undo` / `notify.retry` *(เพิ่มใหม่)*

Toast ที่มี **ปุ่มเดียว**. เหมาะกับสิ่งที่ **ย้อนกลับได้ / ลองใหม่ได้** — ตาม golden rule "Recovery ดีกว่า confirm ทุกครั้ง"

```tsx
// Undo: ทำจริงทันที แล้วเปิดช่องให้ย้อน — ลื่นกว่าการเด้ง Dialog ถามก่อนทุกครั้ง
del.mutate(id, {
  onSuccess: () => notify.undo('ลบสินค้าแล้ว', () => restore.mutate(id)),
});

// Retry: error ที่ลองซ้ำได้ (เช่น network)
onError: () => notify.retry('อัปโหลดไม่สำเร็จ', () => upload.mutate(file)),

// ทั่วไป: ปุ่ม action กำหนดเอง
notify.action('ย้ายไปถังขยะแล้ว', { actionLabel: 'ดู', onAction: openTrash, type: 'info' });
```

**ห้าม**: error สำคัญที่ต้องหยุดและตัดสินใจ (→ Dialog). Snackbar เป็นทางเลือก ไม่ใช่ที่บังคับ

### Banner — `Banner` *(เพิ่มใหม่, wrapper ของ `Alert`)*

อยู่บนหน้า **ไม่หายเอง** — ใช้กับ **สถานะที่ยังมีผลอยู่**: โหมดออฟไลน์ · draft ค้าง · สิทธิ์ใกล้หมด
**ห้าม**: success ชั่วคราว (→ Toast)

```tsx
<Banner type="warning" message="สิทธิ์การใช้งานจะหมดอายุใน 3 วัน"
  action={<Button variant="link" size="small">ต่ออายุ</Button>} />

// ปิดได้ + จำว่าปิดไปแล้ว → คู่กับ useLocalStorage (ดู skill ux-persistence)
<Banner type="info" message="มีข้อมูลค้างอยู่" closable onClose={clearDraft}
  action={<Button variant="link" size="small">ล้างและเริ่มใหม่</Button>} />
```

> `Alert` (ตัวฐาน) ยังใช้ได้สำหรับ status box ในหน้า/ในโมดัล; `Banner` = `Alert` ที่เปิดไอคอน default + มีปุ่มปิด. อย่าใช้ `Alert type="success"` แทน success toast

### Inline validation — `Form.Item` / `Field` / `TextField`

error ของ form **ต้องอยู่ใต้ field เสมอ** ผู้ใช้ถึงรู้ว่าช่องไหนผิด
**ห้าม**: เอา validation ไป Toast/Dialog

```tsx
<Form.Item name="email" rules={[{ required: true }, { type: 'email' }]}>
  <Input />
</Form.Item>
// หรือ inline field: <TextField error={errors.email?.message} {...register('email')} />
```

### Tooltip / Popover

- `Tooltip` — ตอบ "อันนี้คืออะไร" (ⓘ ราคานี้รวม VAT) — ห้ามใส่ข้อมูลสำคัญที่ห้ามพลาด หรือขั้นตอนยาว
- `ui/popover` — เมนู action ย่อย / ปฏิทิน / ข้อมูลเพิ่ม — **ห้าม**เอามายืนยันการลบ (ใช้ `DeleteConfirmButton` ที่ประกอบ popover + ปุ่มอันตรายมาให้แล้ว)

### Empty / Loading (สรุป — รายละเอียดที่ skill อื่น)

- Empty ต้องมี **คำอธิบาย + CTA** ไม่ใช่แค่ "No Data" → `Empty` / `PageShell` `emptyAction` (ดู [components](../components/SKILL.md) `PageShell`)
- โหลดครั้งแรกที่รู้ layout → **Skeleton** (ไม่ใช่จอขาว); ปลายเปิด → `Spinner` / `Button loading` (ดู [performance](../../performance/SKILL.md), [style/ux-laws](../../style/ux-laws/SKILL.md) Doherty)

---

## ระดับความรุนแรง → ช่องทาง

| ระดับ | ปกติใช้ | ตัวอย่าง |
| --- | --- | --- |
| Success | Toast + อัปเดต UI ทันที | บันทึกแล้ว · ลบแล้ว(+undo) |
| Info | Toast หรือ Banner (ถ้าค้าง) | มีเวอร์ชันใหม่ · โหมดออฟไลน์ |
| Warning | Banner; หรือ Dialog ถ้าต้องตัดสินใจ | พื้นที่ใกล้เต็ม · สิทธิ์ใกล้หมด |
| Error เล็ก | Toast (`handleError`) | บันทึกไม่สำเร็จ · คัดลอกไม่ได้ |
| Error ของ field | Inline | กรุณากรอกอีเมล |
| Error ใหญ่ ต้องแก้ | Dialog + Retry | จ่ายเงินไม่สำเร็จ |

---

## Anti-patterns (ตรวจตอน review)

- ❌ Dialog แจ้ง "บันทึกสำเร็จ / OK" → ✅ `notify.success` แล้วอัปเดต UI ทันที
- ❌ `notify.error('อีเมลไม่ถูกต้อง')` สำหรับ field → ✅ Inline ใต้ช่อง
- ❌ `Alert type="success"` เด้งแล้วอยากให้หายเอง → ✅ Toast (Alert/Banner ไม่หายเอง)
- ❌ ปุ่ม Submit ถูก disable เฉย ๆ โดยไม่บอกเหตุผล → ✅ บอกว่าทำไม (เช่น hint "ต้องกรอกรหัสผ่าน") ข้าง ๆ
- ❌ ถาม confirm ตอน **Save** (positive action) → ✅ confirm เฉพาะงานทำลายข้อมูล; ที่เหลือให้ undo
- ❌ error ดิบ "Error 500" → ✅ `getErrorMessage(err)` (backend message) + ทางแก้/Retry

---

## Cross-links

- Golden rules / UX laws (Fitts, Hick, Doherty, Recovery>Confirm, One Primary Action) → [style/ux-laws](../../style/ux-laws/SKILL.md)
- Catalog + props ของทุก component → [components](../components/SKILL.md)
- จำ draft/filter ไม่ให้ผู้ใช้กรอกซ้ำ (คู่กับ Banner "มีข้อมูลค้าง") → [ux-persistence](../../ux-persistence/SKILL.md)
- error contract ของ backend (`getErrorMessage` / `getErrorCode` / `handleError`) → [project-context](../../project-context/SKILL.md) §4
- Motion ของ overlay/toast (150–300ms, fade/scale/slide) → [style/animation](../../style/animation/SKILL.md)
