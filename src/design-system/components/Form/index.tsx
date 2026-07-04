import * as React from 'react';
import {
  useForm as useRHF,
  FormProvider,
  useFormContext,
  Controller,
  useWatch as useRHFWatch,
} from 'react-hook-form';
import type { FieldValues, UseFormReturn, RegisterOptions } from 'react-hook-form';
import { cn } from '@/lib/utils';

// ── antd-compatible validation rule ─────────────────────────────────────────────

export interface FormRule {
  required?: boolean;
  message?: string;
  pattern?: RegExp;
  min?: number;
  max?: number;
  len?: number;
  type?: 'string' | 'number' | 'email' | 'array';
  whitespace?: boolean;
  validator?: (rule: unknown, value: unknown) => Promise<void> | void;
}

// ── FormInstance (antd-compatible surface over RHF) ──────────────────────────────

export interface FormField {
  name: string;
  value?: unknown;
  errors?: string[];
}

export interface FormInstance<T extends FieldValues = FieldValues> {
  validateFields: () => Promise<T>;
  resetFields: () => void;
  setFieldsValue: (values: Partial<T>) => void;
  setFieldValue: (name: string, value: unknown) => void;
  setFields: (fields: FormField[]) => void;
  getFieldValue: (name: string) => unknown;
  getFieldsValue: () => T;
  submit: () => void;
  /** @internal — kept non-generic so FormInstance<Specific> stays assignable both ways */
  __rhf: UseFormReturn<FieldValues>;
  /** @internal */ __initial: React.MutableRefObject<Partial<FieldValues> | undefined>;
}

function createInstance(
  methods: UseFormReturn<FieldValues>,
  initial: React.MutableRefObject<Partial<FieldValues> | undefined>,
): FormInstance {
  return {
    __rhf: methods,
    __initial: initial,
    validateFields: async () => {
      const ok = await methods.trigger();
      if (!ok) throw new Error('VALIDATION_FAILED');
      return methods.getValues();
    },
    resetFields: () => methods.reset(initial.current ?? {}),
    setFieldsValue: (values) => {
      Object.entries(values).forEach(([k, v]) => methods.setValue(k, v, { shouldDirty: true }));
    },
    setFieldValue: (name, value) => methods.setValue(name, value, { shouldDirty: true }),
    setFields: (fields) => {
      fields.forEach((f) => {
        if (f.value !== undefined) methods.setValue(f.name, f.value, { shouldDirty: true });
        if (f.errors && f.errors.length > 0)
          methods.setError(f.name, { type: 'manual', message: f.errors[0] });
        else methods.clearErrors(f.name);
      });
    },
    getFieldValue: (name) => methods.getValues(name),
    getFieldsValue: () => methods.getValues(),
    submit: () => void methods.handleSubmit(() => {})(),
  };
}

export function useForm<T extends FieldValues = FieldValues>(): [FormInstance<T>] {
  const methods = useRHF();
  const initial = React.useRef<Partial<FieldValues> | undefined>(undefined);
  const inst = React.useMemo(() => createInstance(methods, initial), [methods]);
  return [inst as FormInstance<T>];
}

// ── value extraction from heterogeneous control onChange signatures ─────────────

function isEventLike(v: unknown): v is { target: Record<string, unknown> } {
  return typeof v === 'object' && v !== null && 'target' in v;
}

function extractValue(valuePropName: string, args: unknown[]): unknown {
  const first = args[0];
  if (valuePropName === 'checked') {
    if (typeof first === 'boolean') return first; // Switch(checked, event)
    if (isEventLike(first) && 'checked' in first.target) return first.target.checked;
    return first;
  }
  if (isEventLike(first) && 'value' in first.target) return first.target.value; // Input/TextArea
  return first; // Select / InputNumber / DatePicker pass the value directly
}

