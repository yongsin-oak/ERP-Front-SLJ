import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { DateRangePicker } from '../DatePicker';
import type { RangePickerProps, DateRangePreset } from '../DatePicker';

export type DateRangeValue = [Dayjs | null, Dayjs | null] | null;

const PRESETS: DateRangePreset[] = [
  { label: 'วันนี้', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
  { label: 'สัปดาห์นี้', value: [dayjs().startOf('week'), dayjs().endOf('week')] },
  { label: 'เดือนนี้', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
  { label: '3 เดือน', value: [dayjs().subtract(3, 'month').startOf('day'), dayjs().endOf('day')] },
  { label: 'ปีนี้', value: [dayjs().startOf('year'), dayjs().endOf('year')] },
];

export interface DateRangePresetsProps extends Omit<RangePickerProps, 'presets'> {
  extraPresets?: DateRangePreset[];
  /** Replaces the default preset list entirely */
  customPresets?: DateRangePreset[];
}

export function DateRangePresets({ extraPresets, customPresets, ...props }: DateRangePresetsProps) {
  const presets = customPresets ?? [...PRESETS, ...(extraPresets ?? [])];
  return <DateRangePicker presets={presets} {...props} />;
}
