# SLJ Supply Center — ERP Frontend

ระบบ ERP สำหรับ SLJ Supply Center ธุรกิจจำหน่ายวัสดุบรรจุภัณฑ์ ขายส่งและขายปลีก ผ่านช่องทาง Shopee, Lazada, TikTok, LINE MAN และหน้าร้าน

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| UI Framework | React 19 |
| Build Tool | Vite 7 |
| Package Manager | Bun |
| Language | TypeScript 5.9 (strict) |
| UI Components | Ant Design 6 |
| Styling | Emotion (`@emotion/styled`) |
| State Management | Zustand 5 |
| Server State | TanStack React Query 5 |
| Routing | React Router 7 |
| HTTP Client | Axios (with auto token refresh) |
| Forms | react-hook-form + zod |
| Virtual List | TanStack Virtual 3 |
| Drag & Drop | dnd-kit |
| Charts | Recharts 3 |
| Date | Day.js |
| Excel/CSV | SheetJS (xlsx) |
| Icons | Ant Design Icons + Tabler Icons |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- Backend API running (see [ERP-Back-SLJ](../ERP-Back-SLJ))

### Install & Run

```bash
# Install dependencies
bun install

# Start dev server
bun dev

# Build for production
bun run build

# Preview production build
bun run preview
```

Dev server: `http://localhost:5173`

### Environment

สร้างไฟล์ `.env.local`:

```env
VITE_API_URL=http://localhost:3000
```

---

## Project Structure

```text
src/
├── app/                    # App bootstrap
│   ├── providers/          # ThemeProvider, QueryProvider
│   └── router/             # Routes (all pages lazy-loaded)
├── design-system/          # Shared UI primitives
│   ├── components/         # Button, Table, PageHeader, FormModal, ActionCell…
│   ├── icons/              # AppIcons domain icon map
│   └── tokens/             # Colors, spacing, typography
├── features/               # Business domain modules
│   ├── auth/               # Login, profile, auth state
│   ├── brand/
│   ├── category/
│   ├── dashboard/          # Sales & stock overview
│   ├── employee/
│   ├── inventory/          # Product catalog & stock
│   ├── order/              # Order entry & history
│   ├── report/             # Sales reports
│   ├── role/
│   ├── shop/               # Shop / platform config
│   ├── stock-entry/        # Stock movements
│   ├── supplier/
│   ├── terminal/           # POS device management
│   └── user/
├── layouts/                # AppLayout (sidebar + responsive header)
└── shared/                 # Utilities shared across features
    ├── api/                # Axios instance, error handling
    ├── constants/          # STALE_TIME, GC_TIME, PAGINATION
    └── utils/sheet/        # useSheet — Excel/CSV export & import
```

Each feature follows the same anatomy:

```text
features/<name>/
├── components/             # Feature-scoped components
├── pages/                  # Page components (lazy-loaded)
├── react-query/            # queries, mutations, services, queryKeys
└── types/                  # TypeScript types
```

---

## Path Aliases

| Alias | Maps to |
| --- | --- |
| `@assets` | `src/assets` |
| `@design-system` | `src/design-system` |
| `@lib` | `src/lib` |
| `@features` | `src/features` |
| `@layouts` | `src/layouts` |
| `@routes` | `src/routes` |
| `@shared` | `src/shared` |

---

## Features

### Dashboard

ภาพรวมยอดขายรายวัน/สัปดาห์/เดือน แยกตามร้านค้าและแพลตฟอร์ม พร้อมกราฟ

### สินค้าคงคลัง (Inventory)

- จัดการสินค้า: barcode, ราคาทุน/ขาย (แพ็ค/ลัง), สต็อกคงเหลือ, สต็อกขั้นต่ำ
- **Import**: อัปโหลด `.xlsx` / `.csv` / Google Sheets export พร้อม column mapping wizard
- **Export**: ดาวน์โหลด Excel ทั้งหมดตาม filter ที่เลือก
- แจ้งเตือนสินค้าใกล้หมดสต็อกเมื่อเข้าสู่ระบบ

### Order Entry

บันทึกคำสั่งซื้อแบบ paper-order — เลือกพนักงาน → ร้านค้า → กรอกเลขออเดอร์ → สแกนสินค้า รองรับ keyboard-only flow สำหรับ Operator

### ประวัติออเดอร์ (Order History)

