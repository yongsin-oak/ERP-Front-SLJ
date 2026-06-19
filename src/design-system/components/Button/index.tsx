import * as React from 'react';
import { IconLoader2 } from '@tabler/icons-react';
import { Button as ShadButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'        // ปุ่มแดงทึบ — ใช้กับ action เด่นชัด
  | 'danger-ghost'  // outline แดง — เหมาะใน table row action
  | 'ghost'         // text/transparent — ปุ่ม icon-only ในตาราง
  | 'link';

/** antd-compatible size names — คงไว้เพื่อไม่ต้องแก้ผู้เรียก ~96 จุด */
type ButtonSize = 'small' | 'middle' | 'large' | 'default';

export interface ButtonProps extends Omit<React.ComponentProps<'button'>, 'type'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  loading?: boolean;
  block?: boolean;
  htmlType?: 'button' | 'submit' | 'reset';
}

const VARIANT_MAP: Record<ButtonVariant, { variant: React.ComponentProps<typeof ShadButton>['variant']; className?: string }> = {
  primary: { variant: 'default' },
  secondary: { variant: 'outline' },
  danger: { variant: 'destructive' },
  'danger-ghost': { variant: 'outline', className: 'border-destructive/30 text-destructive hover:bg-error-bg hover:text-destructive active:bg-error-border/40' },
  ghost: { variant: 'ghost' },
  link: { variant: 'link' },
};

const SIZE_MAP = { small: 'sm', middle: 'default', large: 'lg', default: 'default' } as const;
const ICON_SIZE_MAP = { small: 'icon-sm', middle: 'icon', large: 'icon-lg', default: 'icon' } as const;

export function Button({
  variant = 'secondary',
  size = 'middle',
  icon,
  loading = false,
  block = false,
  htmlType = 'button',
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const v = VARIANT_MAP[variant];
  const iconOnly = (icon != null || loading) && children == null;
  const shadSize = iconOnly ? ICON_SIZE_MAP[size] : SIZE_MAP[size];
  const leading = loading ? <IconLoader2 className="animate-spin" /> : icon;

  return (
    <ShadButton
      type={htmlType}
      variant={v.variant}
      size={shadSize}
      disabled={disabled || loading}
      className={cn(block && 'w-full', v.className, className)}
      {...props}
    >
      {leading}
      {children}
    </ShadButton>
  );
}
