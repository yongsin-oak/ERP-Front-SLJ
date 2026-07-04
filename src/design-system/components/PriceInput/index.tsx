import { InputNumber } from '../InputNumber';
import type { InputNumberProps } from '../InputNumber';

export interface PriceInputProps
  extends Omit<InputNumberProps, 'prefix' | 'min' | 'precision' | 'formatter' | 'parser'> {
  currency?: string;
}

const formatter = (value: number | undefined) =>
  value != null
    ? value.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '';

export function PriceInput({ currency = '฿', ...props }: PriceInputProps) {
  return <InputNumber prefix={currency} min={0} precision={2} formatter={formatter} {...props} />;
}
