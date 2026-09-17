import * as React from 'react';
import { Spinner as UISpinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

const SIZE_MAP = { small: 'sm', default: 'md', large: 'lg' } as const;

export interface SpinnerProps {
  fullPage?: boolean;
  size?: 'small' | 'default' | 'large';
  tip?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Spinner({ fullPage = false, size = 'default', tip, className, style }: SpinnerProps) {
  const spinnerSize = fullPage && size === 'default' ? 'lg' : SIZE_MAP[size];
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullPage ? 'min-h-screen' : 'p-10',
        className,
      )}
      style={style}
    >
      <span className="flex size-11 items-center justify-center rounded-full border border-border bg-background shadow-card">
        <UISpinner size={spinnerSize} className="text-primary" />
      </span>
      {tip != null && <span className="animate-pulse text-sm font-medium text-foreground-light">{tip}</span>}
    </div>
  );
}
