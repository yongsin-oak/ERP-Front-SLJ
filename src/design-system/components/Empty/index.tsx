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
      className={cn('flex flex-col items-center justify-center gap-3 py-12 text-center', className)}
      {...props}
    >
      <div className="text-foreground-subtle">
        {image ?? <IconInbox className="size-12" stroke={1.25} />}
      </div>
      {description != null && <div className="text-sm text-muted-foreground">{description}</div>}
      {children != null && <div className="mt-1">{children}</div>}
    </div>
  );
}
