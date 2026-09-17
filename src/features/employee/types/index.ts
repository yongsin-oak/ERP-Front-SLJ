import type { DataColor } from '@/lib/styles';

/**
 * ผูกชนิด `color` กับจานสีเชิงหมวดหมู่ใน styles.ts — พิมพ์ชื่อสีที่ไม่มีจริงแล้ว build ไม่ผ่าน
 * (ก่อนหน้านี้ HR ใช้ "pink" ซึ่งไม่มีในจานสี ทำให้หลุดไปใช้ CSS named color ตรงๆ
 *  คือไม่ใช่โทเคน ไม่สลับตาม dark mode — เปลี่ยนเป็น magenta ที่ใกล้ที่สุดในจานสี)
 */
export const Departments = {
  Operator: { label: "ปฏิบัติการ", color: "blue" },
  Warehouse: { label: "คลังสินค้า", color: "orange" },
  Admin: { label: "แอดมิน", color: "purple" },
  Accountant: { label: "บัญชี", color: "green" },
  HR: { label: "HR", color: "magenta" },
  Marketing: { label: "การตลาด", color: "cyan" },
  Sales: { label: "ขาย", color: "gold" },
} as const satisfies Record<string, { label: string; color: DataColor }>;

export type Department = keyof typeof Departments;

export const DepartmentOptions = Object.entries(Departments).map(
  ([value, cfg]) => ({
    value: value as Department,
    label: cfg.label,
  }),
);

/**
 * แถวจาก `/employee/dropdown-search` — ไม่ใช่ `Employee` เต็ม
 * แยกชื่อ 3 ส่วนไว้เพราะ picker ประกอบเป็น "ชื่อ นามสกุล (ชื่อเล่น)" เอง
 * และ highlight คำค้นต้องตรงกับสตริงที่ประกอบนั้น
 */
export interface EmployeeOption {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  phoneNumber: string | null;
  department: Department;
  startDate: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  nickname: string;
  phoneNumber?: string;
  department: Department;
  startDate?: string;
  isActive?: boolean;
}

export type UpdateEmployeeDto = Partial<CreateEmployeeDto>;
