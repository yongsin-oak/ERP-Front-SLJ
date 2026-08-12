import type React from 'react';
import dayjs from 'dayjs';
import { cn } from '@/lib/utils';

// ── DateCell ────────────────────────────────────────────────
interface DateCellProps {
  value?: string | null;
  format?: string;
}

// ข้อมูลเชิงรหัส/ตัวเลขในตารางใช้ mono + tabular-nums ให้หลักตรงกันทุกแถว (Supabase pattern)
const NUMERIC = 'font-mono text-[13px] tabular-nums';

export function DateCell({ value, format = 'DD/MM/YYYY HH:mm' }: DateCellProps) {
  if (!value) return <>—</>;
  const d = dayjs(value);
  if (!d.isValid()) return <>—</>;
  return <span className={NUMERIC}>{d.format(format)}</span>;
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
    <span className={NUMERIC}>
      {prefix}
      {value.toLocaleString('th-TH', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
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
      className={cn(
        'rounded-sm border border-border-muted bg-surface-200 px-1.5 py-px font-mono text-xs text-foreground',
        className,
      )}
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
    <span className={cn(NUMERIC, color, value <= lowThreshold && 'font-medium')}>
      {value.toLocaleString()}
      {unit ? ` ${unit}` : ''}
    </span>
  );
}
