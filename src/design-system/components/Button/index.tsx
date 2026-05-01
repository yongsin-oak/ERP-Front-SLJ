import { Button as AntButton } from 'antd';
import type { ButtonProps as AntButtonProps } from 'antd';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'        // ปุ่มแดงทึบ — ใช้กับ action เด่นชัด
  | 'danger-ghost'  // outline แดง — เหมาะใน table row action
  | 'ghost'         // text/transparent — ปุ่ม icon-only ในตาราง
  | 'link';

export interface ButtonProps extends Omit<AntButtonProps, 'type' | 'danger' | 'variant'> {
  variant?: ButtonVariant;
}

export function Button({ variant = 'secondary', children, ...props }: ButtonProps) {
  const antProps: Partial<AntButtonProps> =
    variant === 'primary'      ? { type: 'primary' } :
    variant === 'danger'       ? { type: 'primary', danger: true } :
    variant === 'danger-ghost' ? { type: 'default', danger: true } :
    variant === 'ghost'        ? { type: 'text' } :
    variant === 'link'         ? { type: 'link' } :
                                 { type: 'default' };

  return (
    <AntButton {...antProps} {...props}>
      {children}
    </AntButton>
  );
}
