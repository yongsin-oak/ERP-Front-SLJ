import { Flex } from 'antd';
import type { ReactNode } from 'react';
import { Title } from '../Typography';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <Flex align="center" justify="space-between" style={{ marginBottom: 16 }}>
      <div>
        <Title level={4} style={{ margin: 0 }}>
          {title}
        </Title>
        {subtitle && (
          <p style={{ margin: 0, color: 'rgba(0,0,0,0.45)', fontSize: 13 }}>{subtitle}</p>
        )}
      </div>
      {actions && <Flex gap={8}>{actions}</Flex>}
    </Flex>
  );
}
