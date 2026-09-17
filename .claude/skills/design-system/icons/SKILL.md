# Skill: Design System — Icons

> Tabler-only, AppIcons map, purpose-based naming.
> Back to parent: [design-system](../SKILL.md)

---

## Trigger

Use this skill when adding any icon to the UI.

## Atlassian reference contract

- ใช้หลัก [Atlassian iconography](https://atlassian.design/foundations/iconography) เพื่อเลือกไอคอนตามความหมาย รักษาขนาด/stroke ให้สอดคล้อง และไม่ใช้ไอคอนแทน label เมื่อความหมายไม่ชัด
- Interactive icon ต้องมี accessible name, hit area ที่เหมาะสม และ semantic color token; decorative icon ต้องไม่รบกวน screen reader
- ตัว glyph ของโปรเจกต์ยังใช้ `AppIcons`/Tabler ตามกฎด้านล่าง และ styling ใช้ Tailwind CSS เท่านั้น ห้าม Emotion/CSS-in-JS/Atlaskit

---

## Rules (Tabler-only, via AppIcons)

- **One library: `@tabler/icons-react`.** `@ant-design/icons` has been removed.
- **Always go through `AppIcons`** — `import { AppIcons } from '@/lib/icons'`. NEVER import `@tabler/icons-react` (or any icon lib) directly in a component.
- **Key by purpose, not shape** — `AppIcons.add` / `AppIcons.delete` / `AppIcons.search`, not `AppIcons.plus` / `AppIcons.trash`. The key says *what it's for / where it's used*.
- Icons default to **`size="1em"`** (inherit font-size, like the old antd icons). Pass `size={16}` to override. Pass `spin` for a spinning loader (`<AppIcons.loading spin />`).
- **Need an icon that's not in the map?** Add a new purpose-named entry to `src/lib/icons.tsx` (import the Tabler glyph there, wrap with `make()`), then use `AppIcons.<key>`. Don't reach for the raw glyph in the component.

```tsx
import { AppIcons } from '@/lib/icons';

<AppIcons.add />               {/* 1em — matches surrounding text */}
<AppIcons.delete size={16} />
<AppIcons.loading spin />
<AppIcons.baht size={14} />
```

| Key | Icon | Use case |
| --- | --- | --- |
| `dashboard` | Gauge | Dashboard KPI overview |
| `orders` | Clipboard list | Order list / history |
| `inventory` | Package | Product inventory page |
| `stockReceive` | Package import | Receive stock |
| `stockOut` | Package export | Issue / ship stock |
| `warehouse` | Building warehouse | Physical warehouse |
| `supplier` | Building store | Supplier / vendor page |
| `employees` | Users | Employee roster |
| `terminal` | Layout dashboard | POS terminal nav icon |
| `roles` | Shield check | Roles & permissions |
| `product` | Package | Single product |
| `products` | Packages | Product batch |
| `brand` | Tag | Brand tag |
| `category` | Category | Product category |
| `invoice` | Receipt | Receipt / tax invoice |
| `baht` | Currency Baht | Thai Baht price display |
| `delivery` | Truck delivery | Inbound shipment |
| `userAvatar` | User circle | Current user avatar |
| `userRole` | User shield | User + role UI |
| `department` | Briefcase | Employee department |
| `importFile` | Table import | Import from Excel / CSV |
| `exportFile` | Table export | Export to Excel / CSV |
| `barcode` | Barcode | Barcode scan / display |
| `pin` | Lock password | Numeric PIN entry |
| `apiKey` | Key | API key / access token |

---

## Exception: brand / platform glyphs

Marketplace brand marks (Shopee, TikTok, …) are **not** UI icons and do **not** go in `AppIcons` (Tabler doesn't cover them all — e.g. Lazada is absent). They live in the **shop feature** as monochrome single-path SVGs:

- `@features/shop` → `PlatformIcon` (raw glyph, `fill="currentColor"`) and `hasPlatformIcon(platform)`.
- `PlatformBadge` renders the glyph on the brand-colour square, falling back to the platform's first letter when no glyph exists (Lazada, LineOA, LineMan, Offline).
- Paths are from Simple Icons (viewBox `0 0 24 24`). To add one, drop its `d` into `PLATFORM_PATHS` in `PlatformIcon.tsx` — no `AppIcons` change.

This is the only sanctioned place a non-Tabler glyph may be inlined; keep all other icons in `AppIcons`.

---

## Usage guideline — icon ช่วยให้ "เข้าใจเร็วขึ้น" ไม่ใช่ให้ "ดูสวยขึ้น"

### กฎตัดสินใจ 3 ข้อ (ไล่ตามลำดับ)

1. **ผู้ใช้รู้ความหมายทันทีไหม?** → รู้ → icon-only ได้ (ค้นหา, ปิด, ลบ, แก้ไข, รีเฟรช)
2. **มีโอกาสตีความผิดไหม?** → มี → **icon + label** (นำเข้า, ส่งออก, ย้าย, เผยแพร่, เก็บเข้าคลัง — แต่ละระบบใช้สัญลักษณ์ไม่เหมือนกัน)
3. **เป็น action สำคัญหรืออันตรายไหม?** → ใช่ → **ห้ามให้ผู้ใช้เดา** ต้องมีข้อความเสมอ

ในโปรเจกต์นี้: action ท้ายแถวตารางไปอยู่ใน `ActionCell` (เมนู kebab) ซึ่ง **เป็นข้อความล้วนไม่มีไอคอน**
เพราะเมนูสั้นๆ อ่านเร็วกว่าเดาไอคอน และไอคอนครึ่งๆ กลางๆ ทำให้ข้อความไม่ตรงแนวกัน
ใส่ไอคอนได้ผ่าน `actions[].icon` เมื่อมันช่วยแยกแยะจริงๆ เท่านั้น

### Sizing / stroke / hit area

```
size-3   (12px)  meta / inline ในข้อความเล็ก
size-3.5 (14px)  ค่าเริ่มต้นของระบบ — ในปุ่ม, เมนู, input adornment, หัวตาราง
size-4   (16px)  ปุ่ม large, empty state ขนาดเล็ก
size-4.5 (18px)  sidebar nav
size-10+ (40px+) empty state / dropzone (ตกแต่ง — ต้อง aria-hidden)
```

- **stroke**: ใช้ค่า default ของ Tabler (2) ทุกที่ · ลดเป็น `stroke={1.25}` เฉพาะไอคอนขนาดใหญ่ใน empty state ที่เส้นหนาแล้วดูทึบ
- **ห้ามสลับ outline / filled โดยไม่มีเหตุผล** — ระบบนี้เป็น outline ทั้งหมด ยกเว้นคู่ที่สื่อ "สถานะเปลี่ยน" เช่น `warning` ↔ `warningFilled`
- **optical size**: ไอคอน 14px สองตัวอาจดูใหญ่ไม่เท่ากันเพราะรูปทรงต่างกัน ถ้าตัวไหนดูโดดให้ปรับตัวนั้นตัวเดียว อย่าปรับทั้งชุด
- **hit area ≠ ขนาดไอคอน**: ไอคอน 14px อยู่ในปุ่ม `size-7.5`/`size-8.5` (30/34px) ตาม geometry contract
  ผ่านเกณฑ์ WCAG 2.2 Target Size (Minimum) ที่ 24×24 CSS px — ปุ่มเล็กสุดของระบบคือ `size-6.5` (26px) ก็ยังผ่าน
  > ⚠️ ข้อยกเว้นสำหรับจอสัมผัส: หน้า Terminal / PinPad / mobile header ต้องใช้เป้ากด **≥ 44px**
  > ค่า 30–34px ของ DS ออกแบบมาสำหรับเมาส์บนจอเดสก์ท็อป — อย่าเอาไปใช้กับปุ่มที่พนักงานหน้าร้านกดด้วยนิ้ว

### Hierarchy

- ไอคอนของ secondary action ต้องเบากว่า primary — ใช้ `text-foreground-lighter`/`-muted` ไม่ใช่สีเต็ม
- destructive แยกออกได้ชัดตอนที่มันสำคัญ (ในเมนูเป็นสีแดง) แต่**ไม่ต้องเด่นตลอดเวลา** — นี่คือเหตุผลที่ปุ่มลบถูกยุบเข้าเมนู kebab แทนที่จะโผล่ทุกแถว

---

## Accessibility — ไม่ใช่ทุกไอคอนต้องมี `aria-label`

คำถามเดียวที่ต้องถาม: **ไอคอนนี้เป็นตัวสื่อความหมาย หรือแค่ประกอบข้อความที่มีอยู่แล้ว?**

| กรณี | ต้องทำ | วิธี |
| --- | --- | --- |
| ปุ่ม icon-only (ค้นหา / ลบ / ตั้งค่า / kebab) | ✅ ต้องมีชื่อ | `aria-label` ที่ **ปุ่ม** ไม่ใช่ที่ไอคอน |
| ปุ่มที่มีข้อความอยู่แล้ว (`<Button icon={...}>บันทึก</Button>`) | ❌ ไม่ต้อง | ข้อความคือชื่อปุ่มแล้ว ไอคอนถูก `aria-hidden` ให้อัตโนมัติ |
| ไอคอนสถานะที่ **ไม่มีข้อความกำกับ** (เช่น ✓ เดี่ยวๆ ในตาราง) | ✅ ต้องมี | ส่ง `aria-label` ที่ตัวไอคอนเอง — `AppIcons` จะเลิกซ่อนให้เอง |
| ไอคอนคู่ข้อความ (`⚠ รหัสผ่านไม่ถูกต้อง`) | ❌ ไม่ต้อง | ข้อความอธิบายครบแล้ว อ่านซ้ำจะรก |
| ไอคอนตกแต่ง (empty state, dropzone) | ❌ ต้องซ่อน | ได้ `aria-hidden` อัตโนมัติจาก `AppIcons` |

**`AppIcons` ใส่ `aria-hidden` ให้ทุกตัวโดยดีฟอลต์** และจะเลิกซ่อนเมื่อมีการส่ง `aria-label` มาที่ไอคอนโดยตรง
→ หน้าที่เดียวที่เหลือของผู้เขียนโค้ดคือ **ใส่ `aria-label` ให้ปุ่ม icon-only**

**อย่าสื่อความหมายด้วยสีอย่างเดียว** — Tag/Badge สถานะต้องมีข้อความ ไม่ใช่จุดสีเปล่าๆ

ตรวจซ้ำได้ด้วยการหา `<Button` ที่ self-closing + มี `icon=` แต่ไม่มี `aria-label`/`title`
(ณ ตอนเขียน: 0 จุด — ถ้าเพิ่มปุ่มใหม่แล้วลืม ให้แก้ทันที)

---

## Adding a New Icon

1. Add the Tabler import to `src/lib/icons.tsx`
2. Add a new key to the `AppIcons` object with a JSDoc comment — **ตั้งชื่อตามหน้าที่ ไม่ใช่รูปทรง**
3. เช็คก่อนว่าคีย์เดิมสื่อความหมายเดียวกันอยู่แล้วหรือเปล่า — อย่าเพิ่มคำพ้อง

---

## Don't

- Import directly from `@tabler/icons-react` inside feature code — always go through `AppIcons`
- Add a new Tabler icon without documenting it in `AppIcons`
- Use two different icons for the same concept (e.g. `IconPackage` in one place and `InboxOutlined` in another to mean "product")
