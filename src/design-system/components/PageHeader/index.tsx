import type { ReactNode } from 'react';
import { Title } from '../Typography';

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div>
        <Title level={4}>{title}</Title>
        {subtitle && <p className="m-0 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
