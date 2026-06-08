import { DatePicker as AntDatePicker } from 'antd';
import type { DatePickerProps as AntDatePickerProps } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';

export type { DatePickerProps } from 'antd';

export function DatePicker(props: AntDatePickerProps) {
  return <AntDatePicker style={{ width: '100%' }} {...props} />;
}

export function DateRangePicker(props: RangePickerProps) {
  return <AntDatePicker.RangePicker style={{ width: '100%' }} {...props} />;
}
