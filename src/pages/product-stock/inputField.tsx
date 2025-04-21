import { InputFields } from "../../components/FormInputs/interface";

export const addProductInputFields: InputFields[] = [
  {
    name: "barcode",
    label: "บาร์โค้ด",
    span: 12,
    inputProps: {
      placeholder: "บาร์โค้ด",
    },
  },
  {
    name: "name",
    label: "ชื่อสินค้า",
    span: 12,
    inputProps: {
      placeholder: "ชื่อสินค้า",
    },
  },
  {
    name: "brandId",
    label: "ยี่ห้อ",
    span: 12,
    inputComponent: "select",
    inputProps: {
      placeholder: "ยี่ห้อ",
      options: [
        { label: "Brand A", value: "Brand A" },
        { label: "Brand B", value: "Brand B" },
      ],
    },
  },
  {
    name: "categoryId",
    label: "หมวดหมู่",
    span: 12,
    inputComponent: "select",
    inputProps: {
      placeholder: "หมวดหมู่",
      options: [
        { label: "Category A", value: "Category A" },
        { label: "Category B", value: "Category B" },
      ],
    },
  },
  {
    name: "costPrice",
    label: "ราคาต้นทุน",
    span: 12,
    inputProps: {
      placeholder: "ราคาต้นทุน",
    },
  },
  {
    name: "sellingPrice",
    label: "ราคาขายปัจจุบัน",
    span: 12,
    inputProps: {
      placeholder: "ราคาขายปัจจุบัน",
    },
  },
  {
    name: "quantity",
    label: "จำนวนสินค้า",
    span: 12,
    inputProps: {
      placeholder: "จำนวนสินค้า",
    },
  },
  {
    name: "unit",
    label: "หน่วยนับ",
    span: 12,
    inputComponent: "select",
    inputProps: {
      placeholder: "หน่วยนับ",
      options: [
        { label: "ชิ้น", value: "piece" },
        { label: "กล่อง", value: "box" },
      ],
    },
  },
];
