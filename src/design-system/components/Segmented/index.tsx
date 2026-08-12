import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SegmentedOption {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
}

export interface SegmentedProps {
  options: (SegmentedOption | string)[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  block?: boolean;
  size?: 'small' | 'middle' | 'large';
  disabled?: boolean;
  className?: string;
}

const SIZE = {
  small: 'h-6.5 px-2 text-xs',
  middle: 'h-7.5 px-2.5 text-sm',
  large: 'h-8.5 px-3 text-sm',
} as const;

function normalize(o: SegmentedOption | string): SegmentedOption {
  return typeof o === 'string' ? { label: o, value: o } : o;
}

export function Segmented(props: SegmentedProps) {
  const {
    options,
    value,
    defaultValue,
    onChange,
    block,
    size = 'middle',
    disabled,
    className,
  } = props;

  const opts = options.map(normalize);
  const [internal, setInternal] = React.useState(defaultValue ?? opts[0]?.value);
  // controlled ตัดสินจาก "ส่ง prop value มาไหม" ไม่ใช่ค่าของมัน — เหตุผลเดียวกับ Select
  const isControlled = 'value' in props;
  const current = isControlled ? value : internal;

  function pick(v: string) {
    if (!isControlled) setInternal(v);
    onChange?.(v);
  }

  return (
    <div
      className={cn(
        // w-fit + self-start กันยืดเต็มความกว้างเมื่ออยู่ใน Form.Item (`flex flex-col` → stretch)
        'inline-flex w-fit self-start gap-1 rounded-md border border-border bg-surface-100 p-1',
        block && 'flex w-full',
        className,
      )}
    >
      {opts.map((o) => (
        <button
          key={o.value}
          type="button"
          disabled={disabled || o.disabled}
          onClick={() => pick(o.value)}
          className={cn(
            'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors outline-none',
            'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-stronger',
            SIZE[size],
            block && 'flex-1',
            current === o.value
              ? 'border border-border bg-background text-foreground shadow-none'
              : 'text-foreground-lighter hover:text-foreground',
            (disabled || o.disabled) && 'cursor-not-allowed opacity-50',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
