import { InputNumber as AntInputNumber } from 'antd';
import type { InputNumberProps as AntInputNumberProps } from 'antd';

export type InputNumberProps<T extends string | number = number> = AntInputNumberProps<T>;

export function InputNumber<T extends string | number = number>(props: InputNumberProps<T>) {
  return <AntInputNumber<T> style={{ width: '100%' }} {...props} />;
}
