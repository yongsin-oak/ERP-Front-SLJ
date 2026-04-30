import { Spin } from 'antd';
import type { SpinProps } from 'antd';
import { Flex } from 'antd';

export interface SpinnerProps extends SpinProps {
  fullPage?: boolean;
}

export function Spinner({ fullPage = false, ...props }: SpinnerProps) {
  if (fullPage) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: '100vh' }}>
        <Spin size="large" {...props} />
      </Flex>
    );
  }
  return (
    <Flex align="center" justify="center" style={{ padding: '40px' }}>
      <Spin {...props} />
    </Flex>
  );
}
