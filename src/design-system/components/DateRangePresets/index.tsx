import type { ReactNode } from 'react';
import { DatePicker } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

export type DateRangeValue = [Dayjs | null, Dayjs | null] | null;

const PRESETS: RangePickerProps['presets'] = [
  { label: 'วันนี้',      value: [dayjs().startOf('day'), dayjs().endOf('day')] },
  { label: 'สัปดาห์นี้', value: [dayjs().startOf('week'), dayjs().endOf('week')] },
  { label: 'เดือนนี้',   value: [dayjs().startOf('month'), dayjs().endOf('month')] },
  { label: '3 เดือน',    value: [dayjs().subtract(3, 'month').startOf('day'), dayjs().endOf('day')] },
  { label: 'ปีนี้',      value: [dayjs().startOf('year'), dayjs().endOf('year')] },
];

export interface DateRangePresetsProps
  extends Omit<RangePickerProps, 'presets'> {
  extraPresets?: RangePickerProps['presets'];
  /** Replaces the default preset list entirely */
  customPresets?: RangePickerProps['presets'];
  placeholder?: [ReactNode, ReactNode];
}

export function DateRangePresets({
  extraPresets,
  customPresets,
  style,
  ...props
}: DateRangePresetsProps) {
  const presets = customPresets ?? [...PRESETS, ...(extraPresets ?? [])];

  return (
    <DatePicker.RangePicker
      presets={presets}
      style={{ width: '100%', ...style }}
      {...props}
    />
  );
}
