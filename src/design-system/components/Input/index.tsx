import * as React from 'react';
import { IconEye, IconEyeOff, IconX } from '@tabler/icons-react';
import { Textarea as UITextarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { FIELD_BORDER_WITHIN, FIELD_BORDER_WARNING } from '@/lib/fieldStyles';

/** antd-compatible imperative ref — คงไว้เพื่อไม่ต้องแก้ผู้เรียก (.focus()/.select()) */
export interface InputRef {
  focus: (options?: FocusOptions) => void;
  blur: () => void;
  select: () => void;
  input: HTMLInputElement | null;
}

type InputSize = 'small' | 'middle' | 'large';

const SIZE_H: Record<InputSize, string> = {
  small: 'h-7.5 text-sm',
  middle: 'h-8.5 text-sm',
  large: 'h-9.5 text-sm',
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
  'flex w-full min-w-0 items-center gap-2 rounded-md bg-control px-3 text-foreground ease-out';
const ADDON =
  'flex items-center border border-border-control bg-surface-100 px-3 text-sm whitespace-nowrap text-foreground-light';

export const Input = React.forwardRef<InputRef, InputProps>(function Input(props, ref) {
  const {
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
    ...rest
  } = props;

  // controlled = ผู้เรียกส่ง prop `value` มา (แม้จะเป็น undefined) → ต้องคุมค่าตลอดอายุ component
  // coerce undefined/null → '' กัน React เตือน "uncontrolled → controlled" ตอน value เปลี่ยนจาก undefined เป็นค่าจริง
  // ไม่ส่ง `value` เลย = uncontrolled (ใช้ defaultValue) → ปล่อย undefined ไว้เหมือนเดิม
  const inputValue = 'value' in props ? (value ?? '') : undefined;

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
      // aria-invalid/data-disabled บนกล่อง → FIELD_BORDER_WITHIN คุม state ทั้งหมดให้เอง
      aria-invalid={status === 'error' || undefined}
      data-disabled={disabled || undefined}
      className={cn(
        FIELD_BASE,
        FIELD_BORDER_WITHIN,
        SIZE_H[size],
        status === 'warning' && FIELD_BORDER_WARNING,
        hasAddon && 'rounded-none',
        addonBefore != null && addonAfter == null && 'rounded-r-md',
        addonAfter != null && addonBefore == null && 'rounded-l-md',
        className,
      )}
      style={hasAddon ? undefined : style}
    >
      {prefix != null && (
        <span className="flex shrink-0 items-center text-foreground-muted">{prefix}</span>
      )}
      <input
        ref={innerRef}
        disabled={disabled}
        value={inputValue}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onPressEnter?.(e);
          onKeyDown?.(e);
        }}
        className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-foreground-muted disabled:cursor-not-allowed"
        {...rest}
      />
      {hasClear && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="ล้าง"
          className="flex shrink-0 items-center text-foreground-muted transition-colors duration-(--duration-fast) hover:text-foreground"
          onClick={() =>
            onChange?.({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)
          }
        >
          <IconX className="size-3.5" />
        </button>
      )}
      {suffix != null && (
        <span className="flex shrink-0 items-center text-foreground-muted">{suffix}</span>
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
          className="flex items-center text-foreground-muted transition-colors duration-(--duration-fast) hover:text-foreground"
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <IconEyeOff className="size-3.5" /> : <IconEye className="size-3.5" />}
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
  void _autoSize;
  return <UITextarea ref={ref} className={className} {...props} />;
});
