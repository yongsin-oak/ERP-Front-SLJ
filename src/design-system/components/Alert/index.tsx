import * as React from 'react';
import {
  IconInfoCircle,
  IconCircleCheck,
  IconAlertTriangle,
  IconCircleX,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export type AlertType = 'success' | 'info' | 'warning' | 'error';

// className เป็น literal → tailwind scan เจอ (semantic tokens จาก index.css tier 3)
const STYLE: Record<AlertType, { box: string; icon: string; iconBox: string; Icon: typeof IconInfoCircle }> = {
  success: { box: 'border-success-border bg-success-bg/55 border-l-success', icon: 'text-success-text', iconBox: 'bg-success-bg ring-success-border', Icon: IconCircleCheck },
  info:    { box: 'border-info-border bg-info-bg/55 border-l-info', icon: 'text-info-text', iconBox: 'bg-info-bg ring-info-border', Icon: IconInfoCircle },
  warning: { box: 'border-warning-border bg-warning-bg/65 border-l-warning', icon: 'text-warning-text', iconBox: 'bg-warning-bg ring-warning-border', Icon: IconAlertTriangle },
  error:   { box: 'border-error-border bg-error-bg/60 border-l-error', icon: 'text-error-text', iconBox: 'bg-error-bg ring-error-border', Icon: IconCircleX },
};

export interface AlertProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  type?: AlertType;
  message?: React.ReactNode;
  /** alias for message (antd compat) */
  title?: React.ReactNode;
  description?: React.ReactNode;
  showIcon?: boolean;
  action?: React.ReactNode;
}

export function Alert({
  type = 'info',
  message,
  title,
  description,
  showIcon = false,
  action,
  className,
  ...props
}: AlertProps) {
  const s = STYLE[type];
  const head = message ?? title;
  return (
    <div
      role="alert"
      data-feedback={type}
      className={cn('flex items-start gap-3 rounded-lg border border-l-[3px] px-3.5 py-3 text-sm', s.box, className)}
      {...props}
    >
      {showIcon && (
        <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-full ring-1 ring-inset', s.iconBox)}>
          <s.Icon className={cn('size-4', s.icon)} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        {head != null && <div className="font-semibold leading-6 text-foreground">{head}</div>}
        {description != null && (
          <div className="mt-0.5 text-sm leading-5 text-foreground-light">{description}</div>
        )}
      </div>
      {action != null && <div className="shrink-0">{action}</div>}
    </div>
  );
}
