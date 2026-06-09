# Skill: Design System — Icons

> Two-library split, AppIcons map, and rules for domain icons.
> Back to parent: [design-system](../SKILL.md)

---

## Trigger

Use this skill when adding any icon to the UI.

---

## Two-Library Split

| Library | Purpose | How to import |
| --- | --- | --- |
| `@ant-design/icons` | Generic UI chrome — edit, delete, search, close, arrows, etc. | `import { EditOutlined } from '@ant-design/icons'` |
| `@tabler/icons-react` via `AppIcons` | Domain concepts where Antd falls short | `import { AppIcons } from '@design-system'` |

---

## AppIcons — Domain Icon Map

Defined in `src/design-system/icons.ts`. Import once, access by key:

```tsx
import { AppIcons } from '@design-system';

<AppIcons.product size={16} />
<AppIcons.baht size={14} />
<AppIcons.importFile size={16} />
<AppIcons.pin size={16} />
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

## Adding a New Icon

1. Add the Tabler import to `src/design-system/icons.ts`
2. Add a new key to the `AppIcons` object with a JSDoc comment
3. If the concept exists in both Antd and Tabler, prefer Tabler when the Antd version is generic (e.g. `InboxOutlined` for "product" is weaker than `IconPackage`)

---

## Don't

- Import directly from `@tabler/icons-react` inside feature code — always go through `AppIcons`
- Add a new Tabler icon without documenting it in `AppIcons`
- Use two different icons for the same concept (e.g. `IconPackage` in one place and `InboxOutlined` in another to mean "product")
