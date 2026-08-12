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
    <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-none" style={style}>
      <div className="text-xs text-foreground-light">{title}</div>
      <div className="mt-1 flex items-baseline gap-1 font-mono text-xl font-medium text-foreground" style={{ color }}>
        {prefix}
        <span>{formatter ? formatter(value) : value}</span>
        {suffix && <span className="font-sans text-sm font-normal text-foreground-light">{suffix}</span>}
      </div>
    </div>
  );
}
