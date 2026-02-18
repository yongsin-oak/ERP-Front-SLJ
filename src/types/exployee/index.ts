import { Timestamped } from "../common";

export interface EmployeeType extends Timestamped {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  phoneNumber: string;
  startDate: string;
  department: string;
}

export type EmployeeData = Omit<EmployeeType, "id" | "createdAt" | "updatedAt">;
