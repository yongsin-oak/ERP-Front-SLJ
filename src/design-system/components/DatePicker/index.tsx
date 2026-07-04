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

const WEEKDAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

const SIZE_H = {
  small: 'h-8 text-sm',
  middle: 'h-9 text-sm',
  large: 'h-10 text-base',
} as const;

type PickerSize = keyof typeof SIZE_H;

function buildMonth(view: Dayjs): Dayjs[] {
  const start = view.startOf('month').startOf('week');
  return Array.from({ length: 42 }, (_, i) => start.add(i, 'day'));
}

const TRIGGER_CLASS =
  'flex w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-foreground shadow-xs transition-[color,border-color,box-shadow] duration-150 outline-none hover:border-border-strong focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 data-[state=open]:border-ring data-[state=open]:ring-[3px] data-[state=open]:ring-ring/20 disabled:cursor-not-allowed disabled:border-border disabled:bg-disabled-bg disabled:text-disabled';

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
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
        >
          <IconChevronLeft className="size-4" />
        </button>
        <div className="text-sm font-medium">{view.format('MMMM YYYY')}</div>
        <button
          type="button"
          aria-label="เดือนถัดไป"
          onClick={() => setView(view.add(1, 'month'))}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
        >
          <IconChevronRight className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="flex h-7 items-center justify-center text-xs text-muted-foreground">
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
                'mx-auto flex size-9 items-center justify-center text-sm transition-colors',
                ranged && !selected ? 'rounded-none bg-primary-subtle' : 'rounded-md',
                outside && !selected && 'text-foreground-subtle',
                selected && 'bg-primary font-medium text-primary-foreground',
                !selected && !disabled && 'hover:bg-accent',
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

export function DatePicker({
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
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [internal, setInternal] = React.useState<Dayjs | null>(defaultValue ?? null);
  const current = value !== undefined ? value : internal;
  const [view, setView] = React.useState<Dayjs>(current ?? dayjs());

  function pick(day: Dayjs) {
    if (value === undefined) setInternal(day);
    onChange?.(day, day.format(format));
    setOpen(false);
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    if (value === undefined) setInternal(null);
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
          <span className={cn('truncate', current == null && 'text-foreground-subtle')}>
            {current ? current.format(format) : placeholder}
          </span>
          <span className="flex shrink-0 items-center text-foreground-subtle">
            {allowClear && current && !disabled ? (
              <span role="button" tabIndex={-1} aria-label="ล้าง" onClick={clear} className="hover:text-foreground">
                <IconX className="size-4" />
              </span>
            ) : (
              <IconCalendar className="size-4 opacity-70" />
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
          <span className={cn('flex min-w-0 flex-1 items-center gap-1.5 truncate', !hasValue && 'text-foreground-subtle')}>
            {hasValue ? (
              <>
                {committed?.[0]?.format(format)}
                <span className="text-foreground-subtle">→</span>
                {committed?.[1]?.format(format)}
              </>
            ) : (
              `${placeholder[0]} → ${placeholder[1]}`
            )}
          </span>
          <span className="flex shrink-0 items-center text-foreground-subtle">
            {allowClear && hasValue && !disabled ? (
              <span role="button" tabIndex={-1} aria-label="ล้าง" onClick={clear} className="hover:text-foreground">
                <IconX className="size-4" />
              </span>
            ) : (
              <IconCalendar className="size-4 opacity-70" />
            )}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={4} className="flex w-auto gap-2 p-3">
        {presets && presets.length > 0 && (
          <div className="flex w-28 shrink-0 flex-col gap-0.5 border-r border-divider pr-2">
            {presets.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyPreset(p)}
                className="rounded-md px-2 py-1.5 text-left text-sm text-foreground hover:bg-accent"
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
