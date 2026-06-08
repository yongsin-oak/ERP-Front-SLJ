import { InputNumber as AntInputNumber } from 'antd';
import type { InputNumberProps as AntInputNumberProps } from 'antd';

export interface PriceInputProps
  extends Omit<AntInputNumberProps<number>, 'prefix' | 'min' | 'precision' | 'formatter' | 'parser'> {
  currency?: string;
}

const formatter = (value: number | undefined) =>
  value != null ? value.toLocaleString('th-TH') : '';

const parser = (value: string | undefined) =>
  parseFloat((value ?? '').replace(/,/g, '')) || 0;

export function PriceInput({ currency = '฿', style, ...props }: PriceInputProps) {
  return (
    <AntInputNumber<number>
      prefix={currency}
      min={0}
      precision={2}
      formatter={formatter}
      parser={parser}
      style={{ width: '100%', ...style }}
      {...props}
    />
  );
}
