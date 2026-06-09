export const Departments = {
  Operator: { label: "ปฏิบัติการ", color: "blue" },
  Warehouse: { label: "คลังสินค้า", color: "orange" },
  Admin: { label: "แอดมิน", color: "purple" },
  Accountant: { label: "บัญชี", color: "green" },
  HR: { label: "HR", color: "pink" },
  Marketing: { label: "การตลาด", color: "cyan" },
  Sales: { label: "ขาย", color: "gold" },
} as const;

export type Department = keyof typeof Departments;

export const DepartmentOptions = Object.entries(Departments).map(
  ([value, cfg]) => ({
    value: value as Department,
    label: cfg.label,
  }),
);

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
