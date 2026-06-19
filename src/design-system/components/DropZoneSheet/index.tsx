import { useState, useCallback, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import styled from '@emotion/styled';
import { Flex } from 'antd';
import * as XLSX from 'xlsx';
import { colors, spacing, radius, shadow } from '../../tokens';
import { Text } from '../Typography';
import { Button } from '../Button';
import { AppIcons } from '../../icons';

// ── Shared types ─────────────────────────────────────────────────────────────

export interface SheetData {
  fileName: string;
  headers: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PREVIEW_ROWS = 5;
const DEFAULT_WARN_ROWS = 10_000;

// ── Styled components ─────────────────────────────────────────────────────────

const Zone = styled.div<{ $active: boolean; $disabled: boolean }>`
  border: 2px dashed ${({ $active }) => ($active ? colors.brand.primary : colors.border.default)};
  border-radius: ${radius.lg};
  background: ${({ $active }) => ($active ? colors.brand.light : colors.bg.layout)};
  padding: ${spacing[10]} ${spacing[6]};
  text-align: center;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  transition: border-color 0.15s, background 0.15s;
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};

  &:hover {
    border-color: ${colors.brand.primary};
    background: ${colors.brand.light};
  }
`;

const FileCard = styled.div`
  border: 1px solid ${colors.border.default};
  border-radius: ${radius.lg};
  background: ${colors.bg.base};
  box-shadow: ${shadow.sm};
  padding: ${spacing[4]};
`;

const PreviewWrap = styled.div`
  overflow-x: auto;
  margin-top: ${spacing[3]};
  border: 1px solid ${colors.border.default};
  border-radius: ${radius.md};
  font-size: 12px;
`;

const Th = styled.th`
  padding: 6px 10px;
  background: ${colors.bg.layout};
  border-bottom: 1px solid ${colors.border.default};
  font-weight: 600;
  color: ${colors.text.secondary};
  white-space: nowrap;
  text-align: left;
`;

const Td = styled.td`
  padding: 6px 10px;
  border-bottom: 1px solid ${colors.border.subtle};
  color: ${colors.text.primary};
  white-space: nowrap;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// ── Sub-component ─────────────────────────────────────────────────────────────

function PreviewTable({ headers, rows }: { headers: string[]; rows: Record<string, unknown>[] }) {
  return (
    <PreviewWrap>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            {headers.map(h => <Th key={h}>{h}</Th>)}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, PREVIEW_ROWS).map((row, i) => (
            <tr key={i}>
              {headers.map(h => (
                <Td key={h} title={String(row[h] ?? '')}>{String(row[h] ?? '—')}</Td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </PreviewWrap>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export interface DropZoneSheetProps {
  onParsed: (data: SheetData) => void;
  onClear?: () => void;
  warnRows?: number;
  disabled?: boolean;
}

export function DropZoneSheet({
  onParsed,
  onClear,
  warnRows = DEFAULT_WARN_ROWS,
  disabled = false,
}: DropZoneSheetProps) {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<SheetData | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseFile = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);
      try {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null });

        if (json.length === 0) throw new Error('ไฟล์ไม่มีข้อมูล กรุณาตรวจสอบไฟล์');

        const data: SheetData = {
          fileName: file.name,
          headers: Object.keys(json[0]),
          rows: json,
          totalRows: json.length,
        };
        setSheet(data);
        onParsed(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'ไม่สามารถอ่านไฟล์ได้');
      } finally {
        setLoading(false);
      }
    },
    [onParsed],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setActive(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) parseFile(file);
    },
    [disabled, parseFile],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) parseFile(file);
      e.target.value = '';
    },
    [parseFile],
  );

  const handleClear = useCallback(() => {
    setSheet(null);
    setError(null);
    onClear?.();
  }, [onClear]);

  if (sheet) {
    return (
      <div>
        <FileCard>
          <Flex align="center" justify="space-between">
            <Flex align="center" gap={spacing[2]}>
              <AppIcons.excel style={{ fontSize: 22, color: colors.semantic.successText }} />
              <div>
                <Text size="sm" strong>{sheet.fileName}</Text>
                <br />
                <Text size="xs" type="secondary">
                  {sheet.totalRows.toLocaleString()} แถว · {sheet.headers.length} คอลัมน์
                </Text>
              </div>
            </Flex>
            <Button variant="ghost" size="small" icon={<AppIcons.close />} onClick={handleClear}>
              เปลี่ยนไฟล์
            </Button>
          </Flex>

          {sheet.totalRows > warnRows && (
            <Flex
              align="center"
              gap={spacing[1]}
              style={{ marginTop: spacing[2], color: colors.semantic.warningText }}
            >
              <AppIcons.warning />
              <Text size="xs" style={{ color: colors.semantic.warningText }}>
                มีข้อมูลมากกว่า {warnRows.toLocaleString()} แถว การนำเข้าอาจใช้เวลานาน
              </Text>
            </Flex>
          )}
        </FileCard>

        <Text
          size="xs"
          type="secondary"
          style={{ display: 'block', margin: `${spacing[2]} 0 ${spacing[1]}` }}
        >
          ตัวอย่าง {Math.min(PREVIEW_ROWS, sheet.totalRows)} แถวแรก
        </Text>
        <PreviewTable headers={sheet.headers} rows={sheet.rows} />
      </div>
    );
  }

  return (
    <div>
      <Zone
        $active={active}
        $disabled={disabled || loading}
        onClick={() => !disabled && !loading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); if (!disabled) setActive(true); }}
        onDragLeave={() => setActive(false)}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: 'none' }}
          onChange={handleChange}
          disabled={disabled}
        />
        <Flex vertical align="center" gap={spacing[2]}>
          <AppIcons.inbox
            style={{
              fontSize: 40,
              color: loading ? colors.brand.primary : colors.text.tertiary,
            }}
          />
          <div>
            <Text size="sm" strong style={{ color: loading ? colors.brand.primary : colors.text.primary }}>
              {loading ? 'กำลังอ่านไฟล์…' : 'ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือก'}
            </Text>
            <br />
            <Text size="xs" type="secondary">รองรับ .xlsx, .xls, .csv</Text>
          </div>
        </Flex>
      </Zone>

      {error && (
        <Text
          size="xs"
          style={{ color: colors.semantic.errorText, display: 'block', marginTop: spacing[2] }}
        >
          {error}
        </Text>
      )}
    </div>
  );
}
