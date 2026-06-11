import type React from 'react';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import { colors, spacing } from '../../tokens';

// ── DateCell ────────────────────────────────────────────────
interface DateCellProps {
  value?: string | null;
  format?: string;
}

export function DateCell({ value, format = 'DD/MM/YYYY HH:mm' }: DateCellProps) {
  if (!value) return <>—</>;
  return <>{dayjs(value).format(format)}</>;
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
const CodeEl = styled.code`
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 12px;
  background: ${colors.neutral[100]};
  padding: 1px ${spacing[1]};
  border-radius: 3px;
  color: ${colors.text.primary};
`;

interface CodeCellProps {
  children: string;
  style?: React.CSSProperties;
  className?: string;
}

export function CodeCell({ children, style, className }: CodeCellProps) {
  return <CodeEl style={style} className={className}>{children}</CodeEl>;
}

// ── QuantityCell ─────────────────────────────────────────────
interface QuantityCellProps {
  value?: number | null;
  unit?: string;
  lowThreshold?: number;
  criticalThreshold?: number;
}

const LOW_COLOR = colors.semantic.warning;
const CRITICAL_COLOR = colors.semantic.error;
const OK_COLOR = colors.semantic.success;

export function QuantityCell({ value, unit, lowThreshold = 10, criticalThreshold = 3 }: QuantityCellProps) {
  if (value == null) return <>—</>;

  let color: string = OK_COLOR;
  if (value <= criticalThreshold) color = CRITICAL_COLOR;
  else if (value <= lowThreshold) color = LOW_COLOR;

  return (
    <span style={{ color, fontWeight: value <= lowThreshold ? 600 : 400 }}>
      {value.toLocaleString()}{unit ? ` ${unit}` : ''}
    </span>
  );
}