ค้นหา กรอง bulk delete ดูรายละเอียดออเดอร์ และ Export Excel

### รับสินค้าเข้า / ปรับสต็อก (Stock Entry)

บันทึกการเคลื่อนไหวสต็อก: รับเข้า, รับคืน, ปรับ, ของเสีย พร้อมประวัติ Export ได้

### รายงาน (Report)

4 แท็บ ทุกแท็บ Export Excel ได้:

- ยอดขายรวม (รายวัน/สัปดาห์/เดือน)
- ยอดขายตามร้านค้า
- ยอดขายตามสินค้า
- ชั่วโมงทำงานพนักงาน

### พนักงาน, ซัพพลายเออร์

จัดการข้อมูล + Import bulk จาก Excel + Export Excel

### การตั้งค่า (Settings)

ร้านค้า, แบรนด์, หมวดหมู่, บัญชีผู้ใช้, Terminal, บทบาท — จัดการโดย SuperAdmin / Admin

---

## Roles & Access

| Role | สิทธิ์ |
| --- | --- |
| `SuperAdmin` | เข้าถึงทุกอย่าง รวมถึง Stock Adjust และการตั้งค่าระบบ |
| `Admin` | จัดการร้านค้า ออเดอร์ สินค้า พนักงาน |
| `Operator` | บันทึกออเดอร์ (Order Entry) |
| `Warehouse` | รับสินค้าเข้า ดูสต็อก |
| `Accountant` | ดูรายงาน Export ข้อมูล |
| `HR` | จัดการพนักงาน |
| `Marketing` / `Sales` | ดูรายงานยอดขาย |

---

## Excel Export / Import

### Export (ทุกตาราง)

กด **Export Excel** บนทุกหน้า — backend สร้างไฟล์ `.xlsx` พร้อม filter ทั้งหมด รองรับข้อมูลถึง 10,000+ แถว

```ts
// Pattern ใน feature page
async function handleExport() {
  const res = await productService.exportXlsx({ search, brandId, categoryId });
  downloadFile(res.data as unknown as Blob, 'สินค้า.xlsx');
}
```

**Backend endpoints** (ทุก endpoint รองรับ filter params เดียวกับ list endpoint):

- `GET /product/export`
- `GET /order/export`
- `GET /stock-entry/export`
- `GET /employee/export`
- `GET /supplier/export`
- `GET /report/sales-summary/export`
- `GET /report/sales-by-shop/export`
- `GET /report/sales-by-product/export`
- `GET /report/man-hour/export`

### Import (สินค้า, พนักงาน)

`SheetImportModal` — wizard 3 ขั้นตอน:

1. อัปโหลด `.xlsx` / `.csv` (รวมถึงไฟล์ที่ export จาก Google Sheets)
2. Map columns ไฟล์กับ field ของระบบ
3. ตรวจสอบ / แก้ไขข้อมูลก่อน import

---

## Key Conventions

- **Named exports** ทุกไฟล์ — ยกเว้น `App.tsx`, `main.tsx`
- **ไม่ใช้ `any`** — ใช้ `unknown` และ narrow แทน
- **Server state** → React Query · **Shared UI state** → Zustand · **Local UI state** → `useState`
- **ทุก mutation** ต้องมี `onError: handleError('...')`
- **ทุก page** ต้องรองรับ loading / empty / error state ผ่าน `PageShell`
- **ทุกการลบ** ต้องผ่าน `DeleteConfirmButton`
- **ไม่ใช้ `new Date()`** — ใช้ `dayjs` แทน
- **ไม่ใช้ raw `axios`** — ใช้ `req` จาก `@shared`
- **ทุก page lazy-loaded** ผ่าน `lazy()` + `<Suspense>`
- **ไม่ hardcode query keys** — ใช้ key factory จาก `queryKeys.ts` ของแต่ละ feature
- **ไม่ hardcode สี / ขนาด** — ใช้ design tokens จาก `@design-system/tokens`

---

## Development Notes

- **Dev bypass auth**: flag `IS_BYPASS` ใน `src/features/auth/stores/useAuth.ts`
- **React Query DevTools**: เปิดผ่าน panel ล่างขวาใน dev mode
- **`bun dev:clear`**: ล้าง Vite cache เมื่อมีปัญหา module resolution
- **Claude Code instructions**: ดูที่ `CLAUDE.md` และ `.claude/skills/`
