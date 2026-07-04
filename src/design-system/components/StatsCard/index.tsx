import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '../Typography';
import { AppIcons } from '../../icons';
import { cn } from '@/lib/utils';

export interface StatsCardProps {
  label: string;
  value: string | number | null | undefined;
  /** Percentage change — positive = up, negative = down */
  delta?: number;
  deltaLabel?: string;
  prefix?: ReactNode;
  suffix?: string;
  icon?: ReactNode;
  loading?: boolean;
  onClick?: () => void;
}

const DELTA_CLASS = {
  up: 'bg-success-bg text-success-text',
  down: 'bg-error-bg text-error-text',
  neutral: 'bg-muted text-muted-foreground',
} as const;

export function StatsCard({
  label,
  value,
  delta,
  deltaLabel,
  prefix,
  suffix,
  icon,
  loading = false,
  onClick,
}: StatsCardProps) {
  const dir = delta == null ? 'neutral' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral';
  const DeltaIcon = dir === 'up' ? AppIcons.arrowUp : dir === 'down' ? AppIcons.arrowDown : AppIcons.minus;
  const clickable = Boolean(onClick);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-5 shadow-sm">
        <Skeleton className="mb-3 h-4 w-24" />
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border border-border bg-card px-6 py-5 shadow-sm transition-[box-shadow,border-color] duration-150',
        clickable && 'cursor-pointer hover:border-border-strong hover:shadow-md',
      )}
    >
      <div className="flex items-start justify-between">
        <Text size="sm" type="secondary" className="mb-2 block">
          {label}
        </Text>
        {icon && <span className="text-xl text-foreground-subtle">{icon}</span>}
      </div>

      <div className="text-3xl font-bold leading-tight tracking-tight text-foreground">
        {prefix && <span className="mr-0.5 text-lg font-medium">{prefix}</span>}
        {value ?? '—'}
        {suffix && <span className="ml-1 text-base font-normal text-muted-foreground">{suffix}</span>}
      </div>

      {delta != null && (
        <div className="mt-2 flex items-center gap-1">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium',
              DELTA_CLASS[dir],
            )}
          >
            <DeltaIcon className="size-3.5" />
            {Math.abs(delta).toFixed(1)}%
          </span>
          {deltaLabel && (
            <Text size="xs" type="secondary">
              {deltaLabel}
            </Text>
          )}
        </div>
      )}
    </div>
  );
}
