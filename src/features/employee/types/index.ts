export type Department =
  | 'Operator'
  | 'Warehouse'
  | 'Admin'
  | 'Accountant'
  | 'HR'
  | 'Marketing'
  | 'Sales';

export const DepartmentOptions: { label: string; value: Department }[] = [
  { label: 'ปฏิบัติการ', value: 'Operator' },
  { label: 'คลังสินค้า', value: 'Warehouse' },
  { label: 'แอดมิน', value: 'Admin' },
  { label: 'บัญชี', value: 'Accountant' },
  { label: 'HR', value: 'HR' },
  { label: 'การตลาด', value: 'Marketing' },
  { label: 'ขาย', value: 'Sales' },
];

export const DepartmentLabel: Record<Department, string> = {
  Operator: 'ปฏิบัติการ',
  Warehouse: 'คลังสินค้า',
  Admin: 'แอดมิน',
  Accountant: 'บัญชี',
  HR: 'HR',
  Marketing: 'การตลาด',
  Sales: 'ขาย',
};

export const DepartmentColor: Record<Department, string> = {
  Operator: 'blue',
  Warehouse: 'orange',
  Admin: 'purple',
  Accountant: 'green',
  HR: 'pink',
  Marketing: 'cyan',
  Sales: 'gold',
};

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  phoneNumber: string;
  department: Department;
  startDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  nickname: string;
  phoneNumber: string;
  department: Department;
  startDate: string;
}

export type UpdateEmployeeDto = Partial<CreateEmployeeDto>;
