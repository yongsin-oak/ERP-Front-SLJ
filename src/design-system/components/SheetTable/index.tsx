import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Tooltip } from '../Tooltip';
import { Text } from '../Typography';
import type { SheetData } from '../DropZoneSheet';
import { cn } from '@/lib/utils';

const ROW_HEIGHT = 38;
const COL_WIDTH = 150;
const ROW_NUM_WIDTH = 52;
const DEFAULT_MAX_HEIGHT = 480;

export interface SheetTableProps {
  data: SheetData;
  /** Row index (0-based) → list of error messages for that row */
  errors?: Record<number, string[]>;
  maxHeight?: number;
}

export function SheetTable({ data, errors = {}, maxHeight = DEFAULT_MAX_HEIGHT }: SheetTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { headers, rows } = data;
  const minWidth = ROW_NUM_WIDTH + headers.length * COL_WIDTH;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto rounded-md border border-border bg-background"
      style={{ height: maxHeight }}
    >
      {/* Sticky header */}
      <div
        className="sticky top-0 z-2 flex border-b-2 border-border bg-muted"
        style={{ minWidth, height: ROW_HEIGHT }}
      >
        <div
          className="flex h-full shrink-0 items-center justify-end border-r border-border px-2 text-xs font-semibold text-foreground-subtle"
          style={{ width: ROW_NUM_WIDTH }}
        >
          #
        </div>
        {headers.map((h) => (
          <div
            key={h}
            title={h}
            className="flex h-full shrink-0 items-center truncate border-r border-divider px-3 text-xs font-semibold text-muted-foreground"
            style={{ width: COL_WIDTH }}
          >
            {h}
          </div>
        ))}
      </div>

      {/* Virtual rows */}
      <div className="relative" style={{ minWidth, height: rowVirtualizer.getTotalSize() }}>
        {rowVirtualizer.getVirtualItems().map((vRow) => {
          const row = rows[vRow.index];
          const rowErrors = errors[vRow.index];
          const hasError = rowErrors !== undefined;

          return (
            <div
              key={vRow.key}
              className={cn(
                'absolute top-0 left-0 flex border-b border-divider',
                hasError ? 'bg-error-bg hover:bg-error-border/30' : 'bg-background hover:bg-accent',
              )}
              style={{ minWidth, height: ROW_HEIGHT, transform: `translateY(${vRow.start}px)` }}
            >
              <div
                className={cn(
                  'flex h-full shrink-0 items-center justify-end border-r border-border px-2 text-xs',
                  hasError ? 'text-error-text' : 'text-foreground-subtle',
                )}
                style={{ width: ROW_NUM_WIDTH }}
              >
                {hasError ? (
                  <Tooltip title={rowErrors.join(' · ')} placement="right">
                    <Text size="xs" className="cursor-help text-error-text">
                      {vRow.index + 1}
                    </Text>
                  </Tooltip>
                ) : (
                  vRow.index + 1
                )}
              </div>
              {headers.map((h) => {
                const cellVal = String(row[h] ?? '');
                return (
                  <div
                    key={h}
                    title={cellVal}
                    className="flex h-full shrink-0 items-center truncate border-r border-divider px-3 text-sm text-foreground"
                    style={{ width: COL_WIDTH }}
                  >
                    {cellVal}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
