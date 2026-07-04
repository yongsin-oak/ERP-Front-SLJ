import * as React from 'react';
import { Checkbox as UICheckbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export interface CheckboxChangeEvent {
  target: { checked: boolean; value?: unknown };
}

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  value?: unknown;
  onChange?: (e: CheckboxChangeEvent) => void;
  children?: React.ReactNode;
  className?: string;
}

export interface CheckboxGroupProps {
  options?: Array<{ label: React.ReactNode; value: string; disabled?: boolean }>;
  value?: string[];
  defaultValue?: string[];
  disabled?: boolean;
  onChange?: (checkedValues: string[]) => void;
  className?: string;
}

function CheckboxBase({
  checked,
  defaultChecked,
  indeterminate,
  disabled,
  value,
  onChange,
  children,
  className,
}: CheckboxProps) {
  return (
    <label
      className={cn(
        'inline-flex cursor-pointer select-none items-center gap-2 text-sm text-foreground',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <UICheckbox
        checked={indeterminate ? 'indeterminate' : checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onCheckedChange={(c) => onChange?.({ target: { checked: c === true, value } })}
      />
      {children != null && <span>{children}</span>}
    </label>
  );
}

function CheckboxGroup({
  options = [],
  value,
  defaultValue,
  disabled,
  onChange,
  className,
}: CheckboxGroupProps) {
  const [internal, setInternal] = React.useState<string[]>(defaultValue ?? []);
  const selected = value ?? internal;

  function toggle(v: string, checked: boolean) {
    const next = checked ? [...selected, v] : selected.filter((x) => x !== v);
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }

  return (
    <div className={cn('flex flex-wrap gap-x-4 gap-y-2', className)}>
      {options.map((opt) => (
        <CheckboxBase
          key={opt.value}
          checked={selected.includes(opt.value)}
          disabled={disabled || opt.disabled}
          onChange={(e) => toggle(opt.value, e.target.checked)}
        >
          {opt.label}
        </CheckboxBase>
      ))}
    </div>
  );
}

export const Checkbox = Object.assign(CheckboxBase, { Group: CheckboxGroup });
