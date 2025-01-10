import { InputFields } from "../../components/FormInputs/interface";

export const addEmployeeInputFields: InputFields[] = [
  {
    name: "firstName",
    label: "ชื่อจริง",
    span: 12,
    inputProps: {
      placeholder: "ชื่อจริง",
    },
  },
  {
    name: "lastName",
    label: "นามสกุล",
    span: 12,
    inputProps: {
      placeholder: "นามสกุล",
    },
  },
  {
    name: "nickname",
    label: "ชื่อเล่น",
    span: 8,
    inputProps: {
      placeholder: "ชื่อเล่น",
    },
  },
  {
    name: "phoneNumber",
    label: "เบอร์โทร",
    span: 16,
    inputProps: {
      placeholder: "เบอร์โทร",
    },
  },
  {
    name: "department",
    label: "แผนก",
    span: 12,
    selectInput: true,
    inputProps: {
      placeholder: "แผนก",
    },
  },
  {
    name: "startDate",
    label: "วันที่เริ่มงาน",
    span: 12,
    datePickerInput: true,
    inputProps: {
      placeholder: "วันที่เริ่มงาน",
    },
  },
];
