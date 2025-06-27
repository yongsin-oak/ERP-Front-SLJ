import {
  ColProps,
  DatePickerProps,
  InputNumberProps,
  InputProps,
  SelectProps,
} from "antd";
import { NamePath } from "antd/es/form/interface";
import { MFormItemProps } from "../MFormItem";
// Base fields ที่ใช้ร่วมกันทุก input
type InputFieldBase = {
  name?: NamePath;
  label?: string;
  span?: number;
  customInput?: React.ReactNode;
  required?: boolean;
  colProps?: ColProps;
  formItemProps?: MFormItemProps;
};

// กรณีที่เจาะจง inputComponent
type InputFieldDatePicker = InputFieldBase & {
  inputComponent: "datePicker";
  inputProps?: DatePickerProps;
};

type InputFieldSelect = InputFieldBase & {
  inputComponent: "select";
  inputProps?: SelectProps;
};

type InputFieldNumber = InputFieldBase & {
  inputComponent: "number";
  inputProps?: InputNumberProps & {
    nofloat?: boolean; // กรณีไม่ต้องการให้มีจุดทศนิยม
  };
};

// ✅ กรณี default = "input" สามารถเว้น inputComponent ไปได้
type InputFieldDefaultInput = InputFieldBase & {
  inputComponent?: "input"; // optional และจะถือเป็น default
  inputProps?: InputProps;
};

// รวมทั้งหมด
export type InputFields =
  | InputFieldDefaultInput
  | InputFieldDatePicker
  | InputFieldSelect
  | InputFieldNumber;
