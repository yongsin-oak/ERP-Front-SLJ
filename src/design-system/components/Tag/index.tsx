import { Tag as AntTag } from 'antd';
import type { TagProps as AntTagProps } from 'antd';

export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'default';

export interface TagProps extends AntTagProps {
  status?: StatusType;
}

const statusColorMap: Record<StatusType, string> = {
  success: 'green',
  warning: 'orange',
  error: 'red',
  info: 'blue',
  default: 'default',
};

export function Tag({ status, color, ...props }: TagProps) {
  const resolvedColor = status ? statusColorMap[status] : color;
  return <AntTag color={resolvedColor} {...props} />;
}
