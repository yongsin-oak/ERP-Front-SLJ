import * as React from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconX,
} from '@tabler/icons-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { FIELD_BORDER } from '@/lib/fieldStyles';

const WEEKDAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

/** ความสูง control ตาม geometry contract — 30 / 34 / 38px (SUPABASE-DS-PLAN.md §2.4) */
const SIZE_H = {
  small: 'h-7.5 text-sm',
  middle: 'h-8.5 text-sm',
  large: 'h-9.5 text-sm',
} as const;

type PickerSize = keyof typeof SIZE_H;

function buildMonth(view: Dayjs): Dayjs[] {
  const start = view.startOf('month').startOf('week');
  return Array.from({ length: 42 }, (_, i) => start.add(i, 'day'));
}

const TRIGGER_CLASS = cn(
  'flex w-full items-center justify-between gap-2 rounded-md bg-control px-3 text-foreground',
  FIELD_BORDER,
);

interface MonthViewProps {
  view: Dayjs;
  setView: (v: Dayjs) => void;
  isSelected: (d: Dayjs) => boolean;
  isInRange?: (d: Dayjs) => boolean;
  onPick: (d: Dayjs) => void;
  onHover?: (d: Dayjs | null) => void;
  disabledDate?: (d: Dayjs) => boolean;
}

