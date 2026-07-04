import * as React from 'react';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export type TextSize =
  | 'xs'
  | 'sm'
  | 'base'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | '7xl';

export const TEXT_SIZE: Record<TextSize, number> = {
  xs: 10,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
  '6xl': 36,
  '7xl': 40,
};

type TextType = 'secondary' | 'success' | 'warning' | 'danger';

const TYPE_CLASS: Record<TextType, string> = {
  secondary: 'text-muted-foreground',
  success: 'text-success-text',
  warning: 'text-warning-text',
  danger: 'text-error-text',
};

export interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: TextSize;
  type?: TextType;
  strong?: boolean;
  code?: boolean;
  ellipsis?: boolean;
  copyable?: boolean;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      type="button"
      aria-label="คัดลอก"
      className="text-muted-foreground transition-colors hover:text-primary"
      onClick={() => {
        void navigator.clipboard?.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <IconCheck className="size-3.5" /> : <IconCopy className="size-3.5" />}
    </button>
  );
}

export function Text({
  size,
  type,
  strong,
  code,
  ellipsis,
  copyable,
  className,
  style,
  children,
  ...props
}: TextProps) {
  const content = (
    <span
      className={cn(
        type && TYPE_CLASS[type],
        strong && 'font-semibold',
        code &&
          'rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground',
        ellipsis && 'block truncate',
        className,
      )}
      style={size ? { fontSize: TEXT_SIZE[size], ...style } : style}
      {...props}
    >
      {children}
    </span>
  );

  if (!copyable) return content;
  return (
    <span className="inline-flex items-center gap-1">
      {content}
      <CopyButton value={typeof children === 'string' ? children : String(children ?? '')} />
    </span>
  );
}

type TitleLevel = 1 | 2 | 3 | 4 | 5;

const TITLE_CLASS: Record<TitleLevel, string> = {
  1: 'text-3xl font-semibold',
  2: 'text-2xl font-semibold',
  3: 'text-xl font-semibold',
  4: 'text-lg font-semibold',
  5: 'text-base font-semibold',
};

export interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: TitleLevel;
}

export function Title({ level = 4, className, children, ...props }: TitleProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
  return (
    <Tag className={cn('m-0 leading-tight text-foreground', TITLE_CLASS[level], className)} {...props}>
      {children}
    </Tag>
  );
}

export function PageTitle({ children }: { children: React.ReactNode }) {
  return <Title level={4}>{children}</Title>;
}
