import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  size?: 'small' | 'default';
  bordered?: boolean;
  /** antd v6 styles.body — body padding/overrides */
  styles?: { body?: React.CSSProperties; header?: React.CSSProperties };
}

export function Card({
  title,
  extra,
  size = 'default',
  bordered = true,
  styles,
  className,
  children,
  ...props
}: CardProps) {
  const small = size === 'small';
  return (
    <div
      className={cn(
        'rounded-lg bg-card text-card-foreground',
        bordered && 'border border-border',
        className,
      )}
      {...props}
    >
      {(title != null || extra != null) && (
        <div
          className={cn(
            'flex items-center justify-between border-b border-border font-medium',
            small ? 'px-3 py-2 text-sm' : 'px-6 py-3.5',
          )}
          style={styles?.header}
        >
          <div className="min-w-0">{title}</div>
          {extra != null && <div className="shrink-0 font-normal">{extra}</div>}
        </div>
      )}
      <div className={cn(small ? 'p-3' : 'p-6')} style={styles?.body}>
        {children}
      </div>
    </div>
  );
}
