import { Button as AntButton } from 'antd';
import type { ButtonProps as AntButtonProps } from 'antd';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';

export interface ButtonProps extends Omit<AntButtonProps, 'type' | 'danger' | 'variant'> {
  variant?: ButtonVariant;
}

export function Button({ variant = 'secondary', children, ...props }: ButtonProps) {
  const antProps: Partial<AntButtonProps> =
    variant === 'primary' ? { type: 'primary' } :
    variant === 'danger'  ? { type: 'primary', danger: true } :
    variant === 'ghost'   ? { type: 'default', ghost: true } :
    variant === 'link'    ? { type: 'link' } :
                            { type: 'default' };

  return (
    <AntButton {...antProps} {...props}>
      {children}
    </AntButton>
  );
}
