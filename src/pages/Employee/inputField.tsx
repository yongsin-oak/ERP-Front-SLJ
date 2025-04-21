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
    span: 10,
    inputProps: {
      placeholder: "ชื่อเล่น",
    },
  },
  {
    name: "phoneNumber",
    label: "เบอร์โทร",
    span: 14,
    inputProps: {
      placeholder: "เบอร์โทร",
    },
  },
  {
    name: "department",
    label: "แผนก",
    span: 12,
    inputComponent: "select",
    inputProps: {
      placeholder: "แผนก",
      options: [
        { label: "บัญชี", value: "Accounting" },
        { label: "แอดมิน", value: "Admin" },
        { label: "บุคคล", value: "HR" },
        { label: "ผู้ปฏิบัตงาน", value: "Operator" },
      ],
    },
  },
  {
    name: "startDate",
    label: "วันที่เริ่มงาน",
    span: 12,
    inputComponent: "datePicker",
    inputProps: {
      placeholder: "วันที่เริ่มงาน",
    },
  },
];
