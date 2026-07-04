import type { CSSProperties, ReactNode } from 'react';

export interface SummaryCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  prefix?: ReactNode;
  color?: string;
  formatter?: (value: number | string) => ReactNode;
  style?: CSSProperties;
}

export function SummaryCard({ title, value, suffix, prefix, color, formatter, style }: SummaryCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-xs" style={style}>
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="mt-1 flex items-baseline gap-1 text-xl font-semibold text-foreground" style={{ color }}>
        {prefix}
        <span>{formatter ? formatter(value) : value}</span>
        {suffix && <span className="text-sm font-normal text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}
