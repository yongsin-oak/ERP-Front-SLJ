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
  small: 'px-2.5 py-1 text-xs',
  middle: 'px-3 py-1.5 text-sm',
  large: 'px-4 py-2 text-base',
} as const;

function normalize(o: SegmentedOption | string): SegmentedOption {
  return typeof o === 'string' ? { label: o, value: o } : o;
}

export function Segmented({
  options,
  value,
  defaultValue,
  onChange,
  block,
  size = 'middle',
  disabled,
  className,
}: SegmentedProps) {
  const opts = options.map(normalize);
  const [internal, setInternal] = React.useState(defaultValue ?? opts[0]?.value);
  const current = value !== undefined ? value : internal;

  function pick(v: string) {
    if (value === undefined) setInternal(v);
    onChange?.(v);
  }

  return (
    <div
      className={cn(
        'inline-flex gap-1 rounded-lg bg-muted p-1',
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
            'focus-visible:ring-[3px] focus-visible:ring-ring/20',
            SIZE[size],
            block && 'flex-1',
            current === o.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
            (disabled || o.disabled) && 'cursor-not-allowed opacity-50',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
