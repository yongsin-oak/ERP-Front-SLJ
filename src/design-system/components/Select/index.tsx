import { Select as AntSelect } from 'antd';
import type { SelectProps as AntSelectProps } from 'antd';

export interface SelectProps<T = unknown> extends AntSelectProps<T> {}

export function Select<T = unknown>(props: SelectProps<T>) {
  return <AntSelect {...props} />;
}

Select.Option = AntSelect.Option;
