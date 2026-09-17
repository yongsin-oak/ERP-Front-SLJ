import * as React from 'react';
import { IconInbox } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export interface EmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  description?: React.ReactNode;
  image?: React.ReactNode;
}

export function Empty({
  description = 'ไม่มีข้อมูล',
  image,
  className,
  children,
  ...props
}: EmptyProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3 px-6 py-14 text-center', className)}
      {...props}
    >
      <div className="relative flex size-20 items-center justify-center rounded-full border border-dashed border-border-stronger bg-surface-100 text-foreground-muted before:absolute before:inset-2 before:rounded-full before:border before:border-border-muted">
        {image ?? <IconInbox className="relative size-8" stroke={1.35} />}
      </div>
      {description != null && <div className="max-w-sm text-sm leading-6 text-foreground-light">{description}</div>}
      {children != null && <div className="mt-2">{children}</div>}
    </div>
  );
}
