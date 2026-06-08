import { InputNumber as AntInputNumber, Select } from 'antd';
import type { InputNumberProps as AntInputNumberProps } from 'antd';

export const QUANTITY_UNITS = ['ชิ้น', 'กล่อง', 'แพ็ค', 'กก.', 'ลิตร', 'เมตร', 'อื่นๆ'] as const;
export type QuantityUnit = (typeof QUANTITY_UNITS)[number];

export interface QuantityInputProps
  extends Omit<AntInputNumberProps<number>, 'addonAfter' | 'min' | 'precision'> {
  unit?: QuantityUnit | string;
  onUnitChange?: (unit: string) => void;
  units?: string[];
}

export function QuantityInput({
  unit = 'ชิ้น',
  onUnitChange,
  units = [...QUANTITY_UNITS],
  style,
  ...props
}: QuantityInputProps) {
  return (
    <AntInputNumber<number>
      min={0}
      precision={0}
      addonAfter={
        <Select
          value={unit}
          onChange={onUnitChange}
          style={{ width: 80 }}
          size="small"
          options={units.map(u => ({ value: u, label: u }))}
          popupMatchSelectWidth={false}
        />
      }
      style={{ width: '100%', ...style }}
      {...props}
    />
  );
}
