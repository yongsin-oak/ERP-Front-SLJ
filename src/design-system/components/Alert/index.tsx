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
const STYLE: Record<AlertType, { box: string; icon: string; Icon: typeof IconInfoCircle }> = {
  success: { box: 'bg-success-bg border-success-border', icon: 'text-success', Icon: IconCircleCheck },
  info:    { box: 'bg-info-bg border-info-border',       icon: 'text-info',    Icon: IconInfoCircle },
  warning: { box: 'bg-warning-bg border-warning-border', icon: 'text-warning', Icon: IconAlertTriangle },
  error:   { box: 'bg-error-bg border-error-border',     icon: 'text-error',   Icon: IconCircleX },
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
      className={cn('flex items-start gap-2 rounded-md border px-3 py-2 text-sm', s.box, className)}
      {...props}
    >
      {showIcon && <s.Icon size={18} className={cn('mt-px shrink-0', s.icon)} />}
      <div className="min-w-0 flex-1">
        {head != null && <div className="font-medium text-foreground">{head}</div>}
        {description != null && (
          <div className="mt-0.5 text-[13px] text-muted-foreground">{description}</div>
        )}
      </div>
      {action != null && <div className="shrink-0">{action}</div>}
    </div>
  );
}
