import { Typography as AntTypography } from 'antd';
import type { TextProps } from 'antd/es/typography/Text';
import type { TitleProps } from 'antd/es/typography/Title';

const { Text: AntText, Title: AntTitle } = AntTypography;

export function Text(props: TextProps) {
  return <AntText {...props} />;
}

export function Title({ level = 4, ...props }: TitleProps) {
  return <AntTitle level={level} {...props} />;
}

export function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <AntTitle level={4} style={{ margin: 0 }}>
      {children}
    </AntTitle>
  );
}
