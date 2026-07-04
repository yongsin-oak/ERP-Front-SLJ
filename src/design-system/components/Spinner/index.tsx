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
      <UISpinner size={spinnerSize} className="text-primary" />
      {tip != null && <span className="text-sm text-muted-foreground">{tip}</span>}
    </div>
  );
}
