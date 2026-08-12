import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean, event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  size?: 'small' | 'default';
  checkedChildren?: React.ReactNode;
  unCheckedChildren?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Switch({
  checked,
  defaultChecked = false,
  onChange,
  disabled,
  size = 'default',
  checkedChildren,
  unCheckedChildren,
  className,
  style,
}: SwitchProps) {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = React.useState(defaultChecked);
  const on = isControlled ? checked : internal;

  const small = size === 'small';
  const label = on ? checkedChildren : unCheckedChildren;

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (disabled) return;
    const next = !on;
    if (!isControlled) setInternal(next);
    onChange?.(next, e);
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        // w-fit + self-start จำเป็น: Form.Item ห่อ control ด้วย `flex flex-col` ซึ่ง align-items
        // เป็น stretch โดยดีฟอลต์ → มีแค่ min-w สวิตช์จะยืดเต็มความกว้างฟอร์ม/โมดัล
        'relative inline-flex w-fit shrink-0 self-start items-center rounded-full align-middle transition-colors outline-none',
        'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-stronger',
        on ? 'bg-primary' : 'bg-control-off',
        disabled && 'cursor-not-allowed opacity-50',
        small ? 'h-4' : 'h-5.5',
        small ? 'min-w-7' : 'min-w-11',
        className,
      )}
      style={style}
    >
      {label != null && (
        <span
          className={cn(
            'select-none text-primary-foreground',
            small ? 'text-[10px]' : 'text-xs',
            on
              ? small ? 'pr-3.5 pl-1.5' : 'pr-5 pl-2'
              : small ? 'pl-3.5 pr-1.5' : 'pl-5 pr-2',
          )}
        >
          {label}
        </span>
      )}
      <span
        className={cn(
          'absolute rounded-full bg-control-thumb shadow-sm transition-all',
          small ? 'size-3 top-0.5' : 'size-4.5 top-0.5',
          on
            ? small ? 'left-[calc(100%-14px)]' : 'left-[calc(100%-20px)]'
            : 'left-0.5',
        )}
      />
    </button>
  );
}
