import * as React from 'react';
import { cn } from '@/lib/utils';

/* ────────────────────────────────────────────────────────────────────────
   Grid — responsive CSS grid (แทน antd Row/Col + COL_PROPS)
   `cols` = จำนวนคอลัมน์สูงสุด (responsive ขึ้นเองตาม breakpoint) · gap เป็น token Tailwind
   ──────────────────────────────────────────────────────────────────────── */

type Gap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8;
type Cols = 1 | 2 | 3 | 4 | 6;

const GAP: Record<Gap, string> = {
  0: 'gap-0', 1: 'gap-1', 2: 'gap-2', 3: 'gap-3', 4: 'gap-4', 5: 'gap-5', 6: 'gap-6', 8: 'gap-8',
};

// responsive ladder: มือถือ 1 คอลัมน์ → ขยายตาม breakpoint จนถึง cols
const COLS: Record<Cols, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
};

export interface GridProps extends React.ComponentProps<'div'> {
  cols?: Cols;
  gap?: Gap;
}

export function Grid({ cols = 3, gap = 4, className, ...props }: GridProps) {
  return (
    <div className={cn('grid', COLS[cols], GAP[gap], className)} {...props} />
  );
}

export type { Cols as GridCols, Gap as GridGap };
