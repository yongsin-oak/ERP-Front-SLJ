import { Department } from "../enums/Department.enum";

export interface Employee {
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

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  nickname: string;
  phoneNumber: string;
  startDate: string;
  department: Department;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {}
