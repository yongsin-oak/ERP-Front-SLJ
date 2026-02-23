export enum Department {
  Operator = "Operator",
  Warehouse = "Warehouse",
  Admin = "Admin",
  Accountant = "Accountant",
  HR = "HR",
  Marketing = "Marketing",
  Sales = "Sales",
}

export const DepartmentLabels: Record<Department, string> = {
  [Department.Operator]: "ผู้ปฏิบัติงาน",
  [Department.Warehouse]: "คลังสินค้า",
  [Department.Admin]: "แอดมิน",
  [Department.Accountant]: "บัญชี",
  [Department.HR]: "บุคคล",
  [Department.Marketing]: "การตลาด",
  [Department.Sales]: "ขาย",
};
