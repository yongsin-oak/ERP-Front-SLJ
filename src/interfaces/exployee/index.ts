import { Timestamped } from "@interfaces/common";

export interface EmployeeType extends Timestamped {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  phoneNumber: string;
  startDate: string;
  department: string;
}
