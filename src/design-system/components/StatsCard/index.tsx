import type { ReactNode } from 'react';
import styled from '@emotion/styled';
import { Flex } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';
import { colors, spacing, radius, shadow } from '../../tokens';
import { Text } from '../Typography';

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Styled ────────────────────────────────────────────────────────────────────

const Card = styled.div<{ $clickable: boolean }>`
  background: ${colors.bg.base};
  border: 1px solid ${colors.border.default};
  border-radius: ${radius.xl};
  box-shadow: ${shadow.sm};
  padding: ${spacing[5]} ${spacing[6]};
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  transition: box-shadow 0.15s, border-color 0.15s;

  ${({ $clickable }) => $clickable && `
    &:hover {
      box-shadow: ${shadow.md};
      border-color: ${colors.border.strong};
    }
  `}
`;

const ValueText = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${colors.text.primary};
  line-height: 1.2;
  letter-spacing: -0.5px;
`;

const DeltaBadge = styled.span<{ $dir: 'up' | 'down' | 'neutral' }>`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: ${radius.full};
  background: ${({ $dir }) =>
    $dir === 'up'
      ? colors.semantic.successBg
      : $dir === 'down'
      ? colors.semantic.errorBg
      : colors.neutral[100]};
  color: ${({ $dir }) =>
    $dir === 'up'
      ? colors.semantic.successText
      : $dir === 'down'
      ? colors.semantic.errorText
      : colors.text.tertiary};
`;

// ── Component ─────────────────────────────────────────────────────────────────

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
  const DeltaIcon =
    dir === 'up' ? ArrowUpOutlined : dir === 'down' ? ArrowDownOutlined : MinusOutlined;

  if (loading) {
    return (
      <Card $clickable={false}>
        <Skeleton active paragraph={{ rows: 2 }} title={false} />
      </Card>
    );
  }

  return (
    <Card $clickable={Boolean(onClick)} onClick={onClick}>
      <Flex justify="space-between" align="flex-start">
        <Text size="sm" type="secondary" style={{ marginBottom: spacing[2], display: 'block' }}>
          {label}
        </Text>
        {icon && (
          <span style={{ fontSize: 20, color: colors.text.tertiary }}>{icon}</span>
        )}
      </Flex>

      <ValueText>
        {prefix && <span style={{ fontSize: 18, fontWeight: 500, marginRight: 2 }}>{prefix}</span>}
        {value ?? '—'}
        {suffix && <span style={{ fontSize: 16, fontWeight: 400, marginLeft: 4, color: colors.text.secondary }}>{suffix}</span>}
      </ValueText>

      {delta != null && (
        <Flex align="center" gap={spacing[1]} style={{ marginTop: spacing[2] }}>
          <DeltaBadge $dir={dir}>
            <DeltaIcon />
            {Math.abs(delta).toFixed(1)}%
          </DeltaBadge>
          {deltaLabel && (
            <Text size="xs" type="secondary">{deltaLabel}</Text>
          )}
        </Flex>
      )}
    </Card>
  );
}
