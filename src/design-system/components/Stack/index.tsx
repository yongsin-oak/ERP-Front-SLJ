import * as React from 'react';
import { cn } from '@/lib/utils';

/* ────────────────────────────────────────────────────────────────────────
   Stack / Inline — flex layout primitives (แทน antd Flex / Space)
   gap ใช้ token สเกล Tailwind (4px ต่อหน่วย) · class เป็น literal เพื่อให้ scanner เก็บ
   ──────────────────────────────────────────────────────────────────────── */

type Gap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
type Align = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type Justify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

const GAP: Record<Gap, string> = {
  0: 'gap-0', 1: 'gap-1', 2: 'gap-2', 3: 'gap-3', 4: 'gap-4',
  5: 'gap-5', 6: 'gap-6', 8: 'gap-8', 10: 'gap-10', 12: 'gap-12',
};
const ALIGN: Record<Align, string> = {
  start: 'items-start', center: 'items-center', end: 'items-end',
  stretch: 'items-stretch', baseline: 'items-baseline',
};
const JUSTIFY: Record<Justify, string> = {
  start: 'justify-start', center: 'justify-center', end: 'justify-end',
  between: 'justify-between', around: 'justify-around', evenly: 'justify-evenly',
};

interface BaseFlexProps extends React.ComponentProps<'div'> {
  gap?: Gap;
  align?: Align;
  justify?: Justify;
}

/** Vertical flex column */
export function Stack({ gap, align, justify, className, ...props }: BaseFlexProps) {
  return (
    <div
      className={cn(
        'flex flex-col',
        gap != null && GAP[gap],
        align && ALIGN[align],
        justify && JUSTIFY[justify],
        className,
      )}
      {...props}
    />
  );
}

export interface InlineProps extends BaseFlexProps {
  /** ขึ้นบรรทัดใหม่เมื่อพื้นที่ไม่พอ (default: true) */
  wrap?: boolean;
}

/** Horizontal flex row (center-aligned by default) */
export function Inline({ gap = 2, align = 'center', justify, wrap = true, className, ...props }: InlineProps) {
  return (
    <div
      className={cn(
        'flex flex-row',
        wrap && 'flex-wrap',
        GAP[gap],
        ALIGN[align],
        justify && JUSTIFY[justify],
        className,
      )}
      {...props}
    />
  );
}

export type { Gap as StackGap, Align as StackAlign, Justify as StackJustify };