function toRHFRules(rules?: FormRule[]): RegisterOptions {
  if (!rules || rules.length === 0) return {};
  const out: RegisterOptions = {};
  const checks: Array<(v: unknown) => true | string | Promise<true | string>> = [];

  for (const r of rules) {
    if (r.required) out.required = r.message ?? 'จำเป็นต้องกรอก';
    if (r.pattern) {
      const re = r.pattern;
      const msg = r.message ?? 'รูปแบบไม่ถูกต้อง';
      checks.push((v) => v == null || v === '' || re.test(String(v)) || msg);
    }
    if (r.type === 'email') {
      const msg = r.message ?? 'อีเมลไม่ถูกต้อง';
      checks.push((v) => v == null || v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v)) || msg);
    }
    if (r.len != null) {
      const len = r.len;
      const msg = r.message ?? `ต้องมี ${len} ตัวอักษร`;
      checks.push((v) => v == null || String(v).length === len || msg);
    }
    if (r.type === 'number' && r.min != null) {
      const min = r.min;
      const msg = r.message ?? `ต้องไม่น้อยกว่า ${min}`;
      checks.push((v) => v == null || Number(v) >= min || msg);
    } else if (r.min != null) {
      const min = r.min;
      const msg = r.message ?? `อย่างน้อย ${min} ตัวอักษร`;
      checks.push((v) => v == null || String(v).length >= min || msg);
    }
    if (r.type === 'number' && r.max != null) {
      const max = r.max;
      const msg = r.message ?? `ต้องไม่เกิน ${max}`;
      checks.push((v) => v == null || Number(v) <= max || msg);
    } else if (r.max != null) {
      const max = r.max;
      const msg = r.message ?? `ไม่เกิน ${max} ตัวอักษร`;
      checks.push((v) => v == null || String(v).length <= max || msg);
    }
    if (r.whitespace) {
      const msg = r.message ?? 'ห้ามเว้นว่าง';
      checks.push((v) => typeof v !== 'string' || v.trim().length > 0 || msg);
    }
    if (r.validator) {
      const fn = r.validator;
      checks.push(async (v) => {
        try {
          await fn({}, v);
          return true;
        } catch (e) {
          return e instanceof Error ? e.message : typeof e === 'string' ? e : 'ไม่ถูกต้อง';
        }
      });
    }
  }

  if (checks.length > 0) {
    out.validate = async (v: unknown) => {
      for (const check of checks) {
        const res = await check(v);
        if (res !== true) return res;
      }
      return true;
    };
  }
  return out;
}

// ── Layout ──────────────────────────────────────────────────────────────────────

type FormLayout = 'vertical' | 'horizontal' | 'inline';
const LayoutContext = React.createContext<FormLayout>('vertical');

// ── Form ─────────────────────────────────────────────────────────────────────────

export interface FormProps<T extends FieldValues = FieldValues> {
  form?: FormInstance<T>;
  layout?: FormLayout;
  initialValues?: Partial<T>;
  onFinish?: (values: T) => void;
  onValuesChange?: (changed: Partial<T>, all: T) => void;
  requiredMark?: boolean | 'optional';
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
}

function FormComp<T extends FieldValues = FieldValues>({
  form,
  layout = 'vertical',
  initialValues,
  onFinish,
  onValuesChange,
  style,
  className,
  children,
}: FormProps<T>) {
  const [fallback] = useForm<T>();
  const inst = form ?? fallback;
  const methods = inst.__rhf;
  const applied = React.useRef(false);

  React.useEffect(() => {
    inst.__initial.current = initialValues;
    if (!applied.current && initialValues) {
      methods.reset({ ...methods.getValues(), ...initialValues } as T);
      applied.current = true;
    }
  }, [inst, initialValues, methods]);

  React.useEffect(() => {
    if (!onValuesChange) return;
    const sub = methods.watch((value, { name }) => {
      const changed = (name ? { [name]: (value as Record<string, unknown>)[name] } : {}) as Partial<T>;
      onValuesChange(changed, value as T);
    });
    return () => sub.unsubscribe();
  }, [methods, onValuesChange]);

  return (
    <LayoutContext.Provider value={layout}>
      <FormProvider {...methods}>
        <form
          noValidate
          style={style}
          className={cn(layout === 'inline' ? 'flex flex-wrap items-start gap-3' : 'flex flex-col gap-4', className)}
          onSubmit={methods.handleSubmit((v) => onFinish?.(v as T))}
        >
          {children}
        </form>
      </FormProvider>
    </LayoutContext.Provider>
  );
}

