import * as React from 'react';
import { RadioGroup as UIRadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

export interface RadioChangeEvent {
  target: { value: string };
}

export interface RadioProps {
  value: string;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export interface RadioOption {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options?: RadioOption[];
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  onChange?: (e: RadioChangeEvent) => void;
  optionType?: 'default' | 'button';
  className?: string;
  children?: React.ReactNode;
}

function RadioBase({ value, disabled, children, className }: RadioProps) {
  return (
    <label
      className={cn(
        'inline-flex cursor-pointer select-none items-center gap-2 text-sm text-foreground',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <RadioGroupItem value={value} disabled={disabled} />
      {children != null && <span>{children}</span>}
    </label>
  );
}

function RadioGroup({
  options,
  value,
  defaultValue,
  disabled,
  onChange,
  className,
  children,
}: RadioGroupProps) {
  return (
    <UIRadioGroup
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      onValueChange={(v) => onChange?.({ target: { value: v } })}
      className={cn('flex flex-wrap gap-x-4 gap-y-2', className)}
    >
      {options
        ? options.map((opt) => (
            <RadioBase key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </RadioBase>
          ))
        : children}
    </UIRadioGroup>
  );
}

export const Radio = Object.assign(RadioBase, {
  Group: RadioGroup,
  Button: RadioBase,
});
