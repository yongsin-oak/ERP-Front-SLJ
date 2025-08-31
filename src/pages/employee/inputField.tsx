import { InputFields } from "../../components/Form/FormInputs/interface";
import { Role } from "../../enums/Role.enum";

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
        { label: "ผู้ปฏิบัติงาน", value: Role.Operator },
        { label: "คลังสินค้า", value: Role.Warehouse },
        { label: "แอดมิน", value: Role.Admin },
        { label: "บัญชี", value: Role.Accountant },
        { label: "บุคคล", value: Role.HR },
        { label: "การตลาด", value: Role.Marketing },
        { label: "ขาย", value: Role.Sales },
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
