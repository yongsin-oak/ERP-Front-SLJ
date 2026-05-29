import { Typography as AntTypography } from 'antd';
import type { TextProps } from 'antd/es/typography/Text';
import type { TitleProps } from 'antd/es/typography/Title';

const { Text: AntText, Title: AntTitle } = AntTypography;

export type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';

export const TEXT_SIZE: Record<TextSize, number> = {
  xs:   10,
  sm:   12,
  base: 14,
  lg:   16,
  xl:   18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
  '6xl': 36,
  '7xl': 40,
};

interface ExtendedTextProps extends TextProps {
  size?: TextSize;
}

export function Text({ size, style, ...props }: ExtendedTextProps) {
  return <AntText style={size ? { fontSize: TEXT_SIZE[size], ...style } : style} {...props} />;
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
