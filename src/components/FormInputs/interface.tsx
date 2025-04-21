import { DatePickerProps, InputProps, SelectProps } from "antd";
import { NamePath } from "antd/es/form/interface";

export interface InputFields {
  name: NamePath;
  label?: string;
  span?: number;
  inputProps?: InputProps | SelectProps | DatePickerProps;
  customInput?: React.ReactNode;
  required?: boolean;
  inputComponent?: "datePicker" | "select" | "input";
}
