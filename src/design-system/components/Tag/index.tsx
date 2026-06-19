import * as React from 'react';
import { cn } from '@/lib/utils';

export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'default';

const PILL =
  'inline-flex items-center gap-1 rounded-md border px-2 py-px text-xs font-medium leading-5 whitespace-nowrap';

// Semantic status → tailwind tokens (index.css tier 3). Literal classes for tailwind scan.
const STATUS_CLASS: Record<StatusType, string> = {
  success: 'bg-success-bg border-success-border text-success-text',
  warning: 'bg-warning-bg border-warning-border text-warning-text',
  error:   'bg-error-bg border-error-border text-error-text',
  info:    'bg-info-bg border-info-border text-info-text',
  default: 'bg-muted border-border text-muted-foreground',
};

// Categorical "data" palette (antd preset color names) → data tokens (index.css tier 3).
// Literal classes so tailwind emits them; values resolve to --data-* semantic tokens.
const DATA_CLASS: Record<string, string> = {
  red:      'bg-data-red-bg border-data-red-border text-data-red-text',
  volcano:  'bg-data-volcano-bg border-data-volcano-border text-data-volcano-text',
  orange:   'bg-data-orange-bg border-data-orange-border text-data-orange-text',
  gold:     'bg-data-gold-bg border-data-gold-border text-data-gold-text',
  yellow:   'bg-data-yellow-bg border-data-yellow-border text-data-yellow-text',
  lime:     'bg-data-lime-bg border-data-lime-border text-data-lime-text',
  green:    'bg-data-green-bg border-data-green-border text-data-green-text',
  cyan:     'bg-data-cyan-bg border-data-cyan-border text-data-cyan-text',
  blue:     'bg-data-blue-bg border-data-blue-border text-data-blue-text',
  geekblue: 'bg-data-geekblue-bg border-data-geekblue-border text-data-geekblue-text',
  purple:   'bg-data-purple-bg border-data-purple-border text-data-purple-text',
  magenta:  'bg-data-magenta-bg border-data-magenta-border text-data-magenta-text',
  // antd status aliases
  success:  STATUS_CLASS.success,
  error:    STATUS_CLASS.error,
  warning:  STATUS_CLASS.warning,
  processing: 'bg-data-blue-bg border-data-blue-border text-data-blue-text',
  default:  'bg-data-default-bg border-data-default-border text-data-default-text',
};

export interface TagProps extends Omit<React.ComponentProps<'span'>, 'color'> {
  status?: StatusType;
  color?: string;
}

export function Tag({ status, color, className, style, children, ...props }: TagProps) {
  // 1) semantic status → tokens
  if (status) {
    return (
      <span className={cn(PILL, STATUS_CLASS[status], className)} style={style} {...props}>
        {children}
      </span>
    );
  }
  // 2) categorical preset name → data tokens
  const dataClass = color ? DATA_CLASS[color] : undefined;
  if (dataClass) {
    return (
      <span className={cn(PILL, dataClass, className)} style={style} {...props}>
        {children}
      </span>
    );
  }
  // 3) runtime custom color (hex/rgb passed by caller — data, not a hardcoded literal)
  if (color) {
    return (
      <span className={cn(PILL, 'text-primary-foreground', className)} style={{ background: color, borderColor: color, ...style }} {...props}>
        {children}
      </span>
    );
  }
  // 4) fallback
  return (
    <span className={cn(PILL, STATUS_CLASS.default, className)} style={style} {...props}>
      {children}
    </span>
  );
}

// StatusTag — semantic status pill (tailwind tokens)
export interface StatusTagProps {
  status: StatusType;
  children: React.ReactNode;
}

export function StatusTag({ status, children }: StatusTagProps) {
  return <span className={cn(PILL, STATUS_CLASS[status])}>{children}</span>;
}
