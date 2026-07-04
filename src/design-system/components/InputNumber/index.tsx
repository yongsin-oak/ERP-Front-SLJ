import * as React from 'react';
import { cn } from '@/lib/utils';

type InputNumberSize = 'small' | 'middle' | 'large';

const SIZE_H: Record<InputNumberSize, string> = {
  small: 'h-8 text-sm',
  middle: 'h-9 text-sm',
  large: 'h-10 text-base',
};

export interface InputNumberProps {
  value?: number | null;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  formatter?: (value: number | undefined) => string;
  parser?: (displayValue: string | undefined) => string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  size?: InputNumberSize;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  controls?: boolean;
}

const ADDON =
  'flex items-center border border-input bg-muted px-3 text-sm whitespace-nowrap text-muted-foreground';

export function InputNumber({
  value,
  onChange,
  min,
  max,
  precision,
  formatter,
  parser,
  prefix,
  suffix,
  addonBefore,
  addonAfter,
  placeholder,
  disabled,
  size = 'middle',
  id,
  className,
  style,
}: InputNumberProps) {
  const [focused, setFocused] = React.useState(false);
  const [draft, setDraft] = React.useState('');

  const display = focused
    ? draft
    : value == null || Number.isNaN(value)
      ? ''
      : formatter
        ? formatter(value)
        : precision != null
          ? value.toFixed(precision)
          : String(value);

  function parse(raw: string): number | null {
    const cleaned = parser ? parser(raw) : raw.replace(/[^\d.-]/g, '');
    if (cleaned === '' || cleaned === '-' || cleaned === '.') return null;
    const n = Number(cleaned);
    return Number.isNaN(n) ? null : n;
  }

  function commit(n: number | null) {
    let next = n;
    if (next != null) {
      if (min != null && next < min) next = min;
      if (max != null && next > max) next = max;
      if (precision != null) next = Number(next.toFixed(precision));
    }
    onChange?.(next);
  }

  const hasAddon = addonBefore != null || addonAfter != null;

  const field = (
    <div
      className={cn(
        'flex w-full min-w-0 items-center gap-2 rounded-md border border-input bg-background px-3 text-foreground shadow-xs transition-[color,border-color,box-shadow] duration-150 outline-none',
        'hover:border-border-strong focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/20',
        SIZE_H[size],
        disabled && 'pointer-events-none cursor-not-allowed border-border bg-disabled-bg text-disabled',
        hasAddon && 'rounded-none',
        addonBefore != null && addonAfter == null && 'rounded-r-md',
        addonAfter != null && addonBefore == null && 'rounded-l-md',
        className,
      )}
      style={hasAddon ? undefined : style}
    >
      {prefix != null && (
        <span className="flex shrink-0 items-center text-foreground-subtle">{prefix}</span>
      )}
      <input
        id={id}
        inputMode="decimal"
        disabled={disabled}
        placeholder={placeholder}
        value={display}
        onFocus={() => {
          setFocused(true);
          setDraft(value == null || Number.isNaN(value) ? '' : String(value));
        }}
        onChange={(e) => {
          setDraft(e.target.value);
          commit(parse(e.target.value));
        }}
        onBlur={() => setFocused(false)}
        className="min-w-0 flex-1 bg-transparent text-right tabular-nums outline-none placeholder:text-left placeholder:text-foreground-subtle disabled:cursor-not-allowed"
      />
      {suffix != null && (
        <span className="flex shrink-0 items-center text-foreground-subtle">{suffix}</span>
      )}
    </div>
  );

  if (!hasAddon) return field;

  return (
    <div className={cn('flex w-full', SIZE_H[size])} style={style}>
      {addonBefore != null && <span className={cn(ADDON, 'rounded-l-md border-r-0')}>{addonBefore}</span>}
      {field}
      {addonAfter != null && <span className={cn(ADDON, 'rounded-r-md border-l-0')}>{addonAfter}</span>}
    </div>
  );
}
