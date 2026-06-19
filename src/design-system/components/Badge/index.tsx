import * as React from 'react';
import { cn } from '@/lib/utils';

export type BadgeStatus = 'success' | 'error' | 'warning' | 'processing' | 'default';

// semantic tokens (index.css tier 3) — literal classes for tailwind scan
const DOT: Record<BadgeStatus, string> = {
  success: 'bg-success',
  error: 'bg-error',
  warning: 'bg-warning',
  processing: 'bg-info',
  default: 'bg-muted-foreground',
};

export interface BadgeProps extends React.ComponentProps<'span'> {
  status?: BadgeStatus;
  text?: React.ReactNode;
  /** custom dot color override (inline) */
  color?: string;
}

/** Status-dot + text indicator (เทียบเท่า antd `<Badge status text />`) */
export function Badge({ status = 'default', text, color, className, ...props }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm', className)} {...props}>
      <span
        className={cn('inline-block size-1.5 shrink-0 rounded-full', !color && DOT[status])}
        style={color ? { background: color } : undefined}
      />
      {text != null && <span>{text}</span>}
    </span>
  );
}