function MonthView({
  view,
  setView,
  isSelected,
  isInRange,
  onPick,
  onHover,
  disabledDate,
}: MonthViewProps) {
  const days = buildMonth(view);
  return (
    <div className="w-64 select-none" onMouseLeave={() => onHover?.(null)}>
      <div className="flex items-center justify-between pb-2">
        <button
          type="button"
          aria-label="เดือนก่อนหน้า"
          onClick={() => setView(view.subtract(1, 'month'))}
          className="flex size-7 items-center justify-center rounded-md text-foreground-lighter transition-colors duration-(--duration-fast) hover:bg-surface-200 hover:text-foreground"
        >
          <IconChevronLeft className="size-3.5" />
        </button>
        <div className="text-sm font-medium">{view.format('MMMM YYYY')}</div>
        <button
          type="button"
          aria-label="เดือนถัดไป"
          onClick={() => setView(view.add(1, 'month'))}
          className="flex size-7 items-center justify-center rounded-md text-foreground-lighter transition-colors duration-(--duration-fast) hover:bg-surface-200 hover:text-foreground"
        >
          <IconChevronRight className="size-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="flex h-7 items-center justify-center text-xs text-foreground-lighter">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const outside = day.month() !== view.month();
          const disabled = disabledDate?.(day) ?? false;
          const selected = isSelected(day);
          const ranged = isInRange?.(day) ?? false;
          return (
            <button
              key={day.valueOf()}
              type="button"
              disabled={disabled}
              onMouseEnter={() => onHover?.(day)}
              onClick={() => onPick(day)}
              className={cn(
                // size-9 ต้องเท่าความกว้างคอลัมน์ (w-64 ÷ 7 ≈ 36.5px) ห้ามลด — ไม่งั้นแถบช่วงวันที่
                // (ranged + rounded-none) จะขาดเป็นช่วงๆ แทนที่จะต่อกันเป็นแถบเดียว
                'mx-auto flex size-9 items-center justify-center font-mono text-sm tabular-nums transition-colors duration-(--duration-fast)',
                ranged && !selected ? 'rounded-none bg-primary-subtle' : 'rounded-md',
                outside && !selected && 'text-foreground-muted',
                selected && 'bg-primary font-medium text-primary-foreground',
                !selected && !disabled && 'hover:bg-surface-200',
                disabled && 'cursor-not-allowed opacity-30',
              )}
            >
              {day.date()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Single date ───────────────────────────────────────────────────────────────

export interface DatePickerProps {
  value?: Dayjs | null;
  defaultValue?: Dayjs | null;
  onChange?: (date: Dayjs | null, dateString: string) => void;
  format?: string;
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  size?: PickerSize;
  disabledDate?: (d: Dayjs) => boolean;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

export function DatePicker(props: DatePickerProps) {
  const {
    value,
    defaultValue,
    onChange,
    format = 'DD/MM/YYYY',
    placeholder = 'เลือกวันที่',
    allowClear = true,
    disabled,
    size = 'middle',
    disabledDate,
    className,
    style,
    id,
  } = props;

  const [open, setOpen] = React.useState(false);
  const [internal, setInternal] = React.useState<Dayjs | null>(defaultValue ?? null);
  // controlled ตัดสินจาก "ส่ง prop value มาไหม" ไม่ใช่ค่าของมัน — เหตุผลเดียวกับ Select
  const isControlled = 'value' in props;
  const current = isControlled ? (value ?? null) : internal;
  const [view, setView] = React.useState<Dayjs>(current ?? dayjs());

  function pick(day: Dayjs) {
    if (!isControlled) setInternal(day);
    onChange?.(day, day.format(format));
    setOpen(false);
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    if (!isControlled) setInternal(null);
    onChange?.(null, '');
  }

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        if (o) setView(current ?? dayjs());
        if (!disabled) setOpen(o);
      }}
    >
      <PopoverTrigger asChild>
        <button type="button" id={id} disabled={disabled} className={cn(TRIGGER_CLASS, SIZE_H[size], className)} style={style}>
          <span className={cn('truncate', current == null && 'text-foreground-muted')}>
            {current ? current.format(format) : placeholder}
          </span>
          <span className="flex shrink-0 items-center text-foreground-muted">
            {allowClear && current && !disabled ? (
              <span role="button" tabIndex={-1} aria-label="ล้าง" onClick={clear} className="hover:text-foreground">
                <IconX className="size-3.5" />
              </span>
            ) : (
              <IconCalendar className="size-3.5" />
            )}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={4} className="w-auto p-3">
        <MonthView
          view={view}
          setView={setView}
          isSelected={(d) => current != null && d.isSame(current, 'day')}
          onPick={pick}
          disabledDate={disabledDate}
        />
      </PopoverContent>
    </Popover>
  );
}

// ── Range ─────────────────────────────────────────────────────────────────────

export type RangeValue = [Dayjs | null, Dayjs | null] | null;

export interface DateRangePreset {
  label: React.ReactNode;
  value: [Dayjs, Dayjs];
}

export interface RangePickerProps {
  value?: RangeValue;
  onChange?: (dates: RangeValue, dateStrings: [string, string]) => void;
  presets?: DateRangePreset[];
  format?: string;
  placeholder?: [string, string];
  allowClear?: boolean;
  disabled?: boolean;
  size?: PickerSize;
  disabledDate?: (d: Dayjs) => boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function DateRangePicker({
  value,
  onChange,
  presets,
  format = 'DD/MM/YYYY',
  placeholder = ['วันเริ่มต้น', 'วันสิ้นสุด'],
  allowClear = true,
  disabled,
  size = 'middle',
  disabledDate,
  className,
  style,
}: RangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [start, setStart] = React.useState<Dayjs | null>(value?.[0] ?? null);
  const [end, setEnd] = React.useState<Dayjs | null>(value?.[1] ?? null);
  const [hover, setHover] = React.useState<Dayjs | null>(null);
  const [view, setView] = React.useState<Dayjs>(value?.[0] ?? dayjs());

  const committed = value ?? null;
  const hasValue = committed?.[0] != null && committed?.[1] != null;

  function commit(s: Dayjs, e: Dayjs) {
    onChange?.([s, e], [s.format(format), e.format(format)]);
    setOpen(false);
  }

  function pick(day: Dayjs) {
    if (!start || (start && end)) {
      setStart(day);
      setEnd(null);
      setHover(null);
      return;
    }
    let s = start;
    let e = day;
    if (e.isBefore(s, 'day')) [s, e] = [e, s];
    setStart(s);
    setEnd(e);
    commit(s, e);
  }

  function clear(ev: React.MouseEvent) {
    ev.stopPropagation();
    setStart(null);
    setEnd(null);
    onChange?.(null, ['', '']);
  }

  function applyPreset(p: DateRangePreset) {
    setStart(p.value[0]);
    setEnd(p.value[1]);
    setView(p.value[0]);
    commit(p.value[0], p.value[1]);
  }

  const rangeEnd = end ?? hover;
  const inRange = (d: Dayjs) => {
    if (!start || !rangeEnd) return false;
    const lo = start.isBefore(rangeEnd) ? start : rangeEnd;
    const hi = start.isBefore(rangeEnd) ? rangeEnd : start;
    return d.isAfter(lo, 'day') && d.isBefore(hi, 'day');
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        if (o) {
          setStart(value?.[0] ?? null);
          setEnd(value?.[1] ?? null);
          setHover(null);
          setView(value?.[0] ?? dayjs());
        }
        if (!disabled) setOpen(o);
      }}
    >
      <PopoverTrigger asChild>
        <button type="button" disabled={disabled} className={cn(TRIGGER_CLASS, SIZE_H[size], className)} style={style}>
          <span className={cn('flex min-w-0 flex-1 items-center gap-1.5 truncate', !hasValue && 'text-foreground-muted')}>
            {hasValue ? (
              <>
                {committed?.[0]?.format(format)}
                <span className="text-foreground-muted">→</span>
                {committed?.[1]?.format(format)}
              </>
            ) : (
              `${placeholder[0]} → ${placeholder[1]}`
            )}
          </span>
          <span className="flex shrink-0 items-center text-foreground-muted">
            {allowClear && hasValue && !disabled ? (
              <span role="button" tabIndex={-1} aria-label="ล้าง" onClick={clear} className="hover:text-foreground">
                <IconX className="size-3.5" />
              </span>
            ) : (
              <IconCalendar className="size-3.5" />
            )}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={4} className="flex w-auto gap-2 p-3">
        {presets && presets.length > 0 && (
          <div className="flex w-28 shrink-0 flex-col gap-0.5 border-r border-border-muted pr-2">
            {presets.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyPreset(p)}
                className="rounded-md px-2 py-1.5 text-left text-sm text-foreground hover:bg-surface-200"
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
        <MonthView
          view={view}
          setView={setView}
          isSelected={(d) =>
            (start != null && d.isSame(start, 'day')) || (end != null && d.isSame(end, 'day'))
          }
          isInRange={inRange}
          onPick={pick}
          onHover={setHover}
          disabledDate={disabledDate}
        />
      </PopoverContent>
    </Popover>
  );
}
