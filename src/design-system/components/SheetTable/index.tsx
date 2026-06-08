import { useRef } from 'react';
import styled from '@emotion/styled';
import { Tooltip } from 'antd';
import { useVirtualizer } from '@tanstack/react-virtual';
import { colors, spacing, radius } from '../../tokens';
import { Text } from '../Typography';
import type { SheetData } from '../DropZoneSheet';

// ── Constants ─────────────────────────────────────────────────────────────────

const ROW_HEIGHT = 38;
const COL_WIDTH = 150;
const ROW_NUM_WIDTH = 52;
const DEFAULT_MAX_HEIGHT = 480;

// ── Styled components ─────────────────────────────────────────────────────────

const Container = styled.div<{ $height: number }>`
  height: ${({ $height }) => $height}px;
  overflow: auto;
  border: 1px solid ${colors.border.default};
  border-radius: ${radius.md};
  position: relative;
  background: ${colors.bg.base};
`;

const StickyHeader = styled.div<{ $minWidth: number }>`
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  min-width: ${({ $minWidth }) => $minWidth}px;
  height: ${ROW_HEIGHT}px;
  background: ${colors.bg.layout};
  border-bottom: 2px solid ${colors.border.default};
`;

const VirtualArea = styled.div<{ $minWidth: number }>`
  position: relative;
  min-width: ${({ $minWidth }) => $minWidth}px;
`;

const Row = styled.div<{ $error: boolean; $minWidth: number }>`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  height: ${ROW_HEIGHT}px;
  min-width: ${({ $minWidth }) => $minWidth}px;
  background: ${({ $error }) => ($error ? colors.semantic.errorBg : colors.bg.base)};
  border-bottom: 1px solid ${colors.border.subtle};

  &:hover {
    background: ${({ $error }) => ($error ? '#ffe4e4' : '#f9fafb')};
  }
`;

const RowNumCell = styled.div<{ $header?: boolean; $error?: boolean }>`
  width: ${ROW_NUM_WIDTH}px;
  min-width: ${ROW_NUM_WIDTH}px;
  height: 100%;
  padding: 0 ${spacing[2]};
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 12px;
  font-weight: ${({ $header }) => ($header ? 600 : 400)};
  color: ${({ $error }) => ($error ? colors.semantic.errorText : colors.text.tertiary)};
  border-right: 1px solid ${colors.border.default};
  flex-shrink: 0;
  background: ${({ $header }) => ($header ? colors.bg.layout : 'transparent')};
`;

const HeaderCell = styled.div`
  width: ${COL_WIDTH}px;
  min-width: ${COL_WIDTH}px;
  height: 100%;
  padding: 0 ${spacing[3]};
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  color: ${colors.text.secondary};
  border-right: 1px solid ${colors.border.subtle};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
`;

const DataCell = styled.div<{ $error?: boolean }>`
  width: ${COL_WIDTH}px;
  min-width: ${COL_WIDTH}px;
  height: 100%;
  padding: 0 ${spacing[3]};
  display: flex;
  align-items: center;
  font-size: 13px;
  color: ${({ $error }) => ($error ? colors.semantic.errorText : colors.text.primary)};
  border-right: 1px solid ${colors.border.subtle};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
  cursor: default;
`;

// ── Main component ────────────────────────────────────────────────────────────

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
    <Container ref={containerRef} $height={maxHeight}>
      {/* Sticky header */}
      <StickyHeader $minWidth={minWidth}>
        <RowNumCell $header>#</RowNumCell>
        {headers.map(h => (
          <HeaderCell key={h} title={h}>{h}</HeaderCell>
        ))}
      </StickyHeader>

      {/* Virtual rows */}
      <VirtualArea
        $minWidth={minWidth}
        style={{ height: rowVirtualizer.getTotalSize() }}
      >
        {rowVirtualizer.getVirtualItems().map(vRow => {
          const row = rows[vRow.index];
          const rowErrors = errors[vRow.index];
          const hasError = rowErrors !== undefined;

          return (
            <Row
              key={vRow.key}
              $error={hasError}
              $minWidth={minWidth}
              style={{ transform: `translateY(${vRow.start}px)` }}
            >
              <RowNumCell $error={hasError}>
                {hasError ? (
                  <Tooltip title={rowErrors.join(' · ')} placement="right">
                    <Text size="xs" style={{ color: colors.semantic.errorText, cursor: 'help' }}>
                      {vRow.index + 1}
                    </Text>
                  </Tooltip>
                ) : (
                  vRow.index + 1
                )}
              </RowNumCell>
              {headers.map(h => {
                const cellVal = String(row[h] ?? '');
                return (
                  <DataCell key={h} title={cellVal}>
                    {cellVal}
                  </DataCell>
                );
              })}
            </Row>
          );
        })}
      </VirtualArea>
    </Container>
  );
}
