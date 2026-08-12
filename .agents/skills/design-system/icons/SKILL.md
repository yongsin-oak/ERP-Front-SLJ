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
- **Always go through `AppIcons`** — `import { AppIcons } from '@design-system'`. NEVER import `@tabler/icons-react` (or any icon lib) directly in a component.
- **Key by purpose, not shape** — `AppIcons.add` / `AppIcons.delete` / `AppIcons.search`, not `AppIcons.plus` / `AppIcons.trash`. The key says *what it's for / where it's used*.
- Icons default to **`size="1em"`** (inherit font-size, like the old antd icons). Pass `size={16}` to override. Pass `spin` for a spinning loader (`<AppIcons.loading spin />`).
- **Need an icon that's not in the map?** Add a new purpose-named entry to `src/design-system/icons.tsx` (import the Tabler glyph there, wrap with `make()`), then use `AppIcons.<key>`. Don't reach for the raw glyph in the component.

```tsx
import { AppIcons } from '@design-system';

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

## Adding a New Icon

1. Add the Tabler import to `src/design-system/icons.ts`
2. Add a new key to the `AppIcons` object with a JSDoc comment
3. If the concept exists in both Antd and Tabler, prefer Tabler when the Antd version is generic (e.g. `InboxOutlined` for "product" is weaker than `IconPackage`)

---

## Don't

- Import directly from `@tabler/icons-react` inside feature code — always go through `AppIcons`
- Add a new Tabler icon without documenting it in `AppIcons`
- Use two different icons for the same concept (e.g. `IconPackage` in one place and `InboxOutlined` in another to mean "product")
