import { DatePickerProps, InputProps, SelectProps } from "antd";

export interface InputFields {
  name: string;
  label?: string;
  span?: number;
  inputProps?: InputProps | SelectProps | DatePickerProps;
  datePickerInput?: boolean;
  selectInput?: boolean;
  customInput?: React.ReactNode;
}
