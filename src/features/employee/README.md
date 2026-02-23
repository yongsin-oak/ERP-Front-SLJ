# Employee Feature

## โครงสร้าง

```
features/employee/
├── components/          # UI Components
│   ├── EmployeeTable.tsx        # ตารางแสดงข้อมูลพนักงาน
│   ├── EmployeeFormModal.tsx    # Modal สำหรับเพิ่ม/แก้ไขพนักงาน
│   └── EmployeeForm.config.ts   # Config ของ form fields
├── hooks/               # Custom hooks
│   └── useEmployee.ts           # Hook สำหรับจัดการ CRUD operations
├── pages/               # Pages
│   └── index.tsx                # หน้าหลักจัดการพนักงาน
├── services/            # API Services
│   └── employee.service.ts      # API calls ทั้งหมด
├── types/               # TypeScript types
│   ├── enums/
│   │   ├── Department.enum.ts   # Enum แผนกต่างๆ
│   │   └── Role.enum.ts         # Enum บทบาทผู้ใช้
│   └── interfaces/
│       └── Employee.interface.ts # Interface ของ Employee
└── index.ts             # Export หลักของ feature
```

## Features

### ✅ การจัดการพนักงาน (Employee Management)

- ✨ แสดงรายการพนักงานทั้งหมดในตาราง
- ➕ เพิ่มพนักงานใหม่ (SuperAdmin เท่านั้น)
- ✏️ แก้ไขข้อมูลพนักงาน (SuperAdmin เท่านั้น)
- 🗑️ ลบพนักงาน (SuperAdmin เท่านั้น)
- 🔍 กรองและเรียงลำดับข้อมูล
- 📱 Responsive design

## API Endpoints

### POST `/api/v1/employee`
**Access:** SuperAdmin

สร้างพนักงานใหม่

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "nickname": "Johnny",
  "phoneNumber": "1234567890",
  "startDate": "2023-01-01",
  "department": "Operator"
}
```

### GET `/api/v1/employee`
**Access:** All roles

ดึงข้อมูลพนักงานทั้งหมด

### GET `/api/v1/employee/{id}`
**Access:** All roles

ดึงข้อมูลพนักงานตาม ID

### PATCH `/api/v1/employee/{id}`
**Access:** SuperAdmin

อัพเดทข้อมูลพนักงาน

### DELETE `/api/v1/employee/{id}`
**Access:** SuperAdmin

ลบพนักงาน

## Types

### Employee Interface
```typescript
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  phoneNumber: string;
  startDate: string;
  department: Department;
  createdAt?: string;
  updatedAt?: string;
}
```

### Department Enum
```typescript
enum Department {
  Operator = "Operator",
  Warehouse = "Warehouse",
  Admin = "Admin",
  Accountant = "Accountant",
  HR = "HR",
  Marketing = "Marketing",
  Sales = "Sales",
}
```

## Components

### EmployeeTable
ตารางแสดงข้อมูลพนักงานพร้อม features:
- Sorting
- Filtering
- Pagination
- Action buttons (Edit, Delete)

### EmployeeFormModal
Modal สำหรับเพิ่ม/แก้ไขพนักงาน:
- Form validation
- Date picker สำหรับวันที่เริ่มงาน
- Select dropdown สำหรับแผนก

## Hooks

### useEmployee
Custom hook สำหรับจัดการ CRUD operations:

```typescript
const {
  employees,        // รายการพนักงานทั้งหมด
  loading,          // สถานะ loading
  fetchEmployees,   // ดึงข้อมูลใหม่
  createEmployee,   // เพิ่มพนักงาน
  updateEmployee,   // อัพเดทพนักงาน
  deleteEmployee,   // ลบพนักงาน
} = useEmployee();
```

## Permission

- **SuperAdmin**: สามารถเพิ่ม แก้ไข และลบพนักงานได้
- **All other roles**: สามารถดูข้อมูลพนักงานเท่านั้น

## การใช้งาน

```typescript
import { EmployeePage } from '@features/employee';

// ใน routes
<Route path="/employee" element={<EmployeePage />} />
```

## Dependencies

- `antd` - UI Components
- `dayjs` - Date handling
- `@lib/config/req` - Axios instance
- `@features/auth/services` - Authentication
