import { Department, DepartmentLabels } from "../types/enums";

interface FormFieldOption {
  label: string;
  value: string;
}

interface FormField {
  name: string;
  label: string;
  span: number;
  inputComponent?: "input" | "select" | "datePicker";
  inputProps?: {
    placeholder?: string;
    format?: string;
    options?: FormFieldOption[];
  };
  required?: boolean;
}

export const employeeFormFields: FormField[] = [
  {
    name: "firstName",
    label: "ชื่อจริง",
    span: 12,
    inputProps: {
      placeholder: "กรอกชื่อจริง",
    },
    required: true,
  },
  {
    name: "lastName",
    label: "นามสกุล",
    span: 12,
    inputProps: {
      placeholder: "กรอกนามสกุล",
    },
    required: true,
  },
  {
    name: "nickname",
    label: "ชื่อเล่น",
    span: 12,
    inputProps: {
      placeholder: "กรอกชื่อเล่น",
    },
    required: true,
  },
  {
    name: "phoneNumber",
    label: "เบอร์โทรศัพท์",
    span: 12,
    inputProps: {
      placeholder: "กรอกเบอร์โทรศัพท์",
    },
    required: true,
  },
  {
    name: "department",
    label: "แผนก",
    span: 12,
    inputComponent: "select",
    inputProps: {
      placeholder: "เลือกแผนก",
      options: Object.values(Department).map((dept) => ({
        label: DepartmentLabels[dept],
        value: dept,
      })),
    },
    required: true,
  },
  {
    name: "startDate",
    label: "วันที่เริ่มงาน",
    span: 12,
    inputComponent: "datePicker",
    inputProps: {
      placeholder: "เลือกวันที่เริ่มงาน",
      format: "DD/MM/YYYY",
    },
    required: true,
  },
];
