import { Badge as AntBadge } from 'antd';
import type { BadgeProps as AntBadgeProps } from 'antd';

export interface BadgeProps extends AntBadgeProps {}

export function Badge(props: BadgeProps) {
  return <AntBadge {...props} />;
}
