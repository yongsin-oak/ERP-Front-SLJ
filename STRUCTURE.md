# โครงสร้างโปรเจกต์ - Feature-based Architecture

โปรเจกต์นี้ถูกปรับโครงสร้างเป็นแบบ Feature-based เพื่อให้การจัดการโค้ดและการพัฒนาทำได้ง่ายขึ้น

## โครงสร้างหลัก

```
src/
├── features/           # Feature modules ต่างๆ
│   ├── auth/          # Authentication & Authorization
│   ├── dashboard/     # Dashboard/Home page
│   ├── employee/      # Employee management
│   ├── product/       # Product & Stock management
│   ├── sell/          # Sales (POS, Delivery, E-commerce)
│   ├── shop/          # Shop management
│   └── user/          # User management
│
├── components/        # Shared components ที่ใช้ข้าม features
│   ├── common/        # Base UI components
│   ├── Form/          # Form components
│   └── tableComps/    # Table components
│
├── lib/               # Configuration & utilities
│   ├── config/        # API config (req.ts)
│   └── theme/         # Theme & styling configs
│
├── types/             # Global TypeScript types
│   ├── common/
│   ├── exployee/
│   ├── order/
│   ├── product/
│   └── shop/
│
├── utils/             # Global utility functions
│   ├── common/
│   └── product/
│
├── layouts/           # Layout components
├── routes/            # Routing configuration
└── pages/             # Special pages (error, example)
```

## โครงสร้างของแต่ละ Feature

แต่ละ feature มีโครงสร้างที่สอดคล้องกัน:

```
features/<feature-name>/
├── components/    # Components เฉพาะของ feature นี้
├── hooks/         # Custom hooks เฉพาะของ feature
├── pages/         # Pages/Routes ของ feature
├── services/      # API calls & business logic
├── stores/        # State management (Zustand)
└── types/         # TypeScript types เฉพาะ feature
```

## Path Aliases

โปรเจกต์ใช้ path aliases เพื่อความสะดวกในการ import:

- `@features/*` - Feature modules
- `@components/*` - Shared components
- `@lib/*` - Config & theme
- `@types` - Global types
- `@utils/*` - Utility functions
- `@layouts/*` - Layout components
- `@pages/*` - Special pages
- `@routes/*` - Routing

## ตัวอย่างการใช้งาน

### Import จาก feature อื่น

```typescript
// Import auth service
import { useAuth } from '@features/auth/services';

// Import product types
import type { ProductData } from '@types';

// Import shared components
import { MButton } from '@components/common';
```

### Import ภายใน feature เดียวกัน

```typescript
// ใน features/product/pages/index.tsx
import { useProductStore } from '../stores/productStore';
import { onUploadProducts } from '../hooks';
```

## Features

### 🔐 Auth
- การ login/logout
- การจัดการ authentication state
- Protected routes

### 📊 Dashboard
- หน้าแรกของระบบ
- Dashboard แสดงข้อมูลภาพรวม

### 👥 Employee
- จัดการข้อมูลพนักงาน
- Role management

### 📦 Product
- จัดการสินค้าและสต๊อก
- Import/Export สินค้า
- Product forms

### 💰 Sell
- POS (Point of Sale)
- Direct Sell
- Delivery management
- E-commerce orders

### 🏪 Shop
- จัดการข้อมูลร้านค้า
- Platform integration (Shopee, Lazada)

### 👤 User
- จัดการข้อมูลผู้ใช้

## การเพิ่ม Feature ใหม่

1. สร้างโฟลเดอร์ใหม่ใน `src/features/<feature-name>/`
2. สร้างโครงสร้างย่อย: `components/`, `hooks/`, `pages/`, `services/`, `stores/`, `types/`
3. สร้าง `index.ts` เพื่อ export สิ่งที่ต้องการให้ features อื่นใช้
4. อัพเดท routing ใน `src/routes/index.tsx`

## หมายเหตุ

- ใช้ `import type` สำหรับการ import types เพื่อหลีกเลี่ยงปัญหา TypeScript
- Shared components อยู่ใน `src/components/` เท่านั้น
- Feature-specific components ควรอยู่ใน `features/<name>/components/`
- Global types อยู่ใน `src/types/` และ export ผ่าน `@types`
