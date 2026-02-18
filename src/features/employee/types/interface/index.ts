export interface EmployeeForm {
  firstName: string;
  lastName: string;
  nickname: string;
  phoneNumber: string;
  department: {
    label: string;
    value: string;
    key: string;
  };
  startDate: string;
}
