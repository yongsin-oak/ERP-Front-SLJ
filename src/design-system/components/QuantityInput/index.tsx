import { InputNumber } from '../InputNumber';
import type { InputNumberProps } from '../InputNumber';
import { Select } from '../Select';
import { cn } from '@/lib/utils';

export const QUANTITY_UNITS = ['ชิ้น', 'กล่อง', 'แพ็ค', 'กก.', 'ลิตร', 'เมตร', 'อื่นๆ'] as const;
export type QuantityUnit = (typeof QUANTITY_UNITS)[number];

export interface QuantityInputProps
  extends Omit<InputNumberProps, 'addonAfter' | 'addonBefore' | 'min' | 'precision'> {
  unit?: QuantityUnit | string;
  onUnitChange?: (unit: string) => void;
  units?: string[];
}

export function QuantityInput({
  unit = 'ชิ้น',
  onUnitChange,
  units = [...QUANTITY_UNITS],
  style,
  className,
  ...props
}: QuantityInputProps) {
  return (
    <div className={cn('flex w-full', className)} style={style}>
      <InputNumber min={0} precision={0} className="w-auto flex-1 rounded-r-none" {...props} />
      <Select
        value={unit}
        onChange={(v) => v && onUnitChange?.(v)}
        options={units.map((u) => ({ value: u, label: u }))}
        popupMatchSelectWidth={false}
        disabled={props.disabled}
        className="w-24 shrink-0 rounded-l-none border-l-0"
      />
    </div>
  );
}