// ── Form.Item ─────────────────────────────────────────────────────────────────────

export interface FormItemProps {
  name?: string | string[];
  label?: React.ReactNode;
  rules?: FormRule[];
  valuePropName?: string;
  noStyle?: boolean;
  shouldUpdate?: boolean;
  dependencies?: string[];
  hidden?: boolean;
  extra?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode | ((form: FormInstance) => React.ReactNode);
}

interface FieldShellProps {
  label?: React.ReactNode;
  error?: string;
  extra?: React.ReactNode;
  noStyle?: boolean;
  layout: FormLayout;
  htmlFor?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

function FieldShell({ label, error, extra, noStyle, layout, htmlFor, className, style, children }: FieldShellProps) {
  if (noStyle) return <>{children}</>;
  const horizontal = layout === 'horizontal';
  return (
    <div
      style={style}
      className={cn('flex', horizontal ? 'flex-row items-start gap-3' : 'flex-col gap-1.5', className)}
    >
      {label != null && (
        <label
          htmlFor={htmlFor}
          className={cn('text-sm font-medium text-foreground', horizontal && 'w-32 shrink-0 pt-2')}
        >
          {label}
        </label>
      )}
      <div className={cn('flex flex-col gap-1', horizontal && 'flex-1')}>
        {children}
        {error && <span className="text-xs text-error-text">{error}</span>}
        {extra && <span className="text-xs text-muted-foreground">{extra}</span>}
      </div>
    </div>
  );
}

function RenderPropItem({
  render,
}: {
  render: (form: FormInstance) => React.ReactNode;
}) {
  const methods = useFormContext();
  useRHFWatch({ control: methods.control });
  const initial = React.useRef<Partial<FieldValues> | undefined>(undefined);
  const inst = React.useMemo(() => createInstance(methods, initial), [methods]);
  return <>{render(inst)}</>;
}

function FormItem({
  name,
  label,
  rules,
  valuePropName = 'value',
  noStyle,
  hidden,
  extra,
  className,
  style,
  children,
}: FormItemProps) {
  const methods = useFormContext();
  const layout = React.useContext(LayoutContext);
  const path = Array.isArray(name) ? name.join('.') : name;

  if (typeof children === 'function') {
    return <RenderPropItem render={children} />;
  }

  if (hidden) return null;

  if (!path) {
    return (
      <FieldShell label={label} layout={layout} noStyle={noStyle} extra={extra} className={className} style={style}>
        {children}
      </FieldShell>
    );
  }

  return (
    <Controller
      control={methods.control}
      name={path}
      rules={toRHFRules(rules)}
      render={({ field, fieldState }) => {
        const injected: Record<string, unknown> = {
          onChange: (...args: unknown[]) => field.onChange(extractValue(valuePropName, args)),
          onBlur: field.onBlur,
          id: path,
        };
        if (valuePropName === 'checked') injected.checked = field.value ?? false;
        else injected.value = field.value ?? undefined;
        if (fieldState.error) injected.status = 'error';

        const control = React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, injected)
          : children;

        return (
          <FieldShell
            label={label}
            layout={layout}
            noStyle={noStyle}
            error={fieldState.error?.message}
            extra={extra}
            htmlFor={path}
            className={className}
            style={style}
          >
            {control}
          </FieldShell>
        );
      }}
    />
  );
}

// ── Form.useWatch ─────────────────────────────────────────────────────────────────

export function useWatch<T extends FieldValues = FieldValues>(
  name: string | string[] | undefined,
  form: FormInstance<T>,
): T {
  const watchAll = name === undefined || (Array.isArray(name) && name.length === 0);
  return useRHFWatch({
    control: form.__rhf.control,
    name: watchAll ? undefined : (name as never),
  }) as T;
}

export const Form = Object.assign(FormComp, {
  Item: FormItem,
  useForm,
  useWatch,
});
