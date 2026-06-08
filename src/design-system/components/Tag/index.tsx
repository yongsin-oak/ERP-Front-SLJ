import styled from '@emotion/styled';
import { Tag as AntTag } from 'antd';
import type { TagProps as AntTagProps } from 'antd';
import { colors, radius } from '../../tokens';

export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'default';

export interface TagProps extends AntTagProps {
  status?: StatusType;
}

// Maps semantic status → design token hex (bypasses antd preset color names)
const STATUS_STYLE: Record<StatusType, { color: string; bg: string; border: string }> = {
  success: { color: colors.semantic.successText, bg: colors.semantic.successBg, border: colors.semantic.successBorder },
  warning: { color: colors.semantic.warningText, bg: colors.semantic.warningBg, border: colors.semantic.warningBorder },
  error:   { color: colors.semantic.errorText,   bg: colors.semantic.errorBg,   border: colors.semantic.errorBorder },
  info:    { color: colors.semantic.infoText,     bg: colors.semantic.infoBg,    border: colors.semantic.infoBorder },
  default: { color: colors.text.secondary,        bg: colors.neutral[100],       border: colors.border.default },
};

// StatusTag — uses design tokens directly for consistent, WCAG AA text
export interface StatusTagProps {
  status: StatusType;
  children: React.ReactNode;
}

const StyledStatusTag = styled.span<{ $s: (typeof STATUS_STYLE)[StatusType] }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: ${radius.sm};
  font-size: 12px;
  font-weight: 500;
  line-height: 20px;
  color: ${({ $s }) => $s.color};
  background: ${({ $s }) => $s.bg};
  border: 1px solid ${({ $s }) => $s.border};
  white-space: nowrap;
`;

export function StatusTag({ status, children }: StatusTagProps) {
  const s = STATUS_STYLE[status];
  return <StyledStatusTag $s={s}>{children}</StyledStatusTag>;
}

// General Tag — passes through to antd, with status shorthand
export function Tag({ status, color, ...props }: TagProps) {
  if (status) {
    const s = STATUS_STYLE[status];
    return (
      <AntTag
        color={color}
        style={{ color: s.color, background: s.bg, borderColor: s.border }}
        {...props}
      />
    );
  }
  return <AntTag color={color} {...props} />;
}
