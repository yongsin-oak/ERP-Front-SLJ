import { DatePickerProps, InputProps, SelectProps } from "antd";
import { NamePath } from "antd/es/form/interface";

export interface InputFields {
  name: NamePath;
  label?: string;
  span?: number;
  inputProps?: InputProps | SelectProps | DatePickerProps;
  datePickerInput?: boolean;
  selectInput?: boolean;
  customInput?: React.ReactNode;
  required?: boolean;
}
