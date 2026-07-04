import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input as BaseInput } from '@/components/ui/input';
import { Textarea as BaseTextarea } from '@/components/ui/textarea';

/* ────────────────────────────────────────────────────────────────────────
   Field — labeled control wrapper (Stripe-style)
   label + control + hint/error · ผูก a11y (aria-describedby) ให้ผ่าน id
   ──────────────────────────────────────────────────────────────────────── */

export interface FieldProps {
  label?: React.ReactNode;
  /** helper text ใต้ control */
  hint?: React.ReactNode;
  /** ข้อความ error — ทับ hint และเปลี่ยนเป็นสี error */
  error?: React.ReactNode;
  required?: boolean;
  /** id ของ control ภายใน เพื่อผูก <label htmlFor> + aria id */
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

export function Field({ label, hint, error, required, htmlFor, className, children }: FieldProps) {
  const hasError = error != null && error !== false;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label != null && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </label>
      )}
      {children}
      {hasError ? (
        <p id={htmlFor ? `${htmlFor}-error` : undefined} className="text-[13px] leading-snug text-error">
          {error}
        </p>
      ) : hint != null ? (
        <p id={htmlFor ? `${htmlFor}-hint` : undefined} className="text-[13px] leading-snug text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   TextField — Field + <input> (+ prefix/suffix adornment)
   ──────────────────────────────────────────────────────────────────────── */

type NativeInputProps = Omit<React.ComponentProps<'input'>, 'prefix'>;

export interface TextFieldProps extends NativeInputProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  /** leading adornment (ไอคอน/ข้อความ เช่น ฿) */
  prefix?: React.ReactNode;
  /** trailing adornment */
  suffix?: React.ReactNode;
  /** class ของ wrapper ชั้นนอก (Field) */
  containerClassName?: string;
}

function useFieldAria(id: string | undefined, hint: React.ReactNode, error: React.ReactNode) {
  const reactId = React.useId();
  const fieldId = id ?? reactId;
  const hasError = error != null && error !== false;
  const describedBy = hasError
    ? `${fieldId}-error`
    : hint != null
      ? `${fieldId}-hint`
      : undefined;
  return { fieldId, hasError, describedBy };
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, required, prefix, suffix, id, className, containerClassName, ...props },
  ref,
) {
  const { fieldId, hasError, describedBy } = useFieldAria(id, hint, error);

  const input = (
    <BaseInput
      ref={ref}
      id={fieldId}
      aria-invalid={hasError || undefined}
      aria-describedby={describedBy}
      className={cn(prefix != null && 'pl-9', suffix != null && 'pr-9', className)}
      {...props}
    />
  );

  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={fieldId} className={containerClassName}>
      {prefix != null || suffix != null ? (
        <div className="relative flex items-center">
          {prefix != null && (
            <span className="pointer-events-none absolute left-3 flex items-center text-foreground-subtle [&_svg]:size-4">
              {prefix}
            </span>
          )}
          {input}
          {suffix != null && (
            <span className="absolute right-3 flex items-center text-foreground-subtle [&_svg]:size-4">
              {suffix}
            </span>
          )}
        </div>
      ) : (
        input
      )}
    </Field>
  );
});

/* ────────────────────────────────────────────────────────────────────────
   TextareaField — Field + <textarea>
   ──────────────────────────────────────────────────────────────────────── */

export interface TextareaFieldProps extends React.ComponentProps<'textarea'> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  containerClassName?: string;
}

export const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(function TextareaField(
  { label, hint, error, required, id, className, containerClassName, ...props },
  ref,
) {
  const { fieldId, hasError, describedBy } = useFieldAria(id, hint, error);
  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={fieldId} className={containerClassName}>
      <BaseTextarea
        ref={ref}
        id={fieldId}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        className={className}
        {...props}
      />
    </Field>
  );
});
