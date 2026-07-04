import * as React from 'react';
import { IconEye, IconEyeOff, IconX } from '@tabler/icons-react';
import { Textarea as UITextarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

/** antd-compatible imperative ref — คงไว้เพื่อไม่ต้องแก้ผู้เรียก (.focus()/.select()) */
export interface InputRef {
  focus: (options?: FocusOptions) => void;
  blur: () => void;
  select: () => void;
  input: HTMLInputElement | null;
}

type InputSize = 'small' | 'middle' | 'large';

const SIZE_H: Record<InputSize, string> = {
  small: 'h-8 text-sm',
  middle: 'h-9 text-sm',
  large: 'h-10 text-base',
};

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  size?: InputSize;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
  allowClear?: boolean;
  onPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  status?: 'error' | 'warning';
}

const FIELD_BASE =
  'flex w-full min-w-0 items-center gap-2 rounded-md border bg-background px-3 text-foreground shadow-xs transition-[color,border-color,box-shadow] duration-150 outline-none';
const FIELD_STATE =
  'hover:border-border-strong focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/20';
const ADDON =
  'flex items-center border border-input bg-muted px-3 text-sm whitespace-nowrap text-muted-foreground';

export const Input = React.forwardRef<InputRef, InputProps>(function Input(
  {
    size = 'middle',
    prefix,
    suffix,
    addonBefore,
    addonAfter,
    allowClear,
    onPressEnter,
    status,
    className,
    disabled,
    onChange,
    onKeyDown,
    value,
    style,
    ...props
  },
  ref,
) {
  const innerRef = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(
    ref,
    () => ({
      focus: (o?: FocusOptions) => innerRef.current?.focus(o),
      blur: () => innerRef.current?.blur(),
      select: () => innerRef.current?.select(),
      get input() {
        return innerRef.current;
      },
    }),
    [],
  );

  const hasAddon = addonBefore != null || addonAfter != null;
  const hasClear = allowClear && value != null && value !== '';

  const field = (
    <div
      className={cn(
        FIELD_BASE,
        FIELD_STATE,
        SIZE_H[size],
        status === 'error' &&
          'border-destructive focus-within:border-destructive focus-within:ring-destructive/20',
        status === 'warning' && 'border-warning focus-within:border-warning',
        !status && 'border-input',
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
        ref={innerRef}
        disabled={disabled}
        value={value}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onPressEnter?.(e);
          onKeyDown?.(e);
        }}
        className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-foreground-subtle disabled:cursor-not-allowed"
        {...props}
      />
      {hasClear && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="ล้าง"
          className="flex shrink-0 items-center text-foreground-subtle transition-colors hover:text-foreground"
          onClick={() =>
            onChange?.({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)
          }
        >
          <IconX className="size-4" />
        </button>
      )}
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
});

export function InputPassword(props: InputProps) {
  const [visible, setVisible] = React.useState(false);
  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      suffix={
        <button
          type="button"
          tabIndex={-1}
          aria-label={visible ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
          className="flex items-center text-foreground-subtle transition-colors hover:text-foreground"
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
        </button>
      }
    />
  );
}

export function InputSearch(props: InputProps) {
  return <Input {...props} />;
}

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** ignored — kept for antd API compatibility (ui Textarea auto-grows) */
  autoSize?: boolean | { minRows?: number; maxRows?: number };
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { autoSize: _autoSize, className, ...props },
  ref,
) {
  return <UITextarea ref={ref} className={className} {...props} />;
});
