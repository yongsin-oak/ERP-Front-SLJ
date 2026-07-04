import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'horizontal' | 'vertical';
  orientation?: 'left' | 'center' | 'right';
  dashed?: boolean;
  plain?: boolean;
}

export function Divider({
  type = 'horizontal',
  orientation = 'center',
  dashed,
  plain,
  className,
  style,
  children,
  ...props
}: DividerProps) {
  if (type === 'vertical') {
    return (
      <span
        role="separator"
        className={cn('mx-2 inline-block h-[0.9em] w-px align-middle bg-divider', className)}
        style={style}
        {...props}
      />
    );
  }

  const line = (grow: string) => (
    <span
      className={cn(
        grow,
        dashed ? 'border-t border-dashed border-divider' : 'h-px bg-divider',
      )}
    />
  );

  if (children != null) {
    return (
      <div
        role="separator"
        className={cn(
          'my-4 flex items-center gap-3 text-sm',
          plain ? 'font-normal text-muted-foreground' : 'font-medium text-foreground',
          className,
        )}
        style={style}
        {...props}
      >
        {orientation !== 'left' && line(orientation === 'right' ? 'w-[5%] min-w-6 shrink-0' : 'flex-1')}
        <span className="min-w-0 truncate">{children}</span>
        {orientation !== 'right' && line(orientation === 'left' ? 'w-[5%] min-w-6 shrink-0' : 'flex-1')}
      </div>
    );
  }

  return (
    <div
      role="separator"
      className={cn(
        'my-4 w-full',
        dashed ? 'border-t border-dashed border-divider' : 'h-px bg-divider',
        className,
      )}
      style={style}
      {...props}
    />
  );
}
