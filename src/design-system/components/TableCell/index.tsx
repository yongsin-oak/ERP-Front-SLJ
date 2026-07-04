import type React from 'react';
import dayjs from 'dayjs';
import { cn } from '@/lib/utils';

// ── DateCell ────────────────────────────────────────────────
interface DateCellProps {
  value?: string | null;
  format?: string;
}

export function DateCell({ value, format = 'DD/MM/YYYY HH:mm' }: DateCellProps) {
  if (!value) return <>—</>;
  const d = dayjs(value);
  if (!d.isValid()) return <>—</>;
  return <>{d.format(format)}</>;
}

// ── MoneyCell ───────────────────────────────────────────────
interface MoneyCellProps {
  value?: number | null;
  decimals?: number;
  prefix?: string;
}

export function MoneyCell({ value, decimals = 2, prefix = '฿' }: MoneyCellProps) {
  if (value == null) return <>—</>;
  return (
    <>
      {prefix}
      {value.toLocaleString('th-TH', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </>
  );
}

// ── CodeCell ────────────────────────────────────────────────
interface CodeCellProps {
  children: string;
  style?: React.CSSProperties;
  className?: string;
}

export function CodeCell({ children, style, className }: CodeCellProps) {
  return (
    <code
      style={style}
      className={cn('rounded-sm bg-muted px-1 py-px font-mono text-xs text-foreground', className)}
    >
      {children}
    </code>
  );
}

// ── QuantityCell ─────────────────────────────────────────────
interface QuantityCellProps {
  value?: number | null;
  unit?: string;
  lowThreshold?: number;
  criticalThreshold?: number;
}

export function QuantityCell({
  value,
  unit,
  lowThreshold = 10,
  criticalThreshold = 3,
}: QuantityCellProps) {
  if (value == null) return <>—</>;

  const color =
    value <= criticalThreshold
      ? 'text-error-text'
      : value <= lowThreshold
        ? 'text-warning-text'
        : 'text-success-text';

  return (
    <span className={cn(color, value <= lowThreshold && 'font-semibold')}>
      {value.toLocaleString()}
      {unit ? ` ${unit}` : ''}
    </span>
  );
}
