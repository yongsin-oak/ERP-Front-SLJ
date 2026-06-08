import { Flex } from 'antd';
import type { ReactNode } from 'react';
import { colors, spacing } from '../../tokens';
import { Title } from '../Typography';

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <Flex align="center" justify="space-between" style={{ marginBottom: spacing[4] }}>
      <div>
        <Title level={4} style={{ margin: 0 }}>
          {title}
        </Title>
        {subtitle && (
          <p style={{ margin: 0, color: colors.text.tertiary, fontSize: 13 }}>{subtitle}</p>
        )}
      </div>
      {actions && <Flex gap={spacing[2]}>{actions}</Flex>}
    </Flex>
  );
}
